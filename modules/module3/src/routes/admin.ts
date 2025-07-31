import { Router } from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { requireRole, requirePermission } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validation.js';

const router = Router();

// 모든 관리자 라우트는 관리자 권한 필요
router.use(requireRole(['admin', 'super_admin']));

// 시스템 대시보드 데이터
router.get('/dashboard',
  AdminController.getDashboardData
);

// 전체 시스템 통계
router.get('/statistics',
  AdminController.getSystemStatistics
);

// 사용자 관리
router.get('/users',
  AdminController.getAllUsersAdmin
);

// 사용자 일괄 처리
router.post('/users/bulk-action',
  requirePermission(['user_management']),
  AdminController.bulkUserAction
);

// 역할 및 권한 관리
router.get('/roles',
  AdminController.getAllRoles
);

router.post('/roles',
  requirePermission(['role_management']),
  AdminController.createRole
);

router.patch('/roles/:roleId',
  requirePermission(['role_management']),
  AdminController.updateRole
);

router.delete('/roles/:roleId',
  requirePermission(['role_management']),
  AdminController.deleteRole
);

// 권한 관리
router.get('/permissions',
  AdminController.getAllPermissions
);

router.post('/permissions',
  requirePermission(['permission_management']),
  AdminController.createPermission
);

// 시스템 설정 관리
router.get('/settings',
  AdminController.getSystemSettings
);

router.patch('/settings',
  requirePermission(['system_management']),
  AdminController.updateSystemSettings
);

// 로그 관리
router.get('/logs',
  requirePermission(['log_management']),
  AdminController.getSystemLogs
);

router.delete('/logs',
  requirePermission(['log_management']),
  AdminController.clearSystemLogs
);

// 백업 관리
router.post('/backup',
  requirePermission(['backup_management']),
  AdminController.createBackup
);

router.get('/backups',
  AdminController.getBackupList
);

router.post('/restore/:backupId',
  requirePermission(['backup_management']),
  AdminController.restoreBackup
);

// 보안 이벤트 조회
router.get('/security-events',
  requirePermission(['security_management']),
  AdminController.getSecurityEvents
);

// API 사용량 통계
router.get('/api-usage',
  AdminController.getApiUsageStats
);

// 시스템 유지보수
router.post('/maintenance/start',
  requireRole(['super_admin']),
  AdminController.startMaintenanceMode
);

router.post('/maintenance/stop',
  requireRole(['super_admin']),
  AdminController.stopMaintenanceMode
);

// 캐시 관리
router.delete('/cache',
  requirePermission(['cache_management']),
  AdminController.clearCache
);

export { router as adminRouter };