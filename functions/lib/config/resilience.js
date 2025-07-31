"use strict";
/**
 * 시스템 복원력 및 다중화 설정
 * 단일 장애점 제거를 위한 Resilience Configuration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECURITY_CONFIG = exports.MONITORING_CONFIG = exports.PERFORMANCE_CONFIG = exports.DB_CONFIG = exports.CIRCUIT_BREAKER_CONFIG = exports.AI_PROVIDERS = void 0;
// Multi-Provider AI 설정 - SPOF 제거
exports.AI_PROVIDERS = [
    {
        name: 'openai-gpt4',
        endpoint: 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY || '',
        timeout: 30000,
        maxRetries: 2,
        priority: 1 // 주 서비스
    },
    {
        name: 'claude-api',
        endpoint: 'https://api.anthropic.com/v1',
        apiKey: process.env.CLAUDE_API_KEY || '',
        timeout: 25000,
        maxRetries: 2,
        priority: 2 // 첫 번째 백업
    },
    {
        name: 'gemini-pro',
        endpoint: 'https://generativelanguage.googleapis.com/v1',
        apiKey: process.env.GEMINI_API_KEY || '',
        timeout: 20000,
        maxRetries: 2,
        priority: 3 // 두 번째 백업
    },
    {
        name: 'local-model',
        endpoint: 'http://localhost:8080/v1',
        apiKey: 'local',
        timeout: 45000,
        maxRetries: 1,
        priority: 4 // 최후 백업 (온프레미스)
    }
];
// Circuit Breaker 설정
exports.CIRCUIT_BREAKER_CONFIG = {
    'ai-analysis': {
        failureThreshold: 3,
        resetTimeout: 60000, // 1분
        monitoringPeriod: 300000 // 5분
    },
    'crisis-detection': {
        failureThreshold: 2, // 위기 대응은 더 민감하게
        resetTimeout: 30000, // 30초
        monitoringPeriod: 120000 // 2분
    },
    'expert-matching': {
        failureThreshold: 5,
        resetTimeout: 120000, // 2분
        monitoringPeriod: 600000 // 10분
    }
};
exports.DB_CONFIG = {
    primary: {
        type: 'firestore',
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        region: 'us-central1'
    },
    replica: {
        type: 'postgresql',
        connectionString: process.env.POSTGRES_CONNECTION_STRING || '',
        syncInterval: 300000 // 5분마다 동기화
    },
    cache: {
        type: 'redis',
        endpoint: process.env.REDIS_ENDPOINT || '',
        ttl: 3600 // 1시간 캐시
    }
};
// 성능 최적화 설정
exports.PERFORMANCE_CONFIG = {
    functions: {
        aiAnalysis: {
            memory: '2GB',
            timeout: 300,
            maxInstances: 50,
            minInstances: 2, // 콜드 스타트 방지
            concurrency: 1
        },
        crisisDetection: {
            memory: '1GB',
            timeout: 60,
            maxInstances: 100,
            minInstances: 5, // 즉시 대응 필요
            concurrency: 80
        },
        expertMatching: {
            memory: '512MB',
            timeout: 120,
            maxInstances: 20,
            minInstances: 1,
            concurrency: 10
        }
    },
    queues: {
        immediate: {
            maxConcurrency: 10,
            retryAttempts: 3,
            backoffMultiplier: 2
        },
        background: {
            maxConcurrency: 5,
            retryAttempts: 5,
            backoffMultiplier: 1.5
        },
        batch: {
            maxConcurrency: 2,
            retryAttempts: 1,
            scheduleTime: '02:00' // 새벽 2시 배치 처리
        }
    }
};
// 모니터링 설정
exports.MONITORING_CONFIG = {
    healthChecks: {
        interval: 30000, // 30초마다
        timeout: 5000,
        endpoints: [
            '/health/ai-services',
            '/health/database',
            '/health/crisis-system'
        ]
    },
    alerts: {
        errorRate: {
            threshold: 0.05, // 5% 이상 에러율
            window: 300000 // 5분 윈도우
        },
        responseTime: {
            threshold: 2000, // 2초 이상
            percentile: 95
        },
        crisisResponseTime: {
            threshold: 120000, // 2분 이상
            severity: 'critical'
        }
    }
};
// 보안 강화 설정
exports.SECURITY_CONFIG = {
    encryption: {
        algorithm: 'AES-256-GCM',
        keyRotationInterval: 86400000, // 24시간
        clientSideEncryption: true
    },
    rateLimit: {
        global: {
            windowMs: 60000, // 1분
            max: 1000 // 요청 수
        },
        aiAnalysis: {
            windowMs: 60000,
            max: 10 // AI 분석은 제한적
        },
        crisis: {
            windowMs: 60000,
            max: 50 // 위기 상황은 더 관대하게
        }
    },
    audit: {
        logLevel: 'info',
        sensitiveDataMasking: true,
        retentionPeriod: 2592000000 // 30일
    }
};
//# sourceMappingURL=resilience.js.map