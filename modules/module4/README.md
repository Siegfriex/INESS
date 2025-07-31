# Module4 - Database Agent 🗄️

## 🎯 역할
**데이터베이스 관리 전담 AI 에이전트**
- 데이터베이스 스키마 설계 및 최적화
- 데이터 모델링 및 관계 설계
- 성능 튜닝 및 쿼리 최적화
- 실시간 모니터링 및 건강 상태 관리

## 🏗️ 아키텍처

### 핵심 컴포넌트
```
Module4/
├── src/
│   ├── models/           # 데이터 모델 정의
│   │   ├── UserModel.ts      # 사용자 데이터 모델
│   │   ├── EmotionModel.ts   # 감정 체크인 모델
│   │   ├── JournalModel.ts   # 일기 데이터 모델
│   │   ├── ExpertModel.ts    # 전문가 프로필 모델
│   │   └── index.ts
│   ├── services/         # 핵심 서비스
│   │   ├── FirestoreService.ts    # Firebase 연결 및 CRUD
│   │   ├── SchemaValidator.ts     # 데이터 검증
│   │   ├── PerformanceMonitor.ts  # 성능 모니터링
│   │   ├── DatabaseAgent.ts       # 메인 에이전트
│   │   └── index.ts
│   ├── config/           # 설정 파일
│   │   └── firebase.ts       # Firebase 설정
│   ├── types/            # TypeScript 타입
│   │   └── index.ts
│   └── index.ts          # 메인 진입점
├── firestore.rules       # 보안 규칙
├── package.json
└── tsconfig.json
```

### 데이터 모델

#### 🧑‍🤝‍🧑 사용자 (User)
```typescript
interface User {
  core: UserCore;           // 기본 정보
  profile?: UserProfile;    // 프로필 정보
  settings: UserSettings;   // 앱 설정
  subscription: UserSubscription; // 구독 정보
  privacy: UserPrivacy;     // 개인정보 보호
  stats: UserStats;         // 사용 통계
}
```

#### 💭 감정 체크인 (EmotionCheckin)
```typescript
interface EmotionCheckin {
  id: string;
  userId: string;
  structure: EmotionStructure;  // 감정 구조
  analysis: AIAnalysis;         // AI 분석 결과
  media?: EmotionMedia[];       // 첨부 미디어
  // + 메타데이터, 개인정보 보호, 검증 정보
}
```

#### 📝 일기 (JournalEntry)
```typescript
interface JournalEntry {
  id: string;
  userId: string;
  content: JournalContent;      // 내용
  analysis?: JournalAnalysis;   // 텍스트 분석
  privacy: JournalPrivacy;      // 공개 설정
  // + 메타데이터, 상호작용, 검증 정보
}
```

#### 👨‍⚕️ 전문가 (ExpertProfile)
```typescript
interface ExpertProfile {
  uid: string;
  personalInfo: object;         // 개인 정보
  credentials: ExpertCredentials; // 자격 증명
  specialties: ExpertSpecialties; // 전문 분야
  services: object;             // 서비스 정보
  status: string;               // 활동 상태
}
```

## 🚀 사용법

### 기본 사용
```typescript
import { Module4Agent } from './src/index';

// 에이전트 초기화 및 시작
const agent = new Module4Agent();
await agent.start();

// Database Agent 인스턴스 가져오기
const databaseAgent = agent.getDatabaseAgent();
```

### 사용자 데이터 관리
```typescript
// 새 사용자 생성
const userId = await databaseAgent.createUser({
  core: {
    uid: 'user123',
    email: 'user@example.com',
    emailVerified: true,
    isActive: true,
    // ... 기타 필드
  },
  settings: defaultUserSettings,
  subscription: defaultUserSubscription,
  // ... 기타 필드
});

// 사용자 감정 데이터 조회
const emotions = await databaseAgent.getUserEmotions('user123', 20);
```

### 감정 체크인 저장
```typescript
const emotionData: EmotionCheckin = {
  id: 'emotion123',
  userId: 'user123',
  structure: {
    emotions: [{ primary: 'joy', intensity: 8 }],
    dominantEmotion: { primary: 'joy', intensity: 8 },
    triggers: [],
    context: { /* 컨텍스트 정보 */ }
  },
  analysis: {
    riskLevel: 'low',
    patterns: { /* 패턴 분석 */ },
    insights: { /* AI 인사이트 */ },
    // ... 기타 분석 데이터
  },
  // ... 기타 필드
};

await databaseAgent.saveEmotionCheckin(emotionData);
```

### 성능 모니터링
```typescript
// 성능 리포트 조회
const performanceReport = databaseAgent.getPerformanceReport();
console.log('전체 쿼리 수:', performanceReport.summary.totalQueries);
console.log('평균 쿼리 시간:', performanceReport.summary.avgQueryTime);
console.log('느린 쿼리 비율:', performanceReport.summary.slowQueriesPercent);
```

## 🔐 보안 및 권한

### Firestore Security Rules
- **사용자 데이터**: 본인만 읽기/쓰기 가능
- **감정 데이터**: 본인 + 위기 상황 시 전문가 접근
- **일기 데이터**: 공개 설정에 따라 접근 제어
- **전문가 데이터**: 검증된 전문가만 공개 프로필 조회
- **시스템 데이터**: 관리자만 접근

### 데이터 검증
```typescript
// 스키마 검증
const validator = databaseAgent.getSchemaValidator();
const result = validator.validate('User', userData);

if (!result.valid) {
  console.error('검증 실패:', result.errors);
}
```

## 📊 성능 최적화

### 인덱스 설정
- 사용자별 감정 데이터: `userId + createdAt`
- 위기 상황 감지: `riskLevel + createdAt`
- 전문가 검색: `specialties + status`
- 일기 공개 글: `visibility + createdAt`

### 성능 임계값
- 쿼리 시간 경고: 1초
- 쿼리 시간 위험: 3초
- 읽기 작업 경고: 100개 문서
- 읽기 작업 위험: 500개 문서

## 🔍 모니터링 및 건강 관리

### 자동 모니터링
- **실시간 성능 추적**: 모든 쿼리 성능 측정
- **건강 상태 체크**: 5분마다 시스템 상태 확인
- **위기 상황 감지**: 고위험 감정 데이터 실시간 알림
- **트렌드 분석**: 사용자별 감정 패턴 분석

### 알림 시스템
- 성능 저하 감지 시 자동 알림
- 위기 상황 감지 시 즉시 개입
- 데이터 무결성 문제 시 경고

## 🛠️ 개발 및 배포

### 환경 설정
```bash
# 의존성 설치
npm install

# 개발 모드 실행
npm run dev

# 빌드
npm run build

# 테스트
npm test

# Firestore 에뮬레이터 실행
npm run db:emulator
```

### 환경 변수
```env
FIREBASE_PROJECT_ID=maumlog-v2
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NODE_ENV=development
AUTO_START=true
```

## 📈 성과 지표

### 성능 지표
- **쿼리 응답 시간**: 평균 < 200ms
- **처리량**: 초당 100+ 쿼리 처리
- **가용성**: 99.9% 업타임 목표

### 효율성 지표
- **스토리지 사용량**: 최적화된 문서 구조
- **인덱스 효율성**: 모든 쿼리 인덱스 사용
- **데이터 중복**: 최소화된 중복 데이터

### 안정성 지표
- **데이터 무결성**: 100% 스키마 검증
- **백업 성공률**: 99.9%
- **보안 규칙 커버리지**: 100%

## 🤝 다른 모듈과의 협업

### 상위 보고
- **ARGO (Module1)**: 전체 시스템 아키텍처 결정 보고

### 협업 모듈
- **Module2 (Frontend)**: 데이터 구조 및 API 스키마 협의
- **Module3 (Backend)**: API 엔드포인트 데이터 검증
- **Module5 (AI Service)**: AI 분석용 데이터 요구사항 정의

---

*Module4는 마음로그 플랫폼의 든든한 데이터 기반을 제공하는 핵심 에이전트입니다.*