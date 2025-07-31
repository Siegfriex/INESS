/**
 * Expert 데이터 모델
 * 전문가 프로필 및 매칭 시스템
 */
import { Timestamp } from 'firebase/firestore';
export interface ExpertCredentials {
    licenseNumber: string;
    licenseType: string;
    issuingAuthority: string;
    issueDate: Timestamp;
    expiryDate: Timestamp;
    verificationStatus: 'pending' | 'verified' | 'rejected' | 'expired';
    verifiedBy?: string;
    verifiedAt?: Timestamp;
    additionalCertifications?: {
        name: string;
        organization: string;
        issueDate: Timestamp;
        expiryDate?: Timestamp;
        verificationDocument: string;
    }[];
    education: {
        degree: string;
        institution: string;
        graduationYear: number;
        major: string;
    }[];
    experience: {
        position: string;
        organization: string;
        startDate: Timestamp;
        endDate?: Timestamp;
        description?: string;
    }[];
}
export interface ExpertSpecialties {
    primaryAreas: string[];
    secondaryAreas: string[];
    approaches: ('CBT' | 'DBT' | 'mindfulness' | 'psychodynamic' | 'humanistic' | 'family_therapy' | 'other')[];
    languages: string[];
    ageGroups: ('children' | 'adolescents' | 'adults' | 'seniors')[];
    specialConditions: string[];
    treatmentMethods: string[];
    certifiedTherapies: string[];
    yearsOfExperience: number;
    totalSessionsConducted: number;
    specialtyRating: Record<string, number>;
}
export interface ExpertProfile {
    uid: string;
    personalInfo: {
        displayName: string;
        firstName: string;
        lastName: string;
        profilePhoto?: string;
        bio: string;
        introduction: string;
        email: string;
        phone?: string;
        location: {
            country: string;
            state: string;
            city: string;
            timezone: string;
        };
    };
    credentials: ExpertCredentials;
    specialties: ExpertSpecialties;
    services: {
        sessionTypes: ('individual' | 'group' | 'couple' | 'family')[];
        sessionFormats: ('video' | 'audio' | 'chat' | 'in_person')[];
        sessionDurations: number[];
        pricing: {
            baseRate: number;
            currency: string;
            sessionType: Record<string, number>;
            packageDeals?: {
                sessions: number;
                price: number;
                description: string;
            }[];
        };
        emergencyAvailable: boolean;
        crisisIntervention: boolean;
    };
    status: 'active' | 'inactive' | 'on_leave' | 'suspended';
    joinedAt: Timestamp;
    lastActiveAt: Timestamp;
    profileCompleteness: number;
}
export interface ExpertAvailability {
    expertId: string;
    weeklySchedule: {
        [key: string]: {
            available: boolean;
            timeSlots: {
                start: string;
                end: string;
                sessionType?: string;
            }[];
        };
    };
    customSchedule: {
        date: string;
        available: boolean;
        timeSlots?: {
            start: string;
            end: string;
            reason?: string;
        }[];
        note?: string;
    }[];
    bookedSlots: {
        sessionId: string;
        userId: string;
        startTime: Timestamp;
        endTime: Timestamp;
        status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    }[];
    settings: {
        advanceBookingDays: number;
        minNoticeHours: number;
        maxSessionsPerDay: number;
        bufferTimeBetweenSessions: number;
        autoAcceptBookings: boolean;
    };
    updatedAt: Timestamp;
}
export interface ExpertReviews {
    expertId: string;
    overall: {
        averageRating: number;
        totalReviews: number;
        totalSessions: number;
        recommendationRate: number;
        responseTime: number;
    };
    ratings: {
        professionalism: number;
        effectiveness: number;
        communication: number;
        empathy: number;
        punctuality: number;
    };
    reviews: {
        id: string;
        userId: string;
        rating: number;
        comment?: string;
        specialtyTags: string[];
        sessionType: string;
        wouldRecommend: boolean;
        createdAt: Timestamp;
        verified: boolean;
        flagged: boolean;
        helpfulVotes: number;
    }[];
    monthlyStats: {
        month: string;
        sessionsCompleted: number;
        averageRating: number;
        newReviews: number;
    }[];
    lastUpdated: Timestamp;
}
export interface ExpertVerification {
    expertId: string;
    steps: {
        identity: {
            status: 'pending' | 'verified' | 'failed';
            documents: string[];
            verifiedAt?: Timestamp;
            verifiedBy?: string;
            notes?: string;
        };
        credentials: {
            status: 'pending' | 'verified' | 'failed';
            licenseVerified: boolean;
            backgroundCheckCompleted: boolean;
            verifiedAt?: Timestamp;
            verifiedBy?: string;
            notes?: string;
        };
        interview: {
            status: 'pending' | 'scheduled' | 'completed' | 'failed';
            scheduledAt?: Timestamp;
            completedAt?: Timestamp;
            interviewerNotes?: string;
            rating?: number;
        };
        practiceTest: {
            status: 'pending' | 'completed' | 'failed';
            score?: number;
            completedAt?: Timestamp;
            notes?: string;
        };
    };
    overallStatus: 'pending' | 'in_progress' | 'approved' | 'rejected';
    approvedAt?: Timestamp;
    approvedBy?: string;
    rejectionReason?: string;
    nextReviewDate: Timestamp;
    recentReviews: {
        date: Timestamp;
        type: 'periodic' | 'complaint_triggered' | 'quality_concern';
        result: 'passed' | 'flagged' | 'action_required';
        notes?: string;
    }[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface ExpertMatchingCriteria {
    userId: string;
    preferences: {
        gender?: 'male' | 'female' | 'any';
        ageRange?: {
            min: number;
            max: number;
        };
        language: string[];
        location?: string;
        specialties: string[];
        approaches: string[];
        experience_level: 'any' | 'junior' | 'senior' | 'expert';
        sessionFormat: ('video' | 'audio' | 'chat' | 'in_person')[];
        sessionDuration: number;
        budget: {
            min: number;
            max: number;
        };
        timePreferences: {
            daysOfWeek: string[];
            timeSlots: {
                start: string;
                end: string;
            }[];
            timezone: string;
        };
        emergencySupport: boolean;
        crisisIntervention: boolean;
        culturalSensitivity: string[];
    };
    weights: {
        specialty_match: number;
        rating: number;
        availability: number;
        experience: number;
        price: number;
        location: number;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface ExpertMatch {
    userId: string;
    expertId: string;
    matchScore: number;
    strengths: string[];
    considerations: string[];
    breakdown: {
        specialty_match: number;
        availability_match: number;
        price_match: number;
        rating_score: number;
        experience_match: number;
        location_match: number;
    };
    recommendationReason: string;
    suggestedSessionType: string;
    estimatedWaitTime: number;
    generatedAt: Timestamp;
    expiresAt: Timestamp;
}
