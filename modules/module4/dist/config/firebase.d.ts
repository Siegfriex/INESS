/**
 * Firebase Configuration
 * Firebase 프로젝트 설정 및 연결 관리
 */
import { FirestoreConfig } from '../types';
export declare const firebaseConfig: FirestoreConfig;
export declare const COLLECTIONS: {
    readonly USERS: "users";
    readonly EMOTIONS: "emotions";
    readonly JOURNALS: "journals";
    readonly EXPERTS: "experts";
    readonly EXPERT_AVAILABILITY: "expert_availability";
    readonly EXPERT_REVIEWS: "expert_reviews";
    readonly EXPERT_VERIFICATION: "expert_verification";
    readonly EMOTION_TRENDS: "emotion_trends";
    readonly JOURNAL_TEMPLATES: "journal_templates";
    readonly JOURNAL_CHALLENGES: "journal_challenges";
    readonly EXPERT_MATCHES: "expert_matches";
    readonly MATCHING_CRITERIA: "matching_criteria";
    readonly MIGRATIONS: "_migrations";
    readonly PERFORMANCE_METRICS: "_performance_metrics";
    readonly AUDIT_LOGS: "_audit_logs";
    readonly HEALTH_CHECK: "_health_check";
};
export declare const FIRESTORE_INDEXES: readonly [{
    readonly collection: "users";
    readonly fields: readonly [{
        readonly fieldPath: "core.email";
        readonly order: "ascending";
    }, {
        readonly fieldPath: "core.isActive";
        readonly order: "ascending";
    }];
}, {
    readonly collection: "users";
    readonly fields: readonly [{
        readonly fieldPath: "subscription.type";
        readonly order: "ascending";
    }, {
        readonly fieldPath: "core.createdAt";
        readonly order: "descending";
    }];
}, {
    readonly collection: "emotions";
    readonly fields: readonly [{
        readonly fieldPath: "userId";
        readonly order: "ascending";
    }, {
        readonly fieldPath: "createdAt";
        readonly order: "descending";
    }];
}, {
    readonly collection: "emotions";
    readonly fields: readonly [{
        readonly fieldPath: "analysis.riskLevel";
        readonly order: "ascending";
    }, {
        readonly fieldPath: "createdAt";
        readonly order: "descending";
    }];
}, {
    readonly collection: "emotions";
    readonly fields: readonly [{
        readonly fieldPath: "userId";
        readonly order: "ascending";
    }, {
        readonly fieldPath: "structure.dominantEmotion.primary";
        readonly order: "ascending";
    }, {
        readonly fieldPath: "createdAt";
        readonly order: "descending";
    }];
}, {
    readonly collection: "journals";
    readonly fields: readonly [{
        readonly fieldPath: "userId";
        readonly order: "ascending";
    }, {
        readonly fieldPath: "createdAt";
        readonly order: "descending";
    }];
}, {
    readonly collection: "journals";
    readonly fields: readonly [{
        readonly fieldPath: "privacy.visibility";
        readonly order: "ascending";
    }, {
        readonly fieldPath: "createdAt";
        readonly order: "descending";
    }];
}, {
    readonly collection: "experts";
    readonly fields: readonly [{
        readonly fieldPath: "status";
        readonly order: "ascending";
    }, {
        readonly fieldPath: "specialties.primaryAreas";
        readonly order: "array-contains";
    }];
}, {
    readonly collection: "experts";
    readonly fields: readonly [{
        readonly fieldPath: "specialties.languages";
        readonly order: "array-contains";
    }, {
        readonly fieldPath: "status";
        readonly order: "ascending";
    }];
}, {
    readonly collection: "expert_reviews";
    readonly fields: readonly [{
        readonly fieldPath: "expertId";
        readonly order: "ascending";
    }, {
        readonly fieldPath: "overall.averageRating";
        readonly order: "descending";
    }];
}];
export declare const PERFORMANCE_THRESHOLDS: {
    readonly QUERY_TIME_WARNING: 1000;
    readonly QUERY_TIME_CRITICAL: 3000;
    readonly READ_COUNT_WARNING: 100;
    readonly READ_COUNT_CRITICAL: 500;
    readonly WRITE_COUNT_WARNING: 50;
    readonly WRITE_COUNT_CRITICAL: 200;
};
export declare const SECURITY_RULES: {
    readonly AUTHENTICATED_ONLY: "request.auth != null";
    readonly OWNER_ONLY: "request.auth.uid == resource.data.userId";
    readonly ADMIN_ONLY: "request.auth.token.admin == true";
    readonly EXPERT_VERIFIED: "resource.data.credentials.verificationStatus == \"verified\"";
    readonly PUBLIC_READABLE: "resource.data.privacy.visibility == \"public\"";
    readonly CRISIS_INTERVENTION: "resource.data.analysis.riskLevel == \"critical\"";
};
export declare const getEnvironmentConfig: () => {
    enableEmulator: boolean;
    emulatorHost: string;
    emulatorPort: number;
    enableLogging: boolean;
    performanceMonitoring: boolean;
} | {
    enableEmulator: boolean;
    emulatorHost: string;
    emulatorPort: number;
    enableLogging: boolean;
    performanceMonitoring: boolean;
} | {
    enableEmulator: boolean;
    enableLogging: boolean;
    performanceMonitoring: boolean;
};
