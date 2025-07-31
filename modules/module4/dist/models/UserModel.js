/**
 * User 데이터 모델
 * 사용자 정보 및 프라이버시 관리
 */
// 사용자 생성 시 기본 데이터
export const defaultUserSettings = {
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
export const defaultUserSubscription = {
    type: 'free',
    autoRenew: false,
    features: ['basic_checkins', 'mood_tracking', 'basic_insights'],
    trialUsed: false,
};
