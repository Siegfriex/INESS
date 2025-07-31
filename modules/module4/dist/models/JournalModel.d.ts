/**
 * Journal 데이터 모델
 * 감정 일기 및 분석 데이터
 */
import { Timestamp } from 'firebase/firestore';
export interface JournalContent {
    title?: string;
    body: string;
    wordCount: number;
    readingTime: number;
    language: string;
    linkedEmotions: string[];
    mood: {
        before: number;
        after: number;
    };
    tags: string[];
    category?: 'daily' | 'gratitude' | 'reflection' | 'goal_setting' | 'crisis' | 'celebration' | 'other';
    attachments?: {
        type: 'image' | 'audio' | 'video';
        url: string;
        caption?: string;
        uploadedAt: Timestamp;
    }[];
}
export interface JournalAnalysis {
    textAnalysis: {
        sentiment: {
            score: number;
            magnitude: number;
            label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
        };
        keywordDensity: Record<string, number>;
        topics: string[];
        entities: {
            people: string[];
            places: string[];
            events: string[];
        };
        complexity: {
            readabilityScore: number;
            vocabularyLevel: string;
            sentenceVariety: number;
        };
    };
    emotionalAnalysis: {
        dominantEmotions: string[];
        emotionalIntensity: number;
        emotionalRange: number;
        copingMechanisms: string[];
        growthIndicators: string[];
    };
    insights: {
        mainThemes: string[];
        patterns: string[];
        recommendations: string[];
        concernAreas: string[];
        positiveAspects: string[];
    };
    riskAssessment: {
        level: 'low' | 'medium' | 'high' | 'critical';
        indicators: string[];
        immediate_action_needed: boolean;
    };
    growthMetrics: {
        selfAwareness: number;
        emotionalRegulation: number;
        positiveThinking: number;
        problemSolving: number;
        gratitude: number;
    };
    processedAt: Timestamp;
    aiModel: string;
    confidence: number;
}
export interface JournalPrivacy {
    visibility: 'private' | 'shared' | 'anonymous' | 'public';
    sharedWith?: string[];
    anonymizedForResearch: boolean;
    sensitiveContent: boolean;
    dataRetentionOverride?: number;
}
export interface JournalEntry {
    id: string;
    userId: string;
    content: JournalContent;
    analysis?: JournalAnalysis;
    privacy: JournalPrivacy;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    publishedAt?: Timestamp;
    writingSession: {
        duration: number;
        device: string;
        appVersion: string;
        drafts: number;
    };
    reactions?: {
        helpful: number;
        supportive: number;
        relatable: number;
    };
    comments?: {
        count: number;
        lastCommentAt?: Timestamp;
    };
    flagged: boolean;
    flagReason?: string;
    reviewed: boolean;
    reviewedBy?: string;
    reviewedAt?: Timestamp;
    version: number;
    editHistory?: {
        editedAt: Timestamp;
        changes: string;
    }[];
}
export interface JournalTemplate {
    id: string;
    name: string;
    description: string;
    prompts: string[];
    category: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
    personalizedFor?: string[];
    aiAdapted: boolean;
    usage: {
        timesUsed: number;
        averageRating: number;
        completionRate: number;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface JournalChallenge {
    id: string;
    title: string;
    description: string;
    duration: number;
    prompts: string[];
    goals: {
        frequency: 'daily' | 'weekly' | 'custom';
        minWordCount?: number;
        targetEmotions?: string[];
    };
    rewards: {
        completion: string;
        milestones: {
            day: number;
            reward: string;
        }[];
    };
    participants: {
        userId: string;
        joinedAt: Timestamp;
        progress: number;
        completed: boolean;
        completedAt?: Timestamp;
    }[];
    isActive: boolean;
    startDate: Timestamp;
    endDate: Timestamp;
    createdBy: string;
}
export declare const defaultJournalTemplates: Partial<JournalTemplate>[];
