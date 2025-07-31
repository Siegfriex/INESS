/**
 * 시스템 복원력 및 다중화 설정
 * 단일 장애점 제거를 위한 Resilience Configuration
 */
export interface AIProviderConfig {
    name: string;
    endpoint: string;
    apiKey: string;
    timeout: number;
    maxRetries: number;
    priority: number;
}
export interface CircuitBreakerConfig {
    failureThreshold: number;
    resetTimeout: number;
    monitoringPeriod: number;
}
export declare const AI_PROVIDERS: AIProviderConfig[];
export declare const CIRCUIT_BREAKER_CONFIG: Record<string, CircuitBreakerConfig>;
export interface DatabaseConfig {
    primary: {
        type: 'firestore';
        projectId: string;
        region: string;
    };
    replica: {
        type: 'postgresql';
        connectionString: string;
        syncInterval: number;
    };
    cache: {
        type: 'redis';
        endpoint: string;
        ttl: number;
    };
}
export declare const DB_CONFIG: DatabaseConfig;
export declare const PERFORMANCE_CONFIG: {
    functions: {
        aiAnalysis: {
            memory: string;
            timeout: number;
            maxInstances: number;
            minInstances: number;
            concurrency: number;
        };
        crisisDetection: {
            memory: string;
            timeout: number;
            maxInstances: number;
            minInstances: number;
            concurrency: number;
        };
        expertMatching: {
            memory: string;
            timeout: number;
            maxInstances: number;
            minInstances: number;
            concurrency: number;
        };
    };
    queues: {
        immediate: {
            maxConcurrency: number;
            retryAttempts: number;
            backoffMultiplier: number;
        };
        background: {
            maxConcurrency: number;
            retryAttempts: number;
            backoffMultiplier: number;
        };
        batch: {
            maxConcurrency: number;
            retryAttempts: number;
            scheduleTime: string;
        };
    };
};
export declare const MONITORING_CONFIG: {
    healthChecks: {
        interval: number;
        timeout: number;
        endpoints: string[];
    };
    alerts: {
        errorRate: {
            threshold: number;
            window: number;
        };
        responseTime: {
            threshold: number;
            percentile: number;
        };
        crisisResponseTime: {
            threshold: number;
            severity: string;
        };
    };
};
export declare const SECURITY_CONFIG: {
    encryption: {
        algorithm: string;
        keyRotationInterval: number;
        clientSideEncryption: boolean;
    };
    rateLimit: {
        global: {
            windowMs: number;
            max: number;
        };
        aiAnalysis: {
            windowMs: number;
            max: number;
        };
        crisis: {
            windowMs: number;
            max: number;
        };
    };
    audit: {
        logLevel: string;
        sensitiveDataMasking: boolean;
        retentionPeriod: number;
    };
};
//# sourceMappingURL=resilience.d.ts.map