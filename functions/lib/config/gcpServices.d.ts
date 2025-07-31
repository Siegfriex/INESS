/**
 * Google Cloud Platform 서비스 통합 설정
 * Firebase와 GCP 서비스 간 연결 관리
 */
export interface GCPConfig {
    projectId: string;
    region: string;
    keyFilename?: string;
}
export declare class GCPServiceManager {
    private config;
    private storage;
    private bigQuery;
    private pubSub;
    private secretManager;
    private translator;
    private speechClient;
    private ttsClient;
    private kmsClient;
    constructor(config: GCPConfig);
    private initializeServices;
    /**
     * Cloud Storage 버킷 관리
     */
    createStorageBuckets(): Promise<void>;
    /**
     * BigQuery 데이터셋 생성
     */
    createBigQueryDatasets(): Promise<void>;
    /**
     * Cloud KMS 키 생성
     */
    createEncryptionKeys(): Promise<void>;
    /**
     * Pub/Sub 토픽 및 구독 생성
     */
    createPubSubTopics(): Promise<void>;
    /**
     * Secret Manager에 API 키 저장
     */
    storeSecrets(): Promise<void>;
    /**
     * AI Platform 모델 저장소 설정
     */
    setupAIPlatform(): Promise<void>;
    /**
     * 모니터링 및 알림 설정
     */
    setupMonitoring(): Promise<void>;
    /**
     * 전체 GCP 인프라 초기화
     */
    initializeGCPInfrastructure(): Promise<void>;
}
export declare const gcpConfig: GCPConfig;
export declare const gcpServiceManager: GCPServiceManager;
//# sourceMappingURL=gcpServices.d.ts.map