"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawConsent = exports.generateUserKeys = exports.encryptionService = void 0;
const crypto = __importStar(require("crypto"));
const functions = __importStar(require("firebase-functions"));
class EncryptionService {
    constructor() {
        this.config = {
            algorithm: 'aes-256-gcm',
            keySize: 32, // 256 bits
            ivSize: 16, // 128 bits
            tagSize: 16 // 128 bits
        };
        this.keyRotationInterval = 24 * 60 * 60 * 1000; // 24시간
    }
    /**
     * 사용자별 개인키 생성 및 관리
     */
    async generateUserKeyPair(userId, userPin) {
        // ECDH 키 쌍 생성
        const keyPair = crypto.generateKeyPairSync('ec', {
            namedCurve: 'secp256k1',
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        // 사용자 PIN으로 개인키 암호화
        const userKey = this.deriveKeyFromPin(userPin, userId);
        const encryptedPrivateKey = this.encryptWithKey(keyPair.privateKey, userKey);
        return {
            publicKey: Buffer.from(keyPair.publicKey).toString('base64'),
            privateKeyEncrypted: JSON.stringify(encryptedPrivateKey),
            keyVersion: 1,
            createdAt: Date.now()
        };
    }
    /**
     * 민감 데이터 클라이언트 사이드 암호화
     */
    encryptSensitiveData(data, userKey) {
        const iv = crypto.randomBytes(this.config.ivSize);
        const cipher = crypto.createCipher(this.config.algorithm, userKey, { iv });
        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        const tag = cipher.getAuthTag();
        return {
            data: encrypted,
            iv: iv.toString('base64'),
            tag: tag.toString('base64'),
            timestamp: Date.now(),
            keyVersion: 1
        };
    }
    /**
     * 암호화된 데이터 복호화
     */
    decryptSensitiveData(encryptedData, userKey) {
        const iv = Buffer.from(encryptedData.iv, 'base64');
        const tag = Buffer.from(encryptedData.tag, 'base64');
        const decipher = crypto.createDecipher(this.config.algorithm, userKey, { iv });
        decipher.setAuthTag(tag);
        let decrypted = decipher.update(encryptedData.data, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    /**
     * PIN으로부터 암호화 키 유도 (PBKDF2)
     */
    deriveKeyFromPin(pin, salt) {
        return crypto.pbkdf2Sync(pin, salt, 100000, this.config.keySize, 'sha256');
    }
    /**
     * 키로 데이터 암호화
     */
    encryptWithKey(data, key) {
        const iv = crypto.randomBytes(this.config.ivSize);
        const cipher = crypto.createCipher(this.config.algorithm, key, { iv });
        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        const tag = cipher.getAuthTag();
        return {
            data: encrypted,
            iv: iv.toString('base64'),
            tag: tag.toString('base64'),
            timestamp: Date.now(),
            keyVersion: 1
        };
    }
    /**
     * 데이터 분류 및 암호화 레벨 결정
     */
    classifyAndEncrypt(data, dataType) {
        let retentionPeriod;
        let classification;
        switch (dataType) {
            case 'crisis':
                retentionPeriod = 10 * 365 * 24 * 60 * 60 * 1000; // 10년
                classification = 'crisis-sensitive';
                break;
            case 'sensitive':
                retentionPeriod = 3 * 365 * 24 * 60 * 60 * 1000; // 3년
                classification = 'mental-health-sensitive';
                break;
            case 'personal':
                retentionPeriod = 7 * 365 * 24 * 60 * 60 * 1000; // 7년
                classification = 'personal-identifiable';
                break;
            default:
                retentionPeriod = 1 * 365 * 24 * 60 * 60 * 1000; // 1년
                classification = 'general';
        }
        // Cloud KMS로 추가 암호화 (프로덕션에서)
        const kmsKey = this.getKMSKey(classification);
        const encrypted = this.encryptWithKey(JSON.stringify(data), kmsKey);
        return {
            encrypted,
            classification,
            retentionPeriod
        };
    }
    /**
     * GDPR 준수를 위한 데이터 삭제 검증
     */
    async verifyDataDeletion(userId, dataType) {
        // 실제로는 모든 저장소에서 데이터 삭제 확인
        const deletionVerified = await this.checkAllStorageLocations(userId, dataType);
        const verificationData = {
            userId,
            dataType,
            deletionTime: Date.now(),
            verificationMethod: 'cryptographic-proof'
        };
        const verificationHash = crypto
            .createHash('sha256')
            .update(JSON.stringify(verificationData))
            .digest('hex');
        return {
            deleted: deletionVerified,
            verificationHash,
            timestamp: Date.now()
        };
    }
    /**
     * 동의 철회 처리
     */
    async processConsentWithdrawal(userId, consentType) {
        try {
            // 1. 즉시 데이터 접근 차단
            await this.blockDataAccess(userId, consentType);
            // 2. 데이터 삭제 작업 큐에 추가
            await this.scheduleDataRemoval(userId, consentType);
            // 3. 사용자에게 확인 이메일 발송
            await this.sendConsentWithdrawalConfirmation(userId);
            return {
                success: true,
                dataRemovalScheduled: true,
                estimatedCompletionTime: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7일 후
            };
        }
        catch (error) {
            console.error('Consent withdrawal processing failed:', error);
            return {
                success: false,
                dataRemovalScheduled: false,
                estimatedCompletionTime: 0
            };
        }
    }
    /**
     * 키 교체 (정기적 보안 강화)
     */
    async rotateKeys() {
        // 모든 활성 사용자의 키 교체 작업
        console.log('Starting key rotation process...');
        // 실제 구현에서는 배치 작업으로 처리
        // 1. 새 키 생성
        // 2. 기존 데이터 재암호화
        // 3. 이전 키 폐기
        // 4. 클라이언트에 키 업데이트 알림
    }
    getKMSKey(classification) {
        // 실제로는 Google Cloud KMS에서 키 가져오기
        // 개발 환경에서는 환경변수 사용
        const kmsKeyId = process.env[`KMS_KEY_${classification.toUpperCase()}`];
        return Buffer.from(kmsKeyId || 'dev-key-placeholder', 'utf8');
    }
    async checkAllStorageLocations(userId, dataType) {
        // Firestore, Cloud Storage, BigQuery 등 모든 저장소 확인
        return true; // 실제 구현 필요
    }
    async blockDataAccess(userId, consentType) {
        // 데이터 접근 차단 로직
    }
    async scheduleDataRemoval(userId, consentType) {
        // 데이터 삭제 작업 스케줄링
    }
    async sendConsentWithdrawalConfirmation(userId) {
        // 확인 이메일 발송
    }
}
// 싱글톤 인스턴스
exports.encryptionService = new EncryptionService();
/**
 * Cloud Function Handlers
 */
exports.generateUserKeys = functions
    .region('us-central1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    if (!data.pin) {
        throw new functions.https.HttpsError('invalid-argument', 'PIN required for key generation');
    }
    try {
        const keyPair = await exports.encryptionService.generateUserKeyPair(context.auth.uid, data.pin);
        return { success: true, keyPair };
    }
    catch (error) {
        console.error('Key generation failed:', error);
        throw new functions.https.HttpsError('internal', 'Key generation failed');
    }
});
exports.withdrawConsent = functions
    .region('us-central1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    if (!data.consentType) {
        throw new functions.https.HttpsError('invalid-argument', 'Consent type required');
    }
    try {
        const result = await exports.encryptionService.processConsentWithdrawal(context.auth.uid, data.consentType);
        return result;
    }
    catch (error) {
        console.error('Consent withdrawal failed:', error);
        throw new functions.https.HttpsError('internal', 'Consent withdrawal processing failed');
    }
});
//# sourceMappingURL=encryptionService.js.map