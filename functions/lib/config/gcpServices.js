"use strict";
/**
 * Google Cloud Platform 서비스 통합 설정
 * Firebase와 GCP 서비스 간 연결 관리
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.gcpServiceManager = exports.gcpConfig = exports.GCPServiceManager = void 0;
const storage_1 = require("@google-cloud/storage");
const bigquery_1 = require("@google-cloud/bigquery");
const pubsub_1 = require("@google-cloud/pubsub");
const secret_manager_1 = require("@google-cloud/secret-manager");
const translate_1 = require("@google-cloud/translate");
const speech_1 = require("@google-cloud/speech");
const text_to_speech_1 = require("@google-cloud/text-to-speech");
const kms_1 = require("@google-cloud/kms");
class GCPServiceManager {
    constructor(config) {
        this.config = config;
        this.initializeServices();
    }
    initializeServices() {
        const commonConfig = {
            projectId: this.config.projectId,
            keyFilename: this.config.keyFilename
        };
        // Cloud Storage
        this.storage = new storage_1.Storage(commonConfig);
        // BigQuery
        this.bigQuery = new bigquery_1.BigQuery(commonConfig);
        // Pub/Sub
        this.pubSub = new pubsub_1.PubSub(commonConfig);
        // Secret Manager
        this.secretManager = new secret_manager_1.SecretManagerServiceClient(commonConfig);
        // Translation API
        this.translator = new translate_1.TranslationServiceClient(commonConfig);
        // Speech-to-Text
        this.speechClient = new speech_1.SpeechClient(commonConfig);
        // Text-to-Speech
        this.ttsClient = new text_to_speech_1.TextToSpeechClient(commonConfig);
        // Cloud KMS
        this.kmsClient = new kms_1.KeyManagementServiceClient(commonConfig);
    }
    /**
     * Cloud Storage 버킷 관리
     */
    async createStorageBuckets() {
        const buckets = [
            'maumlog-user-data-us-central1',
            'maumlog-ai-models-us-central1',
            'maumlog-backups-us-central1',
            'maumlog-logs-us-central1'
        ];
        for (const bucketName of buckets) {
            try {
                const [bucket] = await this.storage.createBucket(bucketName, {
                    location: this.config.region,
                    storageClass: 'STANDARD',
                    uniformBucketLevelAccess: { enabled: true },
                    encryption: {
                        defaultKmsKeyName: `projects/${this.config.projectId}/locations/${this.config.region}/keyRings/maumlog-encryption-keys/cryptoKeys/user-data-encryption`
                    },
                    lifecycle: {
                        rule: [
                            {
                                action: { type: 'SetStorageClass', storageClass: 'NEARLINE' },
                                condition: { age: 30 }
                            },
                            {
                                action: { type: 'SetStorageClass', storageClass: 'COLDLINE' },
                                condition: { age: 90 }
                            },
                            {
                                action: { type: 'Delete' },
                                condition: { age: 2555 } // 7년 후 삭제
                            }
                        ]
                    }
                });
                console.log(`Bucket ${bucketName} created successfully`);
            }
            catch (error) {
                if (error.code === 409) {
                    console.log(`Bucket ${bucketName} already exists`);
                }
                else {
                    console.error(`Failed to create bucket ${bucketName}:`, error);
                }
            }
        }
    }
    /**
     * BigQuery 데이터셋 생성
     */
    async createBigQueryDatasets() {
        const datasets = [
            {
                id: 'analytics',
                description: 'User analytics and app usage metrics',
                location: this.config.region
            },
            {
                id: 'ai_training',
                description: 'Data for AI model training and improvement',
                location: this.config.region
            },
            {
                id: 'compliance_logs',
                description: 'Audit logs for compliance and security',
                location: this.config.region
            },
            {
                id: 'performance_metrics',
                description: 'System performance and monitoring data',
                location: this.config.region
            }
        ];
        for (const datasetConfig of datasets) {
            try {
                const [dataset] = await this.bigQuery.createDataset(datasetConfig.id, {
                    location: datasetConfig.location,
                    description: datasetConfig.description,
                    access: [
                        {
                            role: 'WRITER',
                            userByEmail: `firebase-adminsdk@${this.config.projectId}.iam.gserviceaccount.com`
                        }
                    ]
                });
                console.log(`Dataset ${datasetConfig.id} created successfully`);
            }
            catch (error) {
                if (error.code === 409) {
                    console.log(`Dataset ${datasetConfig.id} already exists`);
                }
                else {
                    console.error(`Failed to create dataset ${datasetConfig.id}:`, error);
                }
            }
        }
    }
    /**
     * Cloud KMS 키 생성
     */
    async createEncryptionKeys() {
        const keyRingId = 'maumlog-encryption-keys';
        const location = this.config.region;
        // Key Ring 생성
        try {
            const keyRingPath = this.kmsClient.locationPath(this.config.projectId, location);
            await this.kmsClient.createKeyRing({
                parent: keyRingPath,
                keyRingId,
                keyRing: {}
            });
            console.log(`Key ring ${keyRingId} created`);
        }
        catch (error) {
            if (error.code !== 6) { // ALREADY_EXISTS
                console.error('Failed to create key ring:', error);
                return;
            }
        }
        // 암호화 키 생성
        const keys = [
            'user-data-encryption',
            'ai-model-encryption',
            'backup-encryption',
            'session-encryption'
        ];
        const keyRingPath = this.kmsClient.keyRingPath(this.config.projectId, location, keyRingId);
        for (const keyId of keys) {
            try {
                await this.kmsClient.createCryptoKey({
                    parent: keyRingPath,
                    cryptoKeyId: keyId,
                    cryptoKey: {
                        purpose: 'ENCRYPT_DECRYPT',
                        versionTemplate: {
                            algorithm: 'GOOGLE_SYMMETRIC_ENCRYPTION'
                        },
                        rotationPeriod: {
                            seconds: 86400 * 90 // 90일마다 키 교체
                        }
                    }
                });
                console.log(`Crypto key ${keyId} created`);
            }
            catch (error) {
                if (error.code !== 6) { // ALREADY_EXISTS
                    console.error(`Failed to create crypto key ${keyId}:`, error);
                }
            }
        }
    }
    /**
     * Pub/Sub 토픽 및 구독 생성
     */
    async createPubSubTopics() {
        const topics = [
            {
                name: 'emotion-analysis-queue',
                subscription: 'emotion-analysis-subscription'
            },
            {
                name: 'crisis-alerts',
                subscription: 'crisis-alerts-subscription'
            },
            {
                name: 'ai-training-data',
                subscription: 'ai-training-subscription'
            },
            {
                name: 'audit-logs',
                subscription: 'audit-logs-subscription'
            }
        ];
        for (const topicConfig of topics) {
            try {
                // 토픽 생성
                const [topic] = await this.pubSub.createTopic(topicConfig.name);
                console.log(`Topic ${topicConfig.name} created`);
                // 구독 생성
                await topic.createSubscription(topicConfig.subscription, {
                    deadLetterPolicy: {
                        deadLetterTopic: `projects/${this.config.projectId}/topics/dead-letter-queue`,
                        maxDeliveryAttempts: 5
                    },
                    retryPolicy: {
                        minimumBackoff: { seconds: 10 },
                        maximumBackoff: { seconds: 600 }
                    }
                });
                console.log(`Subscription ${topicConfig.subscription} created`);
            }
            catch (error) {
                if (error.code !== 6) { // ALREADY_EXISTS
                    console.error(`Failed to create topic/subscription ${topicConfig.name}:`, error);
                }
            }
        }
    }
    /**
     * Secret Manager에 API 키 저장
     */
    async storeSecrets() {
        const secrets = [
            {
                name: 'openai-api-key',
                value: process.env.OPENAI_API_KEY || ''
            },
            {
                name: 'claude-api-key',
                value: process.env.CLAUDE_API_KEY || ''
            },
            {
                name: 'gemini-api-key',
                value: process.env.GEMINI_API_KEY || ''
            },
            {
                name: 'twilio-auth-token',
                value: process.env.TWILIO_AUTH_TOKEN || ''
            },
            {
                name: 'stripe-secret-key',
                value: process.env.STRIPE_SECRET_KEY || ''
            },
            {
                name: 'sendgrid-api-key',
                value: process.env.SENDGRID_API_KEY || ''
            }
        ];
        for (const secret of secrets) {
            if (!secret.value) {
                console.warn(`Skipping empty secret: ${secret.name}`);
                continue;
            }
            try {
                const parent = `projects/${this.config.projectId}`;
                // 시크릿 생성
                const [secretResponse] = await this.secretManager.createSecret({
                    parent,
                    secretId: secret.name,
                    secret: {
                        replication: {
                            automatic: {}
                        }
                    }
                });
                // 시크릿 버전 생성
                await this.secretManager.addSecretVersion({
                    parent: secretResponse.name,
                    payload: {
                        data: Buffer.from(secret.value)
                    }
                });
                console.log(`Secret ${secret.name} stored successfully`);
            }
            catch (error) {
                if (error.code !== 6) { // ALREADY_EXISTS
                    console.error(`Failed to store secret ${secret.name}:`, error);
                }
            }
        }
    }
    /**
     * AI Platform 모델 저장소 설정
     */
    async setupAIPlatform() {
        // AI Platform에서 사용할 모델 저장소 설정
        const modelBucket = 'maumlog-ai-models-us-central1';
        const bucket = this.storage.bucket(modelBucket);
        // 모델 디렉토리 구조 생성
        const modelDirectories = [
            'emotion-classification/',
            'crisis-detection/',
            'text-analysis/',
            'recommendation-engine/'
        ];
        for (const dir of modelDirectories) {
            try {
                await bucket.file(`${dir}.keep`).save('');
                console.log(`Created model directory: ${dir}`);
            }
            catch (error) {
                console.error(`Failed to create directory ${dir}:`, error);
            }
        }
    }
    /**
     * 모니터링 및 알림 설정
     */
    async setupMonitoring() {
        // Cloud Monitoring 알림 정책 설정은 Terraform 또는 gcloud CLI로 진행
        console.log('Monitoring setup should be done via Terraform or gcloud CLI');
        // 로그 싱크 생성 (BigQuery로)
        const logSinks = [
            {
                name: 'firebase-functions-logs',
                destination: `bigquery.googleapis.com/projects/${this.config.projectId}/datasets/compliance_logs`,
                filter: 'resource.type="cloud_function"'
            },
            {
                name: 'firestore-audit-logs',
                destination: `bigquery.googleapis.com/projects/${this.config.projectId}/datasets/compliance_logs`,
                filter: 'protoPayload.serviceName="firestore.googleapis.com"'
            }
        ];
        // 실제 구현에서는 Cloud Logging API 사용
        console.log('Log sinks configuration:', logSinks);
    }
    /**
     * 전체 GCP 인프라 초기화
     */
    async initializeGCPInfrastructure() {
        try {
            console.log('Starting GCP infrastructure initialization...');
            await this.createEncryptionKeys();
            await this.createStorageBuckets();
            await this.createBigQueryDatasets();
            await this.createPubSubTopics();
            await this.storeSecrets();
            await this.setupAIPlatform();
            await this.setupMonitoring();
            console.log('GCP infrastructure initialization completed successfully');
        }
        catch (error) {
            console.error('GCP infrastructure initialization failed:', error);
            throw error;
        }
    }
}
exports.GCPServiceManager = GCPServiceManager;
// 설정 인스턴스 생성
exports.gcpConfig = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'maumlog-prod-env',
    region: 'us-central1',
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
};
exports.gcpServiceManager = new GCPServiceManager(exports.gcpConfig);
//# sourceMappingURL=gcpServices.js.map