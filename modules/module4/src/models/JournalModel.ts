/**
 * Journal 데이터 모델
 * 감정 일기 및 분석 데이터
 */

import { Timestamp } from 'firebase/firestore';

export interface JournalContent {
  title?: string;
  body: string;
  wordCount: number;
  readingTime: number; // 예상 읽기 시간(분)
  language: string;
  
  // 감정 연결
  linkedEmotions: string[]; // emotion checkin IDs
  mood: {
    before: number; // 1-10 글쓰기 전 기분
    after: number;  // 1-10 글쓰기 후 기분
  };
  
  // 태그 및 카테고리
  tags: string[];
  category?: 'daily' | 'gratitude' | 'reflection' | 'goal_setting' | 'crisis' | 'celebration' | 'other';
  
  // 미디어 첨부
  attachments?: {
    type: 'image' | 'audio' | 'video';
    url: string;
    caption?: string;
    uploadedAt: Timestamp;
  }[];
}

export interface JournalAnalysis {
  // 텍스트 분석
  textAnalysis: {
    sentiment: {
      score: number; // -1 to 1
      magnitude: number; // 0 to 1
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
  
  // 감정 분석
  emotionalAnalysis: {
    dominantEmotions: string[];
    emotionalIntensity: number;
    emotionalRange: number;
    copingMechanisms: string[];
    growthIndicators: string[];
  };
  
  // AI 인사이트
  insights: {
    mainThemes: string[];
    patterns: string[];
    recommendations: string[];
    concernAreas: string[];
    positiveAspects: string[];
  };
  
  // 위험 평가
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    indicators: string[];
    immediate_action_needed: boolean;
  };
  
  // 성장 지표
  growthMetrics: {
    selfAwareness: number; // 1-10
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
  sharedWith?: string[]; // 사용자 ID 또는 'experts', 'community'
  anonymizedForResearch: boolean;
  sensitiveContent: boolean;
  dataRetentionOverride?: number; // days, 기본값 무시
}

export interface JournalEntry {
  id: string;
  userId: string;
  
  // 내용
  content: JournalContent;
  
  // 분석
  analysis?: JournalAnalysis;
  
  // 개인정보 보호
  privacy: JournalPrivacy;
  
  // 메타데이터
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  
  // 작성 정보
  writingSession: {
    duration: number; // 작성 시간(초)
    device: string;
    appVersion: string;
    drafts: number; // 임시저장 횟수
  };
  
  // 상호작용
  reactions?: {
    helpful: number;
    supportive: number;
    relatable: number;
  };
  
  comments?: {
    count: number;
    lastCommentAt?: Timestamp;
  };
  
  // 검증 및 조정
  flagged: boolean;
  flagReason?: string;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  
  // 버전 관리
  version: number;
  editHistory?: {
    editedAt: Timestamp;
    changes: string;
  }[];
}

// 일기 템플릿
export interface JournalTemplate {
  id: string;
  name: string;
  description: string;
  prompts: string[];
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  
  // 개인화
  personalizedFor?: string[]; // 사용자 특성
  aiAdapted: boolean;
  
  usage: {
    timesUsed: number;
    averageRating: number;
    completionRate: number;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 일기 챌린지
export interface JournalChallenge {
  id: string;
  title: string;
  description: string;
  duration: number; // days
  prompts: string[];
  
  goals: {
    frequency: 'daily' | 'weekly' | 'custom';
    minWordCount?: number;
    targetEmotions?: string[];
  };
  
  rewards: {
    completion: string;
    milestones: { day: number; reward: string }[];
  };
  
  participants: {
    userId: string;
    joinedAt: Timestamp;
    progress: number; // 0-100
    completed: boolean;
    completedAt?: Timestamp;
  }[];
  
  isActive: boolean;
  startDate: Timestamp;
  endDate: Timestamp;
  createdBy: string;
}

// 기본 일기 템플릿들
export const defaultJournalTemplates: Partial<JournalTemplate>[] = [
  {
    name: '일일 체크인',
    description: '하루를 마무리하며 감정과 경험을 정리합니다',
    prompts: [
      '오늘 하루는 어땠나요?',
      '가장 기억에 남는 순간은 무엇인가요?',
      '어떤 감정을 많이 느꼈나요?',
      '내일은 어떤 하루가 되었으면 좋겠나요?'
    ],
    category: 'daily',
    difficulty: 'beginner',
    estimatedTime: 10,
  },
  {
    name: '감사 일기',
    description: '긍정적인 마음으로 감사한 것들을 적어봅니다',
    prompts: [
      '오늘 감사한 세 가지는 무엇인가요?',
      '나에게 도움을 준 사람이 있나요?',
      '작은 기쁨이나 행복을 느낀 순간이 있었나요?'
    ],
    category: 'gratitude',
    difficulty: 'beginner',
    estimatedTime: 5,
  },
  {
    name: '감정 탐구',
    description: '복잡한 감정을 깊이 있게 탐색합니다',
    prompts: [
      '지금 느끼는 주된 감정은 무엇인가요?',
      '이 감정이 생긴 이유는 무엇일까요?',
      '이 감정을 어떻게 다루고 싶나요?',
      '이 경험에서 배울 수 있는 것은 무엇인가요?'
    ],
    category: 'reflection',
    difficulty: 'intermediate',
    estimatedTime: 15,
  }
];