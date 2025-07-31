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
        reminderTime?: string;
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
        deleteAfterInactivity: number;
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
    core: UserCore;
    profile?: UserProfile;
    settings: UserSettings;
    subscription: UserSubscription;
    privacy: UserPrivacy;
    stats: UserStats;
    updatedAt: Timestamp;
    version: number;
}
export declare const defaultUserSettings: UserSettings;
export declare const defaultUserSubscription: UserSubscription;
