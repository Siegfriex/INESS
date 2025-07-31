/**
 * AI Service Manager
 * 다양한 AI 서비스들을 통합 관리하는 핵심 컴포넌트
 */
export interface AIServiceConfig {
    openai?: {
        apiKey: string;
        model?: string;
        maxTokens?: number;
    };
    anthropic?: {
        apiKey: string;
        model?: string;
        maxTokens?: number;
    };
    google?: {
        apiKey: string;
        model?: string;
    };
}
export interface AIServiceStatus {
    openai: boolean;
    anthropic: boolean;
    google: boolean;
    lastChecked: string;
}
export interface AIResponse {
    content: string;
    model: string;
    provider: 'openai' | 'anthropic' | 'google';
    tokensUsed: number;
    responseTime: number;
    timestamp: string;
}
export declare class AIServiceManager {
    private openaiClient?;
    private anthropicClient?;
    private config;
    private isInitialized;
    constructor(config?: AIServiceConfig);
    /**
     * 환경 변수에서 설정 로드
     */
    private loadConfigFromEnv;
    /**
     * AI 서비스들 초기화
     */
    initialize(): Promise<void>;
    /**
     * OpenAI 텍스트 생성
     */
    generateWithOpenAI(prompt: string, options?: {
        model?: string;
        maxTokens?: number;
        temperature?: number;
        systemPrompt?: string;
    }): Promise<AIResponse>;
    /**
     * Anthropic 텍스트 생성
     */
    generateWithAnthropic(prompt: string, options?: {
        model?: string;
        maxTokens?: number;
        temperature?: number;
        systemPrompt?: string;
    }): Promise<AIResponse>;
    /**
     * 최적 AI 서비스 자동 선택 및 생성
     */
    generateSmart(prompt: string, options?: {
        preferredProvider?: 'openai' | 'anthropic' | 'google';
        taskType?: 'general' | 'creative' | 'analytical' | 'coding';
        maxTokens?: number;
        temperature?: number;
        systemPrompt?: string;
    }): Promise<AIResponse>;
    /**
     * 서비스 상태 확인
     */
    getServiceStatus(): Promise<AIServiceStatus>;
    /**
     * 헬스 체크
     */
    healthCheck(): Promise<boolean>;
    /**
     * 리소스 정리
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=AIServiceManager.d.ts.map