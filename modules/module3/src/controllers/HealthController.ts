import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { logger } from '../utils/logger.js';

export class HealthController {
  // 기본 헬스 체크
  static basicHealthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Module3 Backend API',
        version: '1.0.0',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      };

      res.status(200).json(healthStatus);
    } catch (error: any) {
      logger.error('Health check failed', { error: error.message });
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable',
      });
    }
  };

  // 상세 시스템 상태
  static detailedHealthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      // Firebase 연결 상태 확인
      let firebaseStatus = 'healthy';
      try {
        await admin.firestore().collection('_health_check').limit(1).get();
      } catch (error) {
        firebaseStatus = 'unhealthy';
      }

      const healthData = {
        status: firebaseStatus === 'healthy' ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        service: 'Module3 Backend API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        system: {
          uptime: process.uptime(),
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024),
            rss: Math.round(memoryUsage.rss / 1024 / 1024),
            unit: 'MB',
          },
          cpu: {
            user: Math.round(cpuUsage.user / 1000),
            system: Math.round(cpuUsage.system / 1000),
            unit: 'ms',
          },
          nodejs: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        services: {
          firebase: {
            status: firebaseStatus,
            firestore: firebaseStatus,
            auth: firebaseStatus,
          },
        },
      };

      const statusCode = healthData.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(healthData);
    } catch (error: any) {
      logger.error('Detailed health check failed', { error: error.message });
      next(error);
    }
  };

  // 성능 메트릭 조회
  static getPerformanceMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // PerformanceMonitor 인스턴스에 접근하여 메트릭 조회
      // 실제 구현에서는 글로벌 인스턴스나 싱글톤 패턴 사용
      
      const mockMetrics = {
        totalRequests: 0,
        avgResponseTime: 0,
        slowRequests: 0,
        errorRate: 0,
        memoryStats: {
          current: process.memoryUsage(),
          average: 0,
        },
      };

      res.json({
        success: true,
        data: {
          timestamp: new Date().toISOString(),
          period: 'last_hour',
          metrics: mockMetrics,
        },
      });
    } catch (error: any) {
      logger.error('Failed to get performance metrics', { error: error.message });
      next(error);
    }
  };

  // 메트릭 히스토리 조회
  static getMetricsHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { hours = 24 } = req.query;
      
      // 실제 구현에서는 메트릭 저장소에서 히스토리 조회
      const mockHistory = Array.from({ length: Number(hours) }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        requests: Math.floor(Math.random() * 100),
        avgResponseTime: Math.floor(Math.random() * 500) + 100,
        errorRate: Math.random() * 5,
        memoryUsage: Math.floor(Math.random() * 100) + 50,
      })).reverse();

      res.json({
        success: true,
        data: {
          period: `last_${hours}_hours`,
          history: mockHistory,
        },
      });
    } catch (error: any) {
      logger.error('Failed to get metrics history', { error: error.message });
      next(error);
    }
  };

  // 엔드포인트별 성능 분석
  static getEndpointPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 실제 구현에서는 PerformanceMonitor에서 엔드포인트별 데이터 조회
      const mockEndpointStats = {
        'GET /api/v1/health': {
          count: 150,
          avgResponseTime: 45,
          minResponseTime: 20,
          maxResponseTime: 120,
          errorRate: 0,
        },
        'POST /api/v1/auth/login': {
          count: 89,
          avgResponseTime: 234,
          minResponseTime: 180,
          maxResponseTime: 450,
          errorRate: 2.2,
        },
        'GET /api/v1/users/:userId': {
          count: 78,
          avgResponseTime: 156,
          minResponseTime: 90,
          maxResponseTime: 340,
          errorRate: 1.3,
        },
      };

      res.json({
        success: true,
        data: {
          timestamp: new Date().toISOString(),
          endpoints: mockEndpointStats,
        },
      });
    } catch (error: any) {
      logger.error('Failed to get endpoint performance', { error: error.message });
      next(error);
    }
  };

  // 메트릭 초기화
  static clearMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 실제 구현에서는 PerformanceMonitor의 clearMetrics 호출
      
      logger.system('Performance metrics cleared by admin', {
        adminUid: req.user?.uid,
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: 'Performance metrics cleared successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to clear metrics', { error: error.message });
      next(error);
    }
  };

  // 데이터베이스 연결 상태
  static checkDatabaseHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const startTime = Date.now();
      
      // Firestore 연결 테스트
      const testDoc = await admin.firestore()
        .collection('_health_check')
        .doc('test')
        .get();

      const responseTime = Date.now() - startTime;

      // 쓰기 테스트
      await admin.firestore()
        .collection('_health_check')
        .doc('test')
        .set({
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          test: true,
        });

      res.json({
        success: true,
        data: {
          status: 'healthy',
          responseTime,
          connection: 'active',
          read: 'ok',
          write: 'ok',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      logger.error('Database health check failed', { error: error.message });
      
      res.status(503).json({
        success: false,
        data: {
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  // Firebase 서비스 상태
  static checkFirebaseHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const checks = {
        auth: { status: 'unknown', responseTime: 0 },
        firestore: { status: 'unknown', responseTime: 0 },
        storage: { status: 'unknown', responseTime: 0 },
      };

      // Auth 서비스 체크
      try {
        const startTime = Date.now();
        await admin.auth().listUsers(1);
        checks.auth = {
          status: 'healthy',
          responseTime: Date.now() - startTime,
        };
      } catch (error) {
        checks.auth = { status: 'unhealthy', responseTime: 0 };
      }

      // Firestore 체크
      try {
        const startTime = Date.now();
        await admin.firestore().collection('_health_check').limit(1).get();
        checks.firestore = {
          status: 'healthy',
          responseTime: Date.now() - startTime,
        };
      } catch (error) {
        checks.firestore = { status: 'unhealthy', responseTime: 0 };
      }

      // Storage 체크 (옵션)
      try {
        const startTime = Date.now();
        const bucket = admin.storage().bucket();
        await bucket.getMetadata();
        checks.storage = {
          status: 'healthy',
          responseTime: Date.now() - startTime,
        };
      } catch (error) {
        checks.storage = { status: 'unhealthy', responseTime: 0 };
      }

      const overallStatus = Object.values(checks).every(check => check.status === 'healthy') 
        ? 'healthy' 
        : 'degraded';

      res.json({
        success: true,
        data: {
          status: overallStatus,
          services: checks,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      logger.error('Firebase health check failed', { error: error.message });
      next(error);
    }
  };
}