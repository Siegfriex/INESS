"use strict";
/**
 * Circuit Breaker 패턴 구현
 * 서비스 장애 시 자동 복구 및 Failover 지원
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerManager = exports.CircuitBreaker = void 0;
class CircuitBreaker {
    constructor(config) {
        this.config = config;
        this._state = 'CLOSED';
        this.metrics = {
            totalRequests: 0,
            successCount: 0,
            failureCount: 0
        };
        this.nextAttempt = 0;
    }
    get state() {
        return this._state;
    }
    get stats() {
        return {
            ...this.metrics,
            state: this._state
        };
    }
    /**
     * Circuit Breaker를 통한 함수 실행
     */
    async execute(operation) {
        const now = Date.now();
        // OPEN 상태에서 재시도 시간이 되었는지 확인
        if (this._state === 'OPEN') {
            if (now < this.nextAttempt) {
                throw new Error(`Circuit breaker is OPEN. Next attempt at ${new Date(this.nextAttempt)}`);
            }
            // HALF_OPEN으로 전환
            this._state = 'HALF_OPEN';
            console.log('Circuit breaker transitioning to HALF_OPEN');
        }
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    /**
     * 성공 시 호출
     */
    onSuccess() {
        this.metrics.successCount++;
        this.metrics.totalRequests++;
        this.metrics.lastSuccessTime = Date.now();
        // HALF_OPEN에서 성공하면 CLOSED로 복구
        if (this._state === 'HALF_OPEN') {
            this._state = 'CLOSED';
            this.resetMetrics();
            console.log('Circuit breaker recovered to CLOSED state');
        }
    }
    /**
     * 실패 시 호출
     */
    onFailure() {
        this.metrics.failureCount++;
        this.metrics.totalRequests++;
        this.metrics.lastFailureTime = Date.now();
        const failureRate = this.metrics.failureCount / this.metrics.totalRequests;
        const hasEnoughRequests = this.metrics.totalRequests >= this.config.failureThreshold;
        // 실패율이 임계값을 초과하면 OPEN으로 전환
        if (hasEnoughRequests && failureRate >= (this.config.failureThreshold / this.metrics.totalRequests)) {
            this._state = 'OPEN';
            this.nextAttempt = Date.now() + this.config.resetTimeout;
            console.log(`Circuit breaker opened. Next attempt at ${new Date(this.nextAttempt)}`);
        }
        // HALF_OPEN에서 실패하면 다시 OPEN으로
        if (this._state === 'HALF_OPEN') {
            this._state = 'OPEN';
            this.nextAttempt = Date.now() + this.config.resetTimeout;
            console.log('Circuit breaker failed in HALF_OPEN, back to OPEN');
        }
    }
    /**
     * 메트릭 초기화
     */
    resetMetrics() {
        this.metrics = {
            totalRequests: 0,
            successCount: 0,
            failureCount: 0
        };
    }
    /**
     * 강제로 Circuit Breaker 상태 변경 (테스트/운영 목적)
     */
    forceState(state) {
        this._state = state;
        if (state === 'CLOSED') {
            this.resetMetrics();
        }
        else if (state === 'OPEN') {
            this.nextAttempt = Date.now() + this.config.resetTimeout;
        }
        console.log(`Circuit breaker forced to ${state} state`);
    }
    /**
     * 현재 상태 및 메트릭 정보
     */
    getHealthInfo() {
        const failureRate = this.metrics.totalRequests > 0
            ? this.metrics.failureCount / this.metrics.totalRequests
            : 0;
        const uptime = this.metrics.lastSuccessTime
            ? Date.now() - this.metrics.lastSuccessTime
            : 0;
        const result = {
            state: this._state,
            failureRate,
            uptime
        };
        if (this._state === 'OPEN' && this.nextAttempt > Date.now()) {
            result.nextAttemptIn = this.nextAttempt - Date.now();
        }
        return result;
    }
}
exports.CircuitBreaker = CircuitBreaker;
/**
 * Circuit Breaker 팩토리 - 글로벌 인스턴스 관리
 */
class CircuitBreakerManager {
    static getBreaker(name, config) {
        if (!this.breakers.has(name)) {
            this.breakers.set(name, new CircuitBreaker(config));
        }
        return this.breakers.get(name);
    }
    static getAllBreakers() {
        return this.breakers;
    }
    static getHealthReport() {
        const report = {};
        this.breakers.forEach((breaker, name) => {
            report[name] = breaker.getHealthInfo();
        });
        return report;
    }
}
exports.CircuitBreakerManager = CircuitBreakerManager;
CircuitBreakerManager.breakers = new Map();
//# sourceMappingURL=circuitBreaker.js.map