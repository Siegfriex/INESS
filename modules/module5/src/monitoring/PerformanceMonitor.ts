/**
 * Performance Monitor
 * AI 서비스의 성능과 메트릭을 모니터링하는 시스템
 */

import { performanceLogger, aiLogger } from '../utils/logger';

export interface PerformanceMetric {
  timestamp: string;
  metricType: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}

export interface AIUsageMetric {
  provider: string;
  model: string;
  tokensUsed: number;
  responseTime: number;
  cost: number;
  timestamp: string;
}

export interface SystemMetric {
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  queueSize: number;
  timestamp: string;
}

export interface PerformanceSummary {
  totalRequests: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  totalCost: number;
  errorRate: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  lastUpdated: string;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private aiUsageMetrics: AIUsageMetric[] = [];
  private systemMetrics: SystemMetric[] = [];
  private isRunning: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;
  private metricsRetentionDays: number = 7;

  // AI 모델별 비용 (토큰당 USD)
  private readonly modelCosts = {
    'gpt-4': { input: 0.00003, output: 0.00006 },
    'gpt-3.5-turbo': { input: 0.0000015, output: 0.000002 },
    'claude-3-sonnet': { input: 0.000003, output: 0.000015 },
    'claude-3-haiku': { input: 0.00000025, output: 0.00000125 }
  };

  constructor() {
    performanceLogger.info('📊 PerformanceMonitor 생성됨');
  }

  /**
   * 성능 모니터링 시작
   */
  async start(): Promise<void> {
    try {
      if (this.isRunning) {
        performanceLogger.warn('⚠️ PerformanceMonitor가 이미 실행 중입니다');
        return;
      }

      performanceLogger.info('🚀 PerformanceMonitor 시작...');

      // 시스템 메트릭 수집 시작 (10초마다)
      this.monitoringInterval = setInterval(() => {
        this.collectSystemMetrics();
      }, 10000);

      // 오래된 메트릭 정리 (1시간마다)
      setInterval(() => {
        this.cleanupOldMetrics();
      }, 3600000);

      this.isRunning = true;
      performanceLogger.info('✅ PerformanceMonitor 시작 완료');

    } catch (error) {
      performanceLogger.error('❌ PerformanceMonitor 시작 실패:', error);
      throw error;
    }
  }

  /**
   * AI 사용 메트릭 기록
   */
  recordAIUsage(metric: Omit<AIUsageMetric, 'timestamp' | 'cost'>): void {
    try {
      const cost = this.calculateCost(metric.model, metric.tokensUsed);
      
      const aiMetric: AIUsageMetric = {
        ...metric,
        cost,
        timestamp: new Date().toISOString()
      };

      this.aiUsageMetrics.push(aiMetric);

      // 성능 메트릭으로도 기록
      this.recordMetric({
        timestamp: aiMetric.timestamp,
        metricType: 'ai_response_time',
        value: metric.responseTime,
        unit: 'ms',
        tags: {
          provider: metric.provider,
          model: metric.model
        }
      });

      this.recordMetric({
        timestamp: aiMetric.timestamp,
        metricType: 'ai_tokens_used',
        value: metric.tokensUsed,
        unit: 'tokens',
        tags: {
          provider: metric.provider,
          model: metric.model
        }
      });

      this.recordMetric({
        timestamp: aiMetric.timestamp,
        metricType: 'ai_cost',
        value: cost,
        unit: 'usd',
        tags: {
          provider: metric.provider,
          model: metric.model
        }
      });

      performanceLogger.info('📈 AI 사용 메트릭 기록됨', {
        provider: metric.provider,
        model: metric.model,
        tokensUsed: metric.tokensUsed,
        responseTime: metric.responseTime,
        cost: cost.toFixed(6)
      });

    } catch (error) {
      performanceLogger.error('❌ AI 사용 메트릭 기록 실패:', error);
    }
  }

  /**
   * 일반 성능 메트릭 기록
   */
  recordMetric(metric: PerformanceMetric): void {
    try {
      this.metrics.push(metric);
      
      // 중요한 메트릭은 즉시 로깅
      if (this.isCriticalMetric(metric)) {
        performanceLogger.warn('⚠️ 중요 메트릭 감지:', metric);
      }

    } catch (error) {
      performanceLogger.error('❌ 메트릭 기록 실패:', error);
    }
  }

  /**
   * 시스템 메트릭 수집
   */
  private async collectSystemMetrics(): Promise<void> {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      const systemMetric: SystemMetric = {
        cpuUsage: cpuUsage.user + cpuUsage.system,
        memoryUsage: memUsage.heapUsed / 1024 / 1024, // MB
        activeConnections: 0, // 실제 구현 필요
        queueSize: 0, // 실제 구현 필요
        timestamp: new Date().toISOString()
      };

      this.systemMetrics.push(systemMetric);

      // 성능 메트릭으로도 기록
      this.recordMetric({
        timestamp: systemMetric.timestamp,
        metricType: 'system_memory_usage',
        value: systemMetric.memoryUsage,
        unit: 'mb'
      });

      this.recordMetric({
        timestamp: systemMetric.timestamp,
        metricType: 'system_cpu_usage',
        value: systemMetric.cpuUsage,
        unit: 'microseconds'
      });

    } catch (error) {
      performanceLogger.error('❌ 시스템 메트릭 수집 실패:', error);
    }
  }

  /**
   * AI 모델 비용 계산
   */
  private calculateCost(model: string, tokensUsed: number): number {
    const modelKey = Object.keys(this.modelCosts).find(key => 
      model.toLowerCase().includes(key.replace('-', ''))
    );

    if (!modelKey) {
      performanceLogger.warn(`⚠️ 알 수 없는 모델 비용: ${model}`);
      return 0;
    }

    const modelCosts = this.modelCosts;
    const costs = modelCosts[modelKey as keyof typeof modelCosts];
    // 간단하게 평균 비용으로 계산 (실제로는 입력/출력 토큰 구분 필요)
    const averageCost = (costs.input + costs.output) / 2;
    
    return tokensUsed * averageCost;
  }

  /**
   * 중요 메트릭 판단
   */
  private isCriticalMetric(metric: PerformanceMetric): boolean {
    switch (metric.metricType) {
      case 'ai_response_time':
        return metric.value > 10000; // 10초 이상
      case 'system_memory_usage':
        return metric.value > 1000; // 1GB 이상
      case 'error_rate':
        return metric.value > 0.05; // 5% 이상
      default:
        return false;
    }
  }

  /**
   * 성능 요약 생성
   */
  async getCurrentMetrics(): Promise<PerformanceSummary> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);

      // 최근 1시간 데이터 필터링
      const recentAIMetrics = this.aiUsageMetrics.filter(
        metric => new Date(metric.timestamp) > oneHourAgo
      );

      const recentMetrics = this.metrics.filter(
        metric => new Date(metric.timestamp) > oneHourAgo
      );

      // 응답 시간 메트릭
      const responseTimeMetrics = recentMetrics.filter(
        metric => metric.metricType === 'ai_response_time'
      );

      // 에러율 계산
      const errorMetrics = recentMetrics.filter(
        metric => metric.metricType === 'error_rate'
      );

      const summary: PerformanceSummary = {
        totalRequests: recentAIMetrics.length,
        averageResponseTime: responseTimeMetrics.length > 0 
          ? responseTimeMetrics.reduce((sum, metric) => sum + metric.value, 0) / responseTimeMetrics.length
          : 0,
        totalTokensUsed: recentAIMetrics.reduce((sum, metric) => sum + metric.tokensUsed, 0),
        totalCost: recentAIMetrics.reduce((sum, metric) => sum + metric.cost, 0),
        errorRate: errorMetrics.length > 0 
          ? errorMetrics[errorMetrics.length - 1].value 
          : 0,
        systemHealth: this.calculateSystemHealth(),
        lastUpdated: new Date().toISOString()
      };

      return summary;

    } catch (error) {
      performanceLogger.error('❌ 성능 요약 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 시스템 건강도 계산
   */
  private calculateSystemHealth(): 'excellent' | 'good' | 'warning' | 'critical' {
    const recentSystemMetrics = this.systemMetrics.slice(-6); // 최근 1분 (10초 * 6)
    
    if (recentSystemMetrics.length === 0) {
      return 'warning';
    }

    const avgMemory = recentSystemMetrics.reduce((sum, metric) => sum + metric.memoryUsage, 0) / recentSystemMetrics.length;
    const avgCpu = recentSystemMetrics.reduce((sum, metric) => sum + metric.cpuUsage, 0) / recentSystemMetrics.length;

    // 임계값 기준으로 건강도 판단
    if (avgMemory > 2000 || avgCpu > 1000000) { // 2GB 메모리 또는 고 CPU 사용
      return 'critical';
    } else if (avgMemory > 1000 || avgCpu > 500000) { // 1GB 메모리 또는 중간 CPU 사용
      return 'warning';
    } else if (avgMemory > 500) { // 500MB 메모리
      return 'good';
    } else {
      return 'excellent';
    }
  }

  /**
   * 특정 기간의 메트릭 조회
   */
  getMetricsByTimeRange(
    metricType: string, 
    startTime: Date, 
    endTime: Date
  ): PerformanceMetric[] {
    return this.metrics.filter(metric => 
      metric.metricType === metricType &&
      new Date(metric.timestamp) >= startTime &&
      new Date(metric.timestamp) <= endTime
    );
  }

  /**
   * AI 사용량 리포트 생성
   */
  generateAIUsageReport(period: 'hour' | 'day' | 'week' = 'day'): any {
    const now = new Date();
    let startTime: Date;

    switch (period) {
      case 'hour':
        startTime = new Date(now.getTime() - 3600000);
        break;
      case 'day':
        startTime = new Date(now.getTime() - 86400000);
        break;
      case 'week':
        startTime = new Date(now.getTime() - 604800000);
        break;
    }

    const periodMetrics = this.aiUsageMetrics.filter(
      metric => new Date(metric.timestamp) >= startTime
    );

    // 프로바이더별 집계
    const providerStats = periodMetrics.reduce((acc, metric) => {
      if (!acc[metric.provider]) {
        acc[metric.provider] = {
          requests: 0,
          totalTokens: 0,
          totalCost: 0,
          avgResponseTime: 0
        };
      }
      
      acc[metric.provider].requests++;
      acc[metric.provider].totalTokens += metric.tokensUsed;
      acc[metric.provider].totalCost += metric.cost;
      acc[metric.provider].avgResponseTime += metric.responseTime;
      
      return acc;
    }, {} as Record<string, any>);

    // 평균 응답 시간 계산
    Object.keys(providerStats).forEach(provider => {
      providerStats[provider].avgResponseTime = 
        providerStats[provider].avgResponseTime / providerStats[provider].requests;
    });

    return {
      period,
      startTime: startTime.toISOString(),
      endTime: now.toISOString(),
      totalRequests: periodMetrics.length,
      totalTokens: periodMetrics.reduce((sum, metric) => sum + metric.tokensUsed, 0),
      totalCost: periodMetrics.reduce((sum, metric) => sum + metric.cost, 0),
      providerStats
    };
  }

  /**
   * 오래된 메트릭 정리
   */
  private cleanupOldMetrics(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.metricsRetentionDays);

    const initialCount = this.metrics.length + this.aiUsageMetrics.length + this.systemMetrics.length;

    this.metrics = this.metrics.filter(
      metric => new Date(metric.timestamp) > cutoffDate
    );

    this.aiUsageMetrics = this.aiUsageMetrics.filter(
      metric => new Date(metric.timestamp) > cutoffDate
    );

    this.systemMetrics = this.systemMetrics.filter(
      metric => new Date(metric.timestamp) > cutoffDate
    );

    const finalCount = this.metrics.length + this.aiUsageMetrics.length + this.systemMetrics.length;
    const cleanedCount = initialCount - finalCount;

    if (cleanedCount > 0) {
      performanceLogger.info(`🧹 ${cleanedCount}개의 오래된 메트릭 정리됨`);
    }
  }

  /**
   * 헬스 체크
   */
  async healthCheck(): Promise<boolean> {
    try {
      return this.isRunning;
    } catch (error) {
      performanceLogger.error('❌ PerformanceMonitor 헬스 체크 실패:', error);
      return false;
    }
  }

  /**
   * 성능 모니터링 중지
   */
  async stop(): Promise<void> {
    try {
      performanceLogger.info('🛑 PerformanceMonitor 중지 중...');

      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = undefined;
      }

      // 마지막 리포트 생성
      const finalReport = this.generateAIUsageReport('day');
      performanceLogger.info('📊 최종 AI 사용량 리포트:', finalReport);

      this.isRunning = false;
      performanceLogger.info('✅ PerformanceMonitor 중지 완료');

    } catch (error) {
      performanceLogger.error('❌ PerformanceMonitor 중지 실패:', error);
      throw error;
    }
  }
}