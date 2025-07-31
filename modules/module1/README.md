# 마음로그 V2.2 - 모듈1

## 📊 제어탑 모니터링 & Notion 동기화 시스템

모듈1은 마음로그 V2.2 프로젝트의 핵심 인프라 모니터링과 외부 시스템 연동을 담당합니다.

### 🎯 주요 기능

#### 1. 제어탑 모니터링 (Control Tower Monitor)
- 마이크로서비스 상태 실시간 추적
- 성능 메트릭 수집 및 분석
- 장애 감지 및 알림
- 로그 중앙 집중화

#### 2. Notion 동기화 핸들러
- 프로젝트 문서 자동 동기화
- 개발 진행상황 업데이트
- 이슈 트래킹 연동
- 팀 협업 문서 관리

### 🚀 실행 방법

```bash
# 개발 모드 실행
npm run dev

# 프로덕션 실행
npm start

# 모니터링만 실행
npm run monitor

# Notion 동기화만 실행
npm run sync
```

### 📁 파일 구조

```
module1/
├── src/
│   └── index.js              # 메인 엔트리 포인트
├── control-tower-monitor.js   # 제어탑 모니터링 시스템
├── notion-sync-handler.js     # Notion 동기화 핸들러
├── package.json              # 패키지 설정
└── README.md                 # 이 파일
```

### 🔧 환경 변수

```env
NOTION_API_TOKEN=your_notion_token
NOTION_DATABASE_ID=your_database_id
FIREBASE_PROJECT_ID=your_project_id
LOG_LEVEL=info
MONITORING_INTERVAL=30000
```

### 📈 모니터링 메트릭

- Response Time (p95 < 200ms 목표)
- Error Rate
- Memory Usage
- CPU Usage
- Active Connections

### 🔄 동기화 대상

- 프로젝트 진행상황
- 버그 리포트
- 개발 문서
- 성능 리포트

---

**CSO 작전담당관** | 마음로그 V2.2 프로젝트