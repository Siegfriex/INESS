/**
 * User 데이터 모델
 * 사용자 정보 및 프라이버시 관리
 */

import { Timestamp } from 'firebase/firestore';

export interface UserCore {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  isActive: boolean;
}

export interface UserProfile {
  birthYear?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  occupation?: string;
  location?: {
    city: string;
    country: string;
  };
  mentalHealthGoals: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  timezone: string;
  preferredLanguage: string;
}

export interface UserSettings {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    reminderTime?: string; // HH:MM 형식
    weeklyReport: boolean;
    emergencyAlerts: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analyticsOptIn: boolean;
    researchParticipation: boolean;
    publicProfile: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    screenReader: boolean;
    voiceNavigation: boolean;
  };
  content: {
    aiInsights: boolean;
    expertRecommendations: boolean;
    communityFeatures: boolean;
    crisis_intervention: boolean;
  };
}

export interface UserSubscription {
  type: 'free' | 'premium' | 'enterprise';
  startDate?: Timestamp;
  endDate?: Timestamp;
  autoRenew: boolean;
  paymentMethod?: string;
  features: string[];
  trialUsed: boolean;
}

export interface UserPrivacy {
  dataEncryption: {
    enabled: boolean;
    keyVersion: string;
    lastRotated: Timestamp;
  };
  consent: {
    termsAccepted: boolean;
    privacyPolicyAccepted: boolean;
    consentDate: Timestamp;
    marketingConsent: boolean;
  };
  dataRetention: {
    deleteAfterInactivity: number; // days
    dataExportRequested?: Timestamp;
    dataDeletionRequested?: Timestamp;
  };
}

export interface UserStats {
  totalCheckIns: number;
  streakDays: number;
  longestStreak: number;
  totalJournalEntries: number;
  expertSessionsCompleted: number;
  communityContributions: number;
  lastActivity: Timestamp;
  averageMoodScore: number;
  progressScore: number;
}

export interface User {
  // 핵심 정보
  core: UserCore;
  profile?: UserProfile;
  settings: UserSettings;
  subscription: UserSubscription;
  
  // 프라이버시 및 보안
  privacy: UserPrivacy;
  
  // 사용자 통계
  stats: UserStats;
  
  // 메타데이터
  updatedAt: Timestamp;
  version: number;
}

// 사용자 생성 시 기본 데이터
export const defaultUserSettings: UserSettings = {
  notifications: {
    push: true,
    email: false,
    sms: false,
    weeklyReport: true,
    emergencyAlerts: true,
  },
  privacy: {
    dataSharing: false,
    analyticsOptIn: true,
    researchParticipation: false,
    publicProfile: false,
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    screenReader: false,
    voiceNavigation: false,
  },
  content: {
    aiInsights: true,
    expertRecommendations: true,
    communityFeatures: true,
    crisis_intervention: true,
  },
};

export const defaultUserSubscription: UserSubscription = {
  type: 'free',
  autoRenew: false,
  features: ['basic_checkins', 'mood_tracking', 'basic_insights'],
  trialUsed: false,
};