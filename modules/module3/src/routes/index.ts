import { Router } from 'express';
import { authRouter } from './auth.js';
import { userRouter } from './users.js';
import { adminRouter } from './admin.js';
import { healthRouter } from './health.js';

const router = Router();

// API 라우터 연결
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/admin', adminRouter);
router.use('/health', healthRouter);

// API 정보 엔드포인트
router.get('/', (req, res) => {
  res.json({
    name: 'Module3 Backend API',
    version: '1.0.0',
    description: '백엔드 API 개발 전담 AI 에이전트 모듈',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      admin: '/api/v1/admin',
      health: '/api/v1/health',
    },
    documentation: '/api/v1/docs',
    timestamp: new Date().toISOString(),
  });
});

export { router as apiRouter };