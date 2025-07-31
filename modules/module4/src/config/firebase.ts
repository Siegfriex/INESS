/**
 * Firebase Configuration
 * Firebase 프로젝트 설정 및 연결 관리
 */

import { FirestoreConfig } from '../types';

export const firebaseConfig: FirestoreConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'maumlog-v2',
  apiKey: process.env.FIREBASE_API_KEY || undefined,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'maumlog-v2.firebaseapp.com',
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://maumlog-v2-default-rtdb.firebaseio.com',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'maumlog-v2.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || undefined,
  appId: process.env.FIREBASE_APP_ID || undefined,
};

// Firestore 컬렉션 경로 상수
export const COLLECTIONS = {
  USERS: 'users',
  EMOTIONS: 'emotions',
  JOURNALS: 'journals',
  EXPERTS: 'experts',
  EXPERT_AVAILABILITY: 'expert_availability',
  EXPERT_REVIEWS: 'expert_reviews',
  EXPERT_VERIFICATION: 'expert_verification',
  EMOTION_TRENDS: 'emotion_trends',
  JOURNAL_TEMPLATES: 'journal_templates',
  JOURNAL_CHALLENGES: 'journal_challenges',
  EXPERT_MATCHES: 'expert_matches',
  MATCHING_CRITERIA: 'matching_criteria',
  
  // 시스템 컬렉션
  MIGRATIONS: '_migrations',
  PERFORMANCE_METRICS: '_performance_metrics',
  AUDIT_LOGS: '_audit_logs',
  HEALTH_CHECK: '_health_check',
} as const;

// Firestore 인덱스 설정
export const FIRESTORE_INDEXES = [
  // Users 인덱스
  {
    collection: COLLECTIONS.USERS,
    fields: [
      { fieldPath: 'core.email', order: 'ascending' },
      { fieldPath: 'core.isActive', order: 'ascending' },
    ],
  },
  {
    collection: COLLECTIONS.USERS,
    fields: [
      { fieldPath: 'subscription.type', order: 'ascending' },
      { fieldPath: 'core.createdAt', order: 'descending' },
    ],
  },
  
  // Emotions 인덱스
  {
    collection: COLLECTIONS.EMOTIONS,
    fields: [
      { fieldPath: 'userId', order: 'ascending' },
      { fieldPath: 'createdAt', order: 'descending' },
    ],
  },
  {
    collection: COLLECTIONS.EMOTIONS,
    fields: [
      { fieldPath: 'analysis.riskLevel', order: 'ascending' },
      { fieldPath: 'createdAt', order: 'descending' },
    ],
  },
  {
    collection: COLLECTIONS.EMOTIONS,
    fields: [
      { fieldPath: 'userId', order: 'ascending' },
      { fieldPath: 'structure.dominantEmotion.primary', order: 'ascending' },
      { fieldPath: 'createdAt', order: 'descending' },
    ],
  },
  
  // Journals 인덱스
  {
    collection: COLLECTIONS.JOURNALS,
    fields: [
      { fieldPath: 'userId', order: 'ascending' },
      { fieldPath: 'createdAt', order: 'descending' },
    ],
  },
  {
    collection: COLLECTIONS.JOURNALS,
    fields: [
      { fieldPath: 'privacy.visibility', order: 'ascending' },
      { fieldPath: 'createdAt', order: 'descending' },
    ],
  },
  
  // Experts 인덱스
  {
    collection: COLLECTIONS.EXPERTS,
    fields: [
      { fieldPath: 'status', order: 'ascending' },
      { fieldPath: 'specialties.primaryAreas', order: 'array-contains' },
    ],
  },
  {
    collection: COLLECTIONS.EXPERTS,
    fields: [
      { fieldPath: 'specialties.languages', order: 'array-contains' },
      { fieldPath: 'status', order: 'ascending' },
    ],
  },
  
  // Expert Reviews 인덱스
  {
    collection: COLLECTIONS.EXPERT_REVIEWS,
    fields: [
      { fieldPath: 'expertId', order: 'ascending' },
      { fieldPath: 'overall.averageRating', order: 'descending' },
    ],
  },
] as const;

// 성능 임계값 설정
export const PERFORMANCE_THRESHOLDS = {
  QUERY_TIME_WARNING: 1000,    // 1초
  QUERY_TIME_CRITICAL: 3000,   // 3초
  READ_COUNT_WARNING: 100,     // 100개 문서
  READ_COUNT_CRITICAL: 500,    // 500개 문서
  WRITE_COUNT_WARNING: 50,     // 50개 문서  
  WRITE_COUNT_CRITICAL: 200,   // 200개 문서
} as const;

// 보안 규칙 상수
export const SECURITY_RULES = {
  // 공통 규칙
  AUTHENTICATED_ONLY: 'request.auth != null',
  OWNER_ONLY: 'request.auth.uid == resource.data.userId',
  ADMIN_ONLY: 'request.auth.token.admin == true',
  
  // 특별 규칙
  EXPERT_VERIFIED: 'resource.data.credentials.verificationStatus == "verified"',
  PUBLIC_READABLE: 'resource.data.privacy.visibility == "public"',
  CRISIS_INTERVENTION: 'resource.data.analysis.riskLevel == "critical"',
} as const;

// 환경별 설정
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  const configs = {
    development: {
      enableEmulator: true,
      emulatorHost: 'localhost',
      emulatorPort: 8080,
      enableLogging: true,
      performanceMonitoring: true,
    },
    
    test: {
      enableEmulator: true,
      emulatorHost: 'localhost',
      emulatorPort: 8081,
      enableLogging: false,
      performanceMonitoring: false,
    },
    
    production: {
      enableEmulator: false,
      enableLogging: false,
      performanceMonitoring: true,
    },
  };
  
  return configs[env as keyof typeof configs] || configs.development;
};