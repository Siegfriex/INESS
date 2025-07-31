/**
 * Performance Monitor
 * AI 서비스의 성능과 메트릭을 모니터링하는 시스템
 */
export interface PerformanceMetric {
    timestamp: string;
    metricType: string;
    value: number;
    unit: string;
    tags?: Record<string, string>;
}
export interface AIUsageMetric {
    provider: string;
    model: string;
    tokensUsed: number;
    responseTime: number;
    cost: number;
    timestamp: string;
}
export interface SystemMetric {
    cpuUsage: number;
    memoryUsage: number;
    activeConnections: number;
    queueSize: number;
    timestamp: string;
}
export interface PerformanceSummary {
    totalRequests: number;
    averageResponseTime: number;
    totalTokensUsed: number;
    totalCost: number;
    errorRate: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
    lastUpdated: string;
}
export declare class PerformanceMonitor {
    private metrics;
    private aiUsageMetrics;
    private systemMetrics;
    private isRunning;
    private monitoringInterval?;
    private metricsRetentionDays;
    private readonly modelCosts;
    constructor();
    /**
     * 성능 모니터링 시작
     */
    start(): Promise<void>;
    /**
     * AI 사용 메트릭 기록
     */
    recordAIUsage(metric: Omit<AIUsageMetric, 'timestamp' | 'cost'>): void;
    /**
     * 일반 성능 메트릭 기록
     */
    recordMetric(metric: PerformanceMetric): void;
    /**
     * 시스템 메트릭 수집
     */
    private collectSystemMetrics;
    /**
     * AI 모델 비용 계산
     */
    private calculateCost;
    /**
     * 중요 메트릭 판단
     */
    private isCriticalMetric;
    /**
     * 성능 요약 생성
     */
    getCurrentMetrics(): Promise<PerformanceSummary>;
    /**
     * 시스템 건강도 계산
     */
    private calculateSystemHealth;
    /**
     * 특정 기간의 메트릭 조회
     */
    getMetricsByTimeRange(metricType: string, startTime: Date, endTime: Date): PerformanceMetric[];
    /**
     * AI 사용량 리포트 생성
     */
    generateAIUsageReport(period?: 'hour' | 'day' | 'week'): any;
    /**
     * 오래된 메트릭 정리
     */
    private cleanupOldMetrics;
    /**
     * 헬스 체크
     */
    healthCheck(): Promise<boolean>;
    /**
     * 성능 모니터링 중지
     */
    stop(): Promise<void>;
}
//# sourceMappingURL=PerformanceMonitor.d.ts.map