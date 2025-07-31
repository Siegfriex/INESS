import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { 
  authenticateToken, 
  requireRole, 
  requireOwnership,
  requireEmailVerified
} from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validation.js';
import { updateUserSchema, getUsersQuerySchema } from '../types/schemas.js';

const router = Router();

// 모든 사용자 라우트는 인증 필요
router.use(authenticateToken);

// 사용자 목록 조회 (관리자만)
router.get('/',
  requireRole(['admin', 'moderator']),
  validateQuery(getUsersQuerySchema),
  UserController.getUsers
);

// 특정 사용자 조회
router.get('/:userId',
  UserController.getUserById
);

// 사용자 정보 업데이트 (본인 또는 관리자만)
router.patch('/:userId',
  requireOwnership((req) => req.params.userId),
  validateBody(updateUserSchema),
  UserController.updateUser
);

// 사용자 삭제 (본인 또는 관리자만)
router.delete('/:userId',
  requireOwnership((req) => req.params.userId),
  UserController.deleteUser
);

// 사용자 활성화/비활성화 (관리자만)
router.patch('/:userId/status',
  requireRole(['admin']),
  UserController.toggleUserStatus
);

// 사용자 역할 관리 (관리자만)
router.patch('/:userId/roles',
  requireRole(['admin']),
  UserController.updateUserRoles
);

// 사용자 권한 관리 (관리자만)
router.patch('/:userId/permissions',
  requireRole(['admin']),
  UserController.updateUserPermissions
);

// 사용자 활동 로그 조회
router.get('/:userId/activity',
  requireOwnership((req) => req.params.userId),
  UserController.getUserActivity
);

// 사용자 통계 조회 (관리자만)
router.get('/:userId/stats',
  requireRole(['admin', 'moderator']),
  UserController.getUserStats
);

export { router as userRouter };