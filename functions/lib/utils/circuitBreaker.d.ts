/**
 * Circuit Breaker 패턴 구현
 * 서비스 장애 시 자동 복구 및 Failover 지원
 */
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
export interface CircuitBreakerConfig {
    failureThreshold: number;
    resetTimeout: number;
    monitoringPeriod: number;
}
export interface CircuitBreakerMetrics {
    totalRequests: number;
    successCount: number;
    failureCount: number;
    lastFailureTime?: number;
    lastSuccessTime?: number;
}
export declare class CircuitBreaker {
    private config;
    private _state;
    private metrics;
    private nextAttempt;
    constructor(config: CircuitBreakerConfig);
    get state(): CircuitBreakerState;
    get stats(): CircuitBreakerMetrics & {
        state: CircuitBreakerState;
    };
    /**
     * Circuit Breaker를 통한 함수 실행
     */
    execute<T>(operation: () => Promise<T>): Promise<T>;
    /**
     * 성공 시 호출
     */
    private onSuccess;
    /**
     * 실패 시 호출
     */
    private onFailure;
    /**
     * 메트릭 초기화
     */
    private resetMetrics;
    /**
     * 강제로 Circuit Breaker 상태 변경 (테스트/운영 목적)
     */
    forceState(state: CircuitBreakerState): void;
    /**
     * 현재 상태 및 메트릭 정보
     */
    getHealthInfo(): {
        state: CircuitBreakerState;
        failureRate: number;
        uptime: number;
        nextAttemptIn?: number;
    };
}
/**
 * Circuit Breaker 팩토리 - 글로벌 인스턴스 관리
 */
export declare class CircuitBreakerManager {
    private static breakers;
    static getBreaker(name: string, config: CircuitBreakerConfig): CircuitBreaker;
    static getAllBreakers(): Map<string, CircuitBreaker>;
    static getHealthReport(): Record<string, any>;
}
//# sourceMappingURL=circuitBreaker.d.ts.map