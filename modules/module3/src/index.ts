import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import admin from 'firebase-admin';

import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { performanceMonitor } from './middleware/performanceMonitor.js';

// Firebase Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp();
}

// Firebase Functions 글로벌 설정
setGlobalOptions({
  region: 'asia-northeast3', // 서울 리전
  maxInstances: 10,
  memory: '512MiB',
  timeoutSeconds: 60,
});

// Express 앱 생성
const app = express();

// 기본 미들웨어 설정
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// 성능 모니터링 미들웨어
app.use(performanceMonitor);

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Module3 Backend API',
    version: '1.0.0',
  });
});

// API 라우터 연결
app.use('/api/v1', apiRouter);

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// 에러 핸들링 미들웨어
app.use(errorHandler);

// Firebase Functions 내보내기
export const api = onRequest({
  region: 'asia-northeast3',
  memory: '512MiB',
  timeoutSeconds: 60,
  maxInstances: 10,
}, app);

// 로컬 개발용 서버
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3003;
  app.listen(PORT, () => {
    logger.info(`🚀 Module3 Backend API server running on port ${PORT}`);
    logger.info(`📋 Health check: http://localhost:${PORT}/health`);
    logger.info(`🔗 API base URL: http://localhost:${PORT}/api/v1`);
  });
}

export default app;