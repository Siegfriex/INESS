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
  
  // 추가 자격증
  additionalCertifications?: {
    name: string;
    organization: string;
    issueDate: Timestamp;
    expiryDate?: Timestamp;
    verificationDocument: string; // 스토리지 URL
  }[];
  
  // 교육 배경
  education: {
    degree: string;
    institution: string;
    graduationYear: number;
    major: string;
  }[];
  
  // 경력 사항
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
  
  // 전문 분야 세부사항
  specialConditions: string[];
  treatmentMethods: string[];
  certifiedTherapies: string[];
  
  // 경험 수준
  yearsOfExperience: number;
  totalSessionsConducted: number;
  specialtyRating: Record<string, number>; // 분야별 평점
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
    
    // 연락처 (검증된 것만)
    email: string;
    phone?: string;
    
    // 위치
    location: {
      country: string;
      state: string;
      city: string;
      timezone: string;
    };
  };
  
  // 자격 증명
  credentials: ExpertCredentials;
  
  // 전문 분야
  specialties: ExpertSpecialties;
  
  // 서비스 정보
  services: {
    sessionTypes: ('individual' | 'group' | 'couple' | 'family')[];
    sessionFormats: ('video' | 'audio' | 'chat' | 'in_person')[];
    sessionDurations: number[]; // 분 단위
    
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
  
  // 상태
  status: 'active' | 'inactive' | 'on_leave' | 'suspended';
  joinedAt: Timestamp;
  lastActiveAt: Timestamp;
  profileCompleteness: number; // 0-100%
}

export interface ExpertAvailability {
  expertId: string;
  
  // 정기 가용성
  weeklySchedule: {
    [key: string]: { // 'monday', 'tuesday', etc.
      available: boolean;
      timeSlots: {
        start: string; // HH:MM
        end: string;   // HH:MM
        sessionType?: string;
      }[];
    };
  };
  
  // 특별 일정
  customSchedule: {
    date: string; // YYYY-MM-DD
    available: boolean;
    timeSlots?: {
      start: string;
      end: string;
      reason?: string;
    }[];
    note?: string;
  }[];
  
  // 예약된 시간
  bookedSlots: {
    sessionId: string;
    userId: string;
    startTime: Timestamp;
    endTime: Timestamp;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  }[];
  
  // 가용성 설정
  settings: {
    advanceBookingDays: number; // 몇 일 전까지 예약 가능
    minNoticeHours: number;     // 최소 몇 시간 전 예약
    maxSessionsPerDay: number;
    bufferTimeBetweenSessions: number; // 분
    autoAcceptBookings: boolean;
  };
  
  updatedAt: Timestamp;
}

export interface ExpertReviews {
  expertId: string;
  
  // 전체 통계
  overall: {
    averageRating: number;
    totalReviews: number;
    totalSessions: number;
    recommendationRate: number; // 0-100%
    responseTime: number; // 평균 응답 시간(시간)
  };
  
  // 세부 평가
  ratings: {
    professionalism: number;
    effectiveness: number;
    communication: number;
    empathy: number;
    punctuality: number;
  };
  
  // 리뷰 목록
  reviews: {
    id: string;
    userId: string; // 익명화됨
    rating: number;
    comment?: string;
    specialtyTags: string[];
    sessionType: string;
    wouldRecommend: boolean;
    createdAt: Timestamp;
    
    // 검증
    verified: boolean;
    flagged: boolean;
    helpfulVotes: number;
  }[];
  
  // 트렌드
  monthlyStats: {
    month: string; // YYYY-MM
    sessionsCompleted: number;
    averageRating: number;
    newReviews: number;
  }[];
  
  lastUpdated: Timestamp;
}

export interface ExpertVerification {
  expertId: string;
  
  // 검증 단계
  steps: {
    identity: {
      status: 'pending' | 'verified' | 'failed';
      documents: string[]; // 스토리지 URL들
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
  
  // 전체 상태
  overallStatus: 'pending' | 'in_progress' | 'approved' | 'rejected';
  approvedAt?: Timestamp;
  approvedBy?: string;
  rejectionReason?: string;
  
  // 재검증
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

// Expert 매칭 시스템
export interface ExpertMatchingCriteria {
  userId: string;
  
  preferences: {
    // 기본 선호사항
    gender?: 'male' | 'female' | 'any';
    ageRange?: { min: number; max: number };
    language: string[];
    location?: string;
    
    // 전문성 요구사항
    specialties: string[];
    approaches: string[];
    experience_level: 'any' | 'junior' | 'senior' | 'expert';
    
    // 서비스 선호사항
    sessionFormat: ('video' | 'audio' | 'chat' | 'in_person')[];
    sessionDuration: number;
    budget: { min: number; max: number };
    
    // 일정 선호사항
    timePreferences: {
      daysOfWeek: string[];
      timeSlots: { start: string; end: string }[];
      timezone: string;
    };
    
    // 특별 요구사항
    emergencySupport: boolean;
    crisisIntervention: boolean;
    culturalSensitivity: string[];
  };
  
  // 매칭 가중치
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
  
  matchScore: number; // 0-100
  
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
  estimatedWaitTime: number; // 시간
  
  generatedAt: Timestamp;
  expiresAt: Timestamp;
}