import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { loginSchema, registerSchema, refreshTokenSchema } from '../types/schemas.js';

const router = Router();

// 회원가입
router.post('/register', 
  validateBody(registerSchema),
  AuthController.register
);

// 로그인
router.post('/login',
  validateBody(loginSchema),
  AuthController.login
);

// 로그아웃
router.post('/logout',
  authenticateToken,
  AuthController.logout
);

// 토큰 갱신
router.post('/refresh',
  validateBody(refreshTokenSchema),
  AuthController.refreshToken
);

// 현재 사용자 정보 조회
router.get('/me',
  authenticateToken,
  AuthController.getCurrentUser
);

// 프로필 업데이트
router.patch('/me',
  authenticateToken,
  AuthController.updateProfile
);

// 비밀번호 변경
router.post('/change-password',
  authenticateToken,
  AuthController.changePassword
);

// 이메일 인증 전송
router.post('/send-verification',
  authenticateToken,
  AuthController.sendEmailVerification
);

// 비밀번호 재설정 요청
router.post('/forgot-password',
  AuthController.forgotPassword
);

// 사용자 역할 및 권한 조회
router.get('/permissions',
  authenticateToken,
  AuthController.getUserPermissions
);

export { router as authRouter };