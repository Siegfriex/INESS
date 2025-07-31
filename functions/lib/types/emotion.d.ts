/**
 * 감정 분석 관련 타입 정의
 */
export interface EmotionAnalysisRequest {
    userId: string;
    text?: string;
    currentEmotion?: string;
    intensity?: number;
    context?: string;
    previousPatterns?: string;
    timestamp: Date;
    media?: {
        type: 'audio' | 'image';
        url: string;
    }[];
}
export interface EmotionAnalysisResponse {
    emotions: {
        primary: string;
        confidence: number;
        secondary: string[];
    };
    insights: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'crisis';
    recommendations: string[];
    metadata: {
        provider: string;
        analysisTime: number;
        confidence: number;
        parseError?: boolean;
    };
}
export interface EmotionEntry {
    id: string;
    userId: string;
    timestamp: Date;
    emotion: {
        primary: string;
        secondary?: string[];
        intensity: number;
        triggers?: string[];
    };
    content: {
        text?: string;
        voice?: string;
        images?: string[];
    };
    analysis: {
        aiInsights: string[];
        riskLevel: 'low' | 'medium' | 'high' | 'crisis';
        keywords: string[];
        sentiment: number;
    };
    metadata: {
        location?: {
            latitude: number;
            longitude: number;
        };
        weather?: string;
        context?: 'work' | 'personal' | 'social' | 'other';
    };
}
export interface CrisisDetectionResult {
    level: 1 | 2 | 3 | 4;
    triggers: string[];
    immediateActions: string[];
    recommendedContacts: string[];
    escalationRequired: boolean;
}
//# sourceMappingURL=emotion.d.ts.map