# Firebase-Google Cloud Platform 통합 가이드

마음로그 V2.2 프로젝트의 Firebase와 Google Cloud Platform 간 완전 통합 설정 가이드입니다.

## 🎯 통합 개요

### 구성 요소
- **Firebase**: 인증, Firestore, Storage, Functions, Hosting
- **Google Cloud**: KMS, BigQuery, Cloud SQL, Pub/Sub, Secret Manager
- **AI/ML**: Speech-to-Text, Text-to-Speech, Translation API
- **모니터링**: Cloud Monitoring, Logging, Alerting

### 아키텍처
```
┌─────────────────────────────────────────┐
│              Frontend App                │
│            (React Native)               │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│               Firebase                  │
│  ┌─────────┬─────────┬─────────────────┤
│  │   Auth  │Firestore│   Functions     │
│  └─────────┴─────────┴─────────────────┤
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│            Google Cloud                 │
│  ┌─────────┬─────────┬─────────┬───────┤
│  │   KMS   │BigQuery │Cloud SQL│PubSub │
│  ├─────────┼─────────┼─────────┼───────┤
│  │ Storage │ AI APIs │Monitoring│Secret │
│  │         │         │          │Manager│
│  └─────────┴─────────┴─────────┴───────┘
└─────────────────────────────────────────┘
```

## 🚀 빠른 시작

### 1단계: 자동 설정 실행
```bash
# 스크립트에 실행 권한 부여 (이미 완료됨)
chmod +x scripts/setup-gcp-integration.sh

# 환경 변수 설정
export PROJECT_ID="maumlog-prod-env"
export REGION="us-central1"
export ADMIN_EMAIL="your-admin@email.com"

# 자동 설정 실행
./scripts/setup-gcp-integration.sh
```

### 2단계: API 키 설정
```bash
# OpenAI API 키
echo "your-openai-api-key" | gcloud secrets create openai-api-key --data-file=-

# Claude API 키
echo "your-claude-api-key" | gcloud secrets create claude-api-key --data-file=-

# 기타 필요한 API 키들
echo "your-stripe-key" | gcloud secrets create stripe-secret-key --data-file=-
```

### 3단계: Functions 배포
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

## 📋 수동 설정 (필요시)

### Google Cloud 프로젝트 설정
```bash
# 프로젝트 생성
gcloud projects create maumlog-prod-env --name="MaumLog Production"

# 프로젝트 설정
gcloud config set project maumlog-prod-env

# 결제 계정 연결 (콘솔에서 수동 설정 필요)
```

### API 활성화
```bash
gcloud services enable \
  cloudfunctions.googleapis.com \
  firestore.googleapis.com \
  storage-api.googleapis.com \
  cloudkms.googleapis.com \
  bigquery.googleapis.com \
  secretmanager.googleapis.com \
  pubsub.googleapis.com
```

### Firebase 프로젝트 연결
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 초기화
firebase init

# 프로젝트 연결
firebase use maumlog-prod-env
```

## 🗂️ 인프라 구성 요소

### Cloud Storage 버킷
- `maumlog-user-data-us-central1`: 사용자 데이터
- `maumlog-ai-models-us-central1`: AI 모델 저장
- `maumlog-backups-us-central1`: 백업 데이터
- `maumlog-logs-us-central1`: 로그 파일

### BigQuery 데이터셋
- `analytics`: 사용자 분석 데이터
- `ai_training`: AI 훈련 데이터
- `compliance_logs`: 컴플라이언스 감사 로그
- `performance_metrics`: 성능 메트릭

### Cloud KMS 키
- `user-data-encryption`: 사용자 데이터 암호화
- `ai-model-encryption`: AI 모델 암호화
- `backup-encryption`: 백업 암호화
- `session-encryption`: 세션 데이터 암호화

### Pub/Sub 토픽
- `emotion-analysis-queue`: 감정 분석 작업 큐
- `crisis-alerts`: 위기 상황 알림
- `ai-training-data`: AI 훈련 데이터 파이프라인
- `audit-logs`: 감사 로그 스트림

## 🔧 Terraform으로 인프라 관리

### 초기 설정
```bash
cd deployment/terraform

# Terraform 초기화
terraform init

# 변수 파일 생성
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars 파일 편집

# 계획 확인
terraform plan

# 인프라 배포
terraform apply
```

### 주요 Terraform 리소스
- **Storage**: Cloud Storage 버킷 및 라이프사이클 정책
- **KMS**: 암호화 키 및 키링
- **BigQuery**: 데이터셋 및 권한
- **Pub/Sub**: 토픽 및 구독
- **Cloud SQL**: PostgreSQL 인스턴스
- **VPC**: 프라이빗 네트워크
- **IAM**: 서비스 계정 및 권한

## 🔐 보안 설정

### 서비스 계정 권한
```bash
# Firebase Admin SDK 서비스 계정 권한
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:firebase-adminsdk@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"

# 추가 필요 권한들
- roles/datastore.owner
- roles/storage.admin
- roles/cloudkms.cryptoKeyEncrypterDecrypter
- roles/bigquery.dataEditor
- roles/secretmanager.secretAccessor
```

### API 키 보안
```bash
# Secret Manager에 저장
gcloud secrets create api-key-name --data-file=-

# Functions에서 접근
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();
const [version] = await client.accessSecretVersion({
  name: 'projects/PROJECT_ID/secrets/api-key-name/versions/latest',
});
```

## 📊 모니터링 설정

### Cloud Monitoring 알림
```bash
# 에러율 알림 (수동 설정 필요)
- Cloud Functions 에러율 > 5%
- Firestore 읽기/쓰기 실패
- Storage 업로드 실패

# 성능 알림
- 응답 시간 > 2초
- 메모리 사용률 > 80%
- CPU 사용률 > 90%
```

### 로그 수집
```bash
# BigQuery로 로그 내보내기
gcloud logging sinks create firebase-logs \
  bigquery.googleapis.com/projects/$PROJECT_ID/datasets/compliance_logs \
  --log-filter='resource.type="cloud_function"'
```

## 🧪 테스트 및 검증

### 통합 테스트
```bash
# Functions 테스트
cd functions
npm test

# 엔드투엔드 테스트
npm run test:e2e

# 성능 테스트
npm run test:performance
```

### 헬스 체크
```bash
# Functions 상태 확인
curl https://us-central1-maumlog-prod-env.cloudfunctions.net/getHealthStatus

# Firestore 연결 테스트
firebase firestore:rules --test

# Storage 권한 테스트
gsutil ls gs://maumlog-user-data-us-central1
```

## 🚨 트러블슈팅

### 일반적인 문제들

#### 1. 권한 오류
```bash
# 서비스 계정 키 확인
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"

# IAM 권한 확인
gcloud projects get-iam-policy $PROJECT_ID
```

#### 2. API 할당량 초과
```bash
# 할당량 확인
gcloud compute project-info describe --project=$PROJECT_ID

# 할당량 증가 요청 (콘솔에서)
```

#### 3. 네트워크 연결 문제
```bash
# VPC 피어링 확인
gcloud compute networks peerings list

# 방화벽 규칙 확인
gcloud compute firewall-rules list
```

### 로그 확인
```bash
# Cloud Functions 로그
gcloud functions logs read FUNCTION_NAME

# Firestore 로그
gcloud logging read 'resource.type="datastore_database"'

# 전체 프로젝트 로그
gcloud logging read 'timestamp>="2024-01-01T00:00:00Z"'
```

## 📚 추가 리소스

### 문서
- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Google Cloud 문서](https://cloud.google.com/docs)
- [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)

### 대시보드
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Cloud Functions](https://console.cloud.google.com/functions)
- [Cloud Storage](https://console.cloud.google.com/storage)
- [BigQuery](https://console.cloud.google.com/bigquery)

### 지원
- [Firebase Support](https://firebase.google.com/support)
- [Google Cloud Support](https://cloud.google.com/support)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase+google-cloud-platform)

---

## 🎯 다음 단계

1. **환경별 설정**: 개발/스테이징/프로덕션 환경 분리
2. **CI/CD 파이프라인**: GitHub Actions 또는 Cloud Build 설정
3. **백업 전략**: 자동 백업 및 재해 복구 계획
4. **성능 최적화**: CDN, 캐싱, 데이터베이스 최적화
5. **국제화**: 다중 리전 배포 준비

**설정이 완료되면 모든 서비스가 통합되어 운영됩니다!** 🚀