/**
 * Emotion 데이터 모델
 * 감정 체크인 및 분석 데이터
 */

import { Timestamp } from 'firebase/firestore';

export interface EmotionType {
  primary: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'trust' | 'anticipation';
  secondary?: string;
  intensity: number; // 1-10 스케일
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
    energyLevel: number; // 1-10
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
  helpfulness?: number; // 1-10 대처 전략 도움 정도
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
    emotional_stability: number; // 1-10
    coping_effectiveness: number; // 1-10
    support_need: number; // 1-10
  };
  keywords: string[];
  sentiment_score: number; // -1 to 1
  confidence: number; // 0-1
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
  
  // 감정 구조
  structure: EmotionStructure;
  
  // AI 분석
  analysis: AIAnalysis;
  
  // 미디어 첨부
  media?: EmotionMedia[];
  
  // 메타데이터
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // 개인정보 보호
  isPrivate: boolean;
  sharedWith?: string[]; // 사용자 ID 배열
  
  // 추적 정보
  source: 'manual' | 'reminder' | 'crisis_detection' | 'scheduled';
  device: string;
  appVersion: string;
  
  // 검증
  validated: boolean;
  flagged: boolean;
  flagReason?: string;
}

// 위기 상황 감지
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

// 감정 트렌드 분석
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

// 기본 위기 감지 설정
export const defaultCrisisIndicators: CrisisIndicators = {
  keywords: [
    '자살', '죽고싶다', '사라지고싶다', '의미없다', '절망적',
    '혼자다', '도움이필요해', '위험해', '해치고싶다'
  ],
  emotionThresholds: {
    sadness: 8,
    anger: 9,
    fear: 8,
  },
  riskFactors: [
    'repeated_high_intensity',
    'declining_trend',
    'isolation_pattern',
    'crisis_keywords'
  ],
  patterns: [
    'sudden_mood_drop',
    'prolonged_negative_state',
    'withdrawal_behavior'
  ],
};