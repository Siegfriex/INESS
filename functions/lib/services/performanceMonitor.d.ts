import * as functions from 'firebase-functions';
declare class PerformanceMonitor {
    private readonly alertThresholds;
    /**
     * 성능 메트릭 수집
     */
    collectMetrics(service: string, startTime: number, success: boolean): Promise<void>;
    /**
     * 배치 메트릭 쓰기 (성능 최적화)
     */
    private batchWriteMetrics;
    /**
     * 실시간 알림 체크
     */
    private checkAlerts;
    /**
     * 메트릭 값 추출
     */
    private getMetricValue;
    /**
     * 알림 발송 및 자동 대응
     */
    private triggerAlert;
    /**
     * 자동 스케일링 (Cloud Run 기반)
     */
    private autoScale;
    /**
     * 서비스별 스케일링 설정
     */
    private getScaleConfig;
    /**
     * 알림 발송
     */
    private sendAlert;
    /**
     * 성능 리포트 생성
     */
    generatePerformanceReport(startTime: number, endTime: number): Promise<any>;
    /**
     * 헬스 체크 엔드포인트
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        services: Record<string, any>;
        timestamp: number;
    }>;
    private getLatestMetrics;
    private evaluateServiceHealth;
}
export declare const performanceMonitor: PerformanceMonitor;
/**
 * 성능 모니터링 미들웨어
 */
export declare function withPerformanceMonitoring(serviceId: string): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Cloud Functions Handlers
 */
export declare const getHealthStatus: functions.HttpsFunction;
export declare const getPerformanceReport: functions.HttpsFunction & functions.Runnable<any>;
export {};
//# sourceMappingURL=performanceMonitor.d.ts.map