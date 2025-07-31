import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
  timestamp: string;
  endpoint: string;
  method: string;
  statusCode: number;
  contentLength?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetricsHistory = 1000;
  private slowRequestThreshold = 1000; // 1초

  // 메트릭 수집 미들웨어
  middleware = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    const startCpuUsage = process.cpuUsage();

    // 응답 완료 시 메트릭 수집
    res.on('finish', () => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const endCpuUsage = process.cpuUsage(startCpuUsage);

      const metrics: PerformanceMetrics = {
        responseTime,
        memoryUsage: process.memoryUsage(),
        cpuUsage: endCpuUsage,
        timestamp: new Date().toISOString(),
        endpoint: req.route?.path || req.path,
        method: req.method,
        statusCode: res.statusCode,
        contentLength: parseInt(res.get('Content-Length') || '0'),
      };

      this.collectMetrics(metrics, req);
      this.checkPerformanceThresholds(metrics, req);
    });

    next();
  };

  private collectMetrics(metrics: PerformanceMetrics, req: Request): void {
    // 메트릭 히스토리 저장
    this.metrics.push(metrics);
    
    // 최대 히스토리 수 제한
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    // 상세 성능 로그 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      logger.performance(
        `${req.method} ${req.path} - ${metrics.responseTime}ms`,
        metrics.responseTime,
        {
          endpoint: metrics.endpoint,
          statusCode: metrics.statusCode,
          memoryUsed: `${Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024)}MB`,
          cpuUser: `${Math.round(metrics.cpuUsage!.user / 1000)}ms`,
          cpuSystem: `${Math.round(metrics.cpuUsage!.system / 1000)}ms`,
        }
      );
    }
  }

  private checkPerformanceThresholds(metrics: PerformanceMetrics, req: Request): void {
    // 느린 요청 감지
    if (metrics.responseTime > this.slowRequestThreshold) {
      logger.warn(`🐌 Slow request detected`, {
        endpoint: metrics.endpoint,
        method: metrics.method,
        responseTime: metrics.responseTime,
        threshold: this.slowRequestThreshold,
        memoryUsage: metrics.memoryUsage,
        cpuUsage: metrics.cpuUsage,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });
    }

    // 높은 메모리 사용량 감지
    const memoryUsageMB = metrics.memoryUsage.heapUsed / 1024 / 1024;
    if (memoryUsageMB > 400) {
      logger.warn(`📈 High memory usage detected`, {
        memoryUsageMB: Math.round(memoryUsageMB),
        endpoint: metrics.endpoint,
        method: metrics.method,
      });
    }

    // 4xx, 5xx 에러 로깅
    if (metrics.statusCode >= 400) {
      const level = metrics.statusCode >= 500 ? 'error' : 'warn';
      logger[level](`HTTP ${metrics.statusCode} response`, {
        endpoint: metrics.endpoint,
        method: metrics.method,
        responseTime: metrics.responseTime,
        statusCode: metrics.statusCode,
      });
    }
  }

  // 성능 통계 조회
  getPerformanceStats(): {
    totalRequests: number;
    avgResponseTime: number;
    slowRequests: number;
    errorRate: number;
    memoryStats: {
      current: NodeJS.MemoryUsage;
      average: number;
    };
  } {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        slowRequests: 0,
        errorRate: 0,
        memoryStats: {
          current: process.memoryUsage(),
          average: 0,
        },
      };
    }

    const totalRequests = this.metrics.length;
    const avgResponseTime = this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    const slowRequests = this.metrics.filter(m => m.responseTime > this.slowRequestThreshold).length;
    const errorRequests = this.metrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorRequests / totalRequests) * 100;
    
    const avgMemoryUsage = this.metrics.reduce(
      (sum, m) => sum + m.memoryUsage.heapUsed, 0
    ) / totalRequests;

    return {
      totalRequests,
      avgResponseTime: Math.round(avgResponseTime),
      slowRequests,
      errorRate: Math.round(errorRate * 100) / 100,
      memoryStats: {
        current: process.memoryUsage(),
        average: Math.round(avgMemoryUsage / 1024 / 1024),
      },
    };
  }

  // 최근 메트릭 조회
  getRecentMetrics(limit: number = 10): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  // 엔드포인트별 성능 분석
  getEndpointPerformance(): Record<string, {
    count: number;
    avgResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    errorRate: number;
  }> {
    const endpointStats: Record<string, any> = {};

    this.metrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      
      if (!endpointStats[key]) {
        endpointStats[key] = {
          count: 0,
          totalResponseTime: 0,
          minResponseTime: Infinity,
          maxResponseTime: 0,
          errorCount: 0,
        };
      }

      const stats = endpointStats[key];
      stats.count++;
      stats.totalResponseTime += metric.responseTime;
      stats.minResponseTime = Math.min(stats.minResponseTime, metric.responseTime);
      stats.maxResponseTime = Math.max(stats.maxResponseTime, metric.responseTime);
      
      if (metric.statusCode >= 400) {
        stats.errorCount++;
      }
    });

    // 최종 계산
    Object.keys(endpointStats).forEach(key => {
      const stats = endpointStats[key];
      stats.avgResponseTime = Math.round(stats.totalResponseTime / stats.count);
      stats.errorRate = Math.round((stats.errorCount / stats.count) * 100 * 100) / 100;
      
      delete stats.totalResponseTime;
      delete stats.errorCount;
    });

    return endpointStats;
  }

  // 메트릭 리셋
  clearMetrics(): void {
    this.metrics = [];
    logger.info('Performance metrics cleared');
  }
}

export const performanceMonitor = new PerformanceMonitor().middleware;