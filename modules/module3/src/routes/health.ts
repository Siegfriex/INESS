import { Router } from 'express';
import { HealthController } from '../controllers/HealthController.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

// 기본 헬스 체크 (인증 불필요)
router.get('/', HealthController.basicHealthCheck);

// 상세 시스템 상태 (관리자만)
router.get('/detailed',
  requireRole(['admin']),
  HealthController.detailedHealthCheck
);

// 성능 메트릭 조회 (관리자만)
router.get('/metrics',
  requireRole(['admin']),
  HealthController.getPerformanceMetrics
);

// 메트릭 히스토리 조회 (관리자만)
router.get('/metrics/history',
  requireRole(['admin']),
  HealthController.getMetricsHistory
);

// 엔드포인트별 성능 분석 (관리자만)
router.get('/metrics/endpoints',
  requireRole(['admin']),
  HealthController.getEndpointPerformance
);

// 메트릭 초기화 (관리자만)
router.delete('/metrics',
  requireRole(['admin']),
  HealthController.clearMetrics
);

// 데이터베이스 연결 상태
router.get('/database',
  requireRole(['admin']),
  HealthController.checkDatabaseHealth
);

// Firebase 서비스 상태
router.get('/firebase',
  requireRole(['admin']),
  HealthController.checkFirebaseHealth
);

export { router as healthRouter };