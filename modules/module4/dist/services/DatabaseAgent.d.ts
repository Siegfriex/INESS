/**
 * Database Agent
 * Module4의 핵심 데이터베이스 관리 에이전트
 */
import { FirestoreService } from './FirestoreService';
import { SchemaValidator } from './SchemaValidator';
import { PerformanceMonitor } from './PerformanceMonitor';
import { User, EmotionCheckin, JournalEntry, ExpertProfile } from '../models';
export declare class DatabaseAgent {
    private firestoreService;
    private schemaValidator;
    private performanceMonitor;
    private isInitialized;
    private healthCheckInterval;
    constructor(firestoreService: FirestoreService, schemaValidator: SchemaValidator, performanceMonitor: PerformanceMonitor);
    /**
     * Database Agent 초기화
     */
    initialize(): Promise<void>;
    /**
     * 모니터링 시작
     */
    startMonitoring(): Promise<void>;
    /**
     * 에이전트 중지
     */
    stop(): Promise<void>;
    /**
     * 사용자 데이터 관리
     */
    createUser(userData: User): Promise<string>;
    /**
     * 감정 체크인 저장
     */
    saveEmotionCheckin(checkinData: EmotionCheckin): Promise<string>;
    /**
     * 일기 저장
     */
    saveJournalEntry(journalData: JournalEntry): Promise<string>;
    /**
     * 전문가 프로필 저장
     */
    saveExpertProfile(expertData: ExpertProfile): Promise<string>;
    /**
     * 사용자별 감정 데이터 조회
     */
    getUserEmotions(userId: string, limit?: number, startDate?: Date, endDate?: Date): Promise<EmotionCheckin[]>;
    /**
     * 위기 상황 감지 및 대응
     */
    private handleCrisisDetection;
    /**
     * 감정 트렌드 업데이트
     */
    private updateEmotionTrends;
    /**
     * 안정성 점수 계산
     */
    private calculateStabilityScore;
    /**
     * 분산 계산
     */
    private calculateVariance;
    /**
     * 트렌드 인사이트 생성
     */
    private generateTrendInsights;
    /**
     * 필수 컬렉션 존재 확인
     */
    private ensureCollectionsExist;
    /**
     * 인덱스 확인
     */
    private verifyIndexes;
    /**
     * 데이터 무결성 검사
     */
    private runIntegrityCheck;
    /**
     * 건강 상태 체크
     */
    private performHealthCheck;
    /**
     * 성능 리포트 조회
     */
    getPerformanceReport(): {
        collections: Record<string, any>;
        summary: any;
        recommendations: string[];
    };
    /**
     * 스키마 검증기 조회
     */
    getSchemaValidator(): SchemaValidator;
    /**
     * Firestore 서비스 조회
     */
    getFirestoreService(): FirestoreService;
}
