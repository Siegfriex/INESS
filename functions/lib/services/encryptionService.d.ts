import * as functions from 'firebase-functions';
/**
 * 클라이언트-서버 간 종단간 암호화 서비스
 * GDPR 및 개인정보보호법 준수를 위한 강화된 보안
 */
export interface EncryptionConfig {
    algorithm: string;
    keySize: number;
    ivSize: number;
    tagSize: number;
}
export interface EncryptedData {
    data: string;
    iv: string;
    tag: string;
    timestamp: number;
    keyVersion: number;
}
export interface UserKeyPair {
    publicKey: string;
    privateKeyEncrypted: string;
    keyVersion: number;
    createdAt: number;
}
declare class EncryptionService {
    private readonly config;
    private readonly keyRotationInterval;
    /**
     * 사용자별 개인키 생성 및 관리
     */
    generateUserKeyPair(userId: string, userPin: string): Promise<UserKeyPair>;
    /**
     * 민감 데이터 클라이언트 사이드 암호화
     */
    encryptSensitiveData(data: string, userKey: Buffer): EncryptedData;
    /**
     * 암호화된 데이터 복호화
     */
    decryptSensitiveData(encryptedData: EncryptedData, userKey: Buffer): string;
    /**
     * PIN으로부터 암호화 키 유도 (PBKDF2)
     */
    private deriveKeyFromPin;
    /**
     * 키로 데이터 암호화
     */
    private encryptWithKey;
    /**
     * 데이터 분류 및 암호화 레벨 결정
     */
    classifyAndEncrypt(data: any, dataType: 'personal' | 'sensitive' | 'crisis'): {
        encrypted: EncryptedData;
        classification: string;
        retentionPeriod: number;
    };
    /**
     * GDPR 준수를 위한 데이터 삭제 검증
     */
    verifyDataDeletion(userId: string, dataType: string): Promise<{
        deleted: boolean;
        verificationHash: string;
        timestamp: number;
    }>;
    /**
     * 동의 철회 처리
     */
    processConsentWithdrawal(userId: string, consentType: string): Promise<{
        success: boolean;
        dataRemovalScheduled: boolean;
        estimatedCompletionTime: number;
    }>;
    /**
     * 키 교체 (정기적 보안 강화)
     */
    rotateKeys(): Promise<void>;
    private getKMSKey;
    private checkAllStorageLocations;
    private blockDataAccess;
    private scheduleDataRemoval;
    private sendConsentWithdrawalConfirmation;
}
export declare const encryptionService: EncryptionService;
/**
 * Cloud Function Handlers
 */
export declare const generateUserKeys: functions.HttpsFunction & functions.Runnable<any>;
export declare const withdrawConsent: functions.HttpsFunction & functions.Runnable<any>;
export {};
//# sourceMappingURL=encryptionService.d.ts.map