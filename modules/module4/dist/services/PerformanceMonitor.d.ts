/**
 * Performance Monitor Service
 * 데이터베이스 성능 모니터링 및 최적화 제안
 */
import { PerformanceMetrics, QueryAnalysis } from '../types';
import { FirestoreService } from './FirestoreService';
export declare class PerformanceMonitor {
    private firestoreService;
    private metrics;
    private isMonitoring;
    private monitoringInterval;
    constructor(firestoreService?: FirestoreService);
    /**
     * 모니터링 시작
     */
    startMonitoring(intervalMs?: number): Promise<void>;
    /**
     * 모니터링 중지
     */
    stopMonitoring(): void;
    /**
     * 쿼리 성능 측정
     */
    measureQuery<T>(operation: string, collection: string, queryFn: () => Promise<T>): Promise<{
        result: T;
        metrics: PerformanceMetrics;
    }>;
    /**
     * 쓰기 성능 측정
     */
    measureWrite<T>(operation: string, collection: string, writeFn: () => Promise<T>): Promise<{
        result: T;
        metrics: PerformanceMetrics;
    }>;
    /**
     * 쿼리 분석 및 최적화 제안
     */
    analyzeQuery(query: string, executionTime: number, documentsRead: number, indexUsed: boolean): QueryAnalysis;
    /**
     * 시스템 메트릭 수집
     */
    private collectSystemMetrics;
    /**
     * 컬렉션별 메트릭 수집
     */
    private collectCollectionMetrics;
    /**
     * 성능 트렌드 분석
     */
    private analyzePerformanceTrends;
    /**
     * 최적화 제안 생성
     */
    private generateOptimizationSuggestions;
    /**
     * 임계값 확인
     */
    private checkThresholds;
    /**
     * 중요 성능 이슈 알림
     */
    private alertCriticalPerformance;
    /**
     * 메트릭 기록
     */
    private recordMetrics;
    /**
     * 현재 읽기 카운트 (모의 구현)
     */
    private getCurrentReadCount;
    /**
     * 현재 쓰기 카운트 (모의 구현)
     */
    private getCurrentWriteCount;
    /**
     * 성능 리포트 생성
     */
    generatePerformanceReport(): {
        collections: Record<string, any>;
        summary: any;
        recommendations: string[];
    };
    /**
     * 작업별 통계
     */
    private getOperationStats;
    /**
     * 메트릭 초기화
     */
    clearMetrics(): void;
}
