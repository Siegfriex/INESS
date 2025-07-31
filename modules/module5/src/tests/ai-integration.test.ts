/**
 * Module5 AI Integration Agent 테스트
 */

import { AIServiceManager } from '../core/AIServiceManager';
import { WorkflowEngine } from '../workflows/WorkflowEngine';
import { PerformanceMonitor } from '../monitoring/PerformanceMonitor';

// 테스트용 모의 환경 변수 설정
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

describe('Module5 AI Integration Agent Tests', () => {
  let aiServiceManager: AIServiceManager;
  let workflowEngine: WorkflowEngine;
  let performanceMonitor: PerformanceMonitor;

  beforeAll(async () => {
    console.log('🧪 Module5 AI Integration Agent 테스트 시작');
    
    aiServiceManager = new AIServiceManager();
    workflowEngine = new WorkflowEngine();
    performanceMonitor = new PerformanceMonitor();
  });

  afterAll(async () => {
    console.log('✅ Module5 AI Integration Agent 테스트 완료');
  });

  describe('AIServiceManager', () => {
    test('AI 서비스 매니저 초기화', async () => {
      expect(aiServiceManager).toBeDefined();
      console.log('✅ AIServiceManager 초기화 테스트 통과');
    });

    test('서비스 상태 확인', async () => {
      const status = await aiServiceManager.getServiceStatus();
      expect(status).toHaveProperty('openai');
      expect(status).toHaveProperty('anthropic');
      expect(status).toHaveProperty('google');
      expect(status).toHaveProperty('lastChecked');
      console.log('✅ 서비스 상태 확인 테스트 통과');
    });

    test('헬스 체크', async () => {
      const isHealthy = await aiServiceManager.healthCheck();
      expect(typeof isHealthy).toBe('boolean');
      console.log('✅ 헬스 체크 테스트 통과');
    });
  });

  describe('WorkflowEngine', () => {
    test('워크플로우 엔진 초기화', () => {
      expect(workflowEngine).toBeDefined();
      console.log('✅ WorkflowEngine 초기화 테스트 통과');
    });

    test('템플릿으로부터 워크플로우 생성', () => {
      const workflowId = workflowEngine.createWorkflowFromTemplate('emotion-analysis', {
        userText: '오늘 기분이 좋지 않아요',
        context: 'daily_checkin'
      });
      
      expect(workflowId).toBeTruthy();
      expect(workflowId).toContain('emotion-analysis');
      console.log('✅ 워크플로우 생성 테스트 통과');
    });

    test('워크플로우 상태 조회', () => {
      const workflowId = workflowEngine.createWorkflowFromTemplate('content-generation', {
        topic: '스트레스 관리',
        targetAudience: '직장인',
        contentType: 'tips'
      });
      
      const workflow = workflowEngine.getWorkflowStatus(workflowId);
      expect(workflow).toBeDefined();
      expect(workflow?.status).toBe('pending');
      console.log('✅ 워크플로우 상태 조회 테스트 통과');
    });
  });

  describe('PerformanceMonitor', () => {
    test('성능 모니터 초기화', () => {
      expect(performanceMonitor).toBeDefined();
      console.log('✅ PerformanceMonitor 초기화 테스트 통과');
    });

    test('AI 사용 메트릭 기록', () => {
      performanceMonitor.recordAIUsage({
        provider: 'openai',
        model: 'gpt-4',
        tokensUsed: 150,
        responseTime: 1200
      });
      
      console.log('✅ AI 사용 메트릭 기록 테스트 통과');
    });

    test('성능 메트릭 기록', () => {
      performanceMonitor.recordMetric({
        timestamp: new Date().toISOString(),
        metricType: 'test_metric',
        value: 100,
        unit: 'ms',
        tags: { test: 'true' }
      });
      
      console.log('✅ 성능 메트릭 기록 테스트 통과');
    });

    test('AI 사용량 리포트 생성', () => {
      const report = performanceMonitor.generateAIUsageReport('hour');
      expect(report).toHaveProperty('period');
      expect(report).toHaveProperty('totalRequests');
      expect(report).toHaveProperty('totalTokens');
      expect(report).toHaveProperty('totalCost');
      console.log('✅ AI 사용량 리포트 생성 테스트 통과');
    });
  });

  describe('통합 시나리오 테스트', () => {
    test('감정 분석 워크플로우 시뮬레이션', async () => {
      // 1. 워크플로우 생성
      const workflowId = workflowEngine.createWorkflowFromTemplate('emotion-analysis', {
        userText: '오늘 일이 너무 힘들었어요. 상사가 계속 압박하고...',
        context: 'daily_journal'
      });
      
      expect(workflowId).toBeTruthy();
      
      // 2. 워크플로우 상태 확인
      const workflow = workflowEngine.getWorkflowStatus(workflowId);
      expect(workflow?.status).toBe('pending');
      
      // 3. 메트릭 기록 (실제 실행 시뮬레이션)
      performanceMonitor.recordAIUsage({
        provider: 'openai',
        model: 'gpt-4',
        tokensUsed: 200,
        responseTime: 1500
      });
      
      console.log('✅ 감정 분석 워크플로우 시뮬레이션 테스트 통과');
    });

    test('성능 요약 생성', async () => {
      const summary = await performanceMonitor.getCurrentMetrics();
      expect(summary).toHaveProperty('totalRequests');
      expect(summary).toHaveProperty('averageResponseTime');
      expect(summary).toHaveProperty('systemHealth');
      
      console.log('📊 성능 요약:', summary);
      console.log('✅ 성능 요약 생성 테스트 통과');
    });
  });
});

// 수동 테스트 실행 함수
export async function runManualTests(): Promise<void> {
  console.log('\n🚀 Module5 AI Integration Agent 수동 테스트 시작\n');
  
  try {
    // AI Service Manager 테스트
    console.log('1️⃣ AIServiceManager 테스트...');
    const aiService = new AIServiceManager();
    const status = await aiService.getServiceStatus();
    console.log('   서비스 상태:', status);
    
    // Workflow Engine 테스트
    console.log('\n2️⃣ WorkflowEngine 테스트...');
    const workflowEngine = new WorkflowEngine();
    const workflowId = workflowEngine.createWorkflowFromTemplate('emotion-analysis', {
      userText: '테스트 메시지입니다',
      context: 'test'
    });
    console.log('   생성된 워크플로우 ID:', workflowId);
    
    // Performance Monitor 테스트
    console.log('\n3️⃣ PerformanceMonitor 테스트...');
    const monitor = new PerformanceMonitor();
    monitor.recordAIUsage({
      provider: 'openai',
      model: 'gpt-4',
      tokensUsed: 100,
      responseTime: 800
    });
    
    const report = monitor.generateAIUsageReport('hour');
    console.log('   AI 사용량 리포트:', report);
    
    console.log('\n✅ 모든 수동 테스트 완료');
    
  } catch (error) {
    console.error('\n❌ 수동 테스트 실패:', error);
  }
}

// 스크립트로 직접 실행될 때 수동 테스트 실행
if (require.main === module) {
  runManualTests();
}