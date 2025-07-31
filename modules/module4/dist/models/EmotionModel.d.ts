/**
 * Emotion 데이터 모델
 * 감정 체크인 및 분석 데이터
 */
import { Timestamp } from 'firebase/firestore';
export interface EmotionType {
    primary: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'trust' | 'anticipation';
    secondary?: string;
    intensity: number;
}
export interface EmotionTrigger {
    category: 'work' | 'relationships' | 'health' | 'finances' | 'family' | 'social' | 'personal' | 'other';
    description?: string;
    severity: 'low' | 'medium' | 'high';
    recurring: boolean;
}
export interface EmotionContext {
    location?: {
        type: 'home' | 'work' | 'school' | 'social' | 'transport' | 'outdoor' | 'other';
        description?: string;
    };
    social: {
        alone: boolean;
        withPeople?: string[];
        socialSetting?: string;
    };
    physical: {
        energyLevel: number;
        sleepHours?: number;
        physicalActivity?: string;
        medications?: string[];
    };
    weather?: {
        condition: string;
        temperature?: number;
    };
    time: {
        timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
        dayOfWeek: string;
        isWorkday: boolean;
    };
}
export interface EmotionStructure {
    emotions: EmotionType[];
    dominantEmotion: EmotionType;
    triggers: EmotionTrigger[];
    context: EmotionContext;
    notes?: string;
    copingStrategies?: string[];
    helpfulness?: number;
}
export interface AIAnalysis {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    patterns: {
        recurring_triggers: string[];
        mood_trends: 'improving' | 'stable' | 'declining';
        time_patterns: string[];
        social_patterns: string[];
    };
    insights: {
        primary_insight: string;
        recommendations: string[];
        warning_signs: string[];
    };
    scores: {
        emotional_stability: number;
        coping_effectiveness: number;
        support_need: number;
    };
    keywords: string[];
    sentiment_score: number;
    confidence: number;
}
export interface EmotionMedia {
    type: 'image' | 'audio' | 'video' | 'text';
    url: string;
    uploadedAt: Timestamp;
    processed: boolean;
    analysis?: {
        description: string;
        emotions_detected: string[];
        confidence: number;
    };
    storageRef: string;
}
export interface EmotionCheckin {
    id: string;
    userId: string;
    structure: EmotionStructure;
    analysis: AIAnalysis;
    media?: EmotionMedia[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
    isPrivate: boolean;
    sharedWith?: string[];
    source: 'manual' | 'reminder' | 'crisis_detection' | 'scheduled';
    device: string;
    appVersion: string;
    validated: boolean;
    flagged: boolean;
    flagReason?: string;
}
export interface CrisisIndicators {
    keywords: string[];
    emotionThresholds: {
        sadness: number;
        anger: number;
        fear: number;
    };
    riskFactors: string[];
    patterns: string[];
}
export interface EmotionTrend {
    userId: string;
    period: 'daily' | 'weekly' | 'monthly';
    startDate: Timestamp;
    endDate: Timestamp;
    trends: {
        dominant_emotions: string[];
        average_intensity: number;
        mood_direction: 'improving' | 'stable' | 'declining';
        stability_score: number;
    };
    patterns: {
        time_of_day: Record<string, number>;
        day_of_week: Record<string, number>;
        triggers: Record<string, number>;
        coping_strategies: Record<string, number>;
    };
    insights: string[];
    recommendations: string[];
    generatedAt: Timestamp;
}
export declare const defaultCrisisIndicators: CrisisIndicators;
