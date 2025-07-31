/**
 * Module6 DevOps Agent - Main Execution Script
 * DevOps 및 배포 전담 AI 에이전트 메인 실행 파일
 */

import { DevOpsService } from './services/devops-service';
import { MonitoringService } from './services/monitoring-service';
import { SecurityService } from './services/security-service';
import { CICDService } from './services/cicd-service';
import { InfrastructureService } from './services/infrastructure-service';
import * as fs from 'fs/promises';
import * as path from 'path';

interface TaskData {
  id: string;
  moduleId: string;
  title: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedAt: string;
  assignedBy: string;
  description?: string;
  estimatedCompletion?: string;
}

interface SystemMetrics {
  timestamp: string;
  cpu_usage: number;
  memory_usage: NodeJS.MemoryUsage;
  disk_usage: number;
  network_status: string;
  services_status: { [key: string]: string };
}

class Module6DevOpsAgent {
  private devOpsService: DevOpsService;
  private monitoringService: MonitoringService;
  private securityService: SecurityService;
  private cicdService: CICDService;
  private infrastructureService: InfrastructureService;
  private isRunning: boolean = false;
  private taskQueue: TaskData[] = [];

  constructor() {
    this.devOpsService = new DevOpsService();
    this.monitoringService = new MonitoringService();
    this.securityService = new SecurityService();
    this.cicdService = new CICDService();
    this.infrastructureService = new InfrastructureService();
  }

  /**
   * Module6 DevOps 에이전트 시작
   */
  async start(): Promise<void> {
    console.log('⚙️ Module6 DevOps Agent 시작');
    console.log('🚀 DevOps 및 배포 전담 에이전트 활성화');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    this.isRunning = true;
    
    try {
      // 1. 모든 서비스 초기화
      await this.initializeServices();
      
      // 2. 인프라 상태 점검
      await this.performInfrastructureHealthCheck();
      
      // 3. 보안 시스템 활성화
      await this.activateSecuritySystems();
      
      // 4. 모니터링 시스템 시작
      await this.startMonitoringSystems();
      
      // 5. CI/CD 파이프라인 점검
      await this.validateCICDPipelines();
      
      // 6. 주기적 작업 스케줄링
      this.schedulePeriodicTasks();
      
      // 7. 작업 처리 루프 시작
      this.startTaskProcessingLoop();
      
      // 8. 시스템 상태 보고
      await this.reportSystemStatus();
      
      console.log('✅ Module6 DevOps Agent 완전 가동');
      console.log('🔧 인프라 관리 시스템 활성화');
      console.log('📊 실시간 모니터링 시작');
      console.log('🛡️ 보안 시스템 가동');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
    } catch (error) {
      console.error('❌ Module6 시작 실패:', error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * 모든 서비스 초기화
   */
  private async initializeServices(): Promise<void> {
    console.log('🔧 DevOps 서비스 초기화 중...');
    
    await this.devOpsService.initialize();
    await this.monitoringService.initialize();
    await this.securityService.initialize();
    await this.cicdService.initialize();
    await this.infrastructureService.initialize();
    
    console.log('✅ 모든 DevOps 서비스 초기화 완료');
  }

  /**
   * 인프라 상태 점검
   */
  private async performInfrastructureHealthCheck(): Promise<void> {
    console.log('🏥 인프라 상태 점검 시작...');
    
    const healthReport = await this.infrastructureService.performHealthCheck();
    
    if (healthReport.overall_status !== 'healthy') {
      console.warn('⚠️ 인프라 상태 이상 감지:', healthReport.issues);
      await this.handleInfrastructureIssues(healthReport.issues);
    } else {
      console.log('✅ 인프라 상태 정상');
    }
  }

  /**
   * 보안 시스템 활성화
   */
  private async activateSecuritySystems(): Promise<void> {
    console.log('🛡️ 보안 시스템 활성화...');
    
    await this.securityService.activateSecurityScanning();
    await this.securityService.updateSecurityPolicies();
    await this.securityService.validateAccessControls();
    
    console.log('✅ 보안 시스템 활성화 완료');
  }

  /**
   * 모니터링 시스템 시작
   */
  private async startMonitoringSystems(): Promise<void> {
    console.log('📊 모니터링 시스템 시작...');
    
    await this.monitoringService.startRealTimeMonitoring();
    await this.monitoringService.setupAlerts();
    await this.monitoringService.initializeDashboards();
    
    console.log('✅ 모니터링 시스템 시작 완료');
  }

  /**
   * CI/CD 파이프라인 점검
   */
  private async validateCICDPipelines(): Promise<void> {
    console.log('🔄 CI/CD 파이프라인 점검...');
    
    const pipelineStatus = await this.cicdService.validateAllPipelines();
    
    if (!pipelineStatus.all_valid) {
      console.warn('⚠️ CI/CD 파이프라인 이슈 감지:', pipelineStatus.issues);
      await this.cicdService.fixPipelineIssues(pipelineStatus.issues);
    } else {
      console.log('✅ 모든 CI/CD 파이프라인 정상');
    }
  }

  /**
   * 주기적 작업 스케줄링
   */
  private schedulePeriodicTasks(): void {
    console.log('⏰ 주기적 작업 스케줄링 시작');

    // 5분마다: 시스템 헬스 체크
    setInterval(async () => {
      if (!this.isRunning) return;
      await this.performRoutineHealthCheck();
    }, 5 * 60 * 1000);

    // 15분마다: 성능 메트릭 수집
    setInterval(async () => {
      if (!this.isRunning) return;
      await this.collectPerformanceMetrics();
    }, 15 * 60 * 1000);

    // 30분마다: 보안 스캔
    setInterval(async () => {
      if (!this.isRunning) return;
      await this.performSecurityScan();
    }, 30 * 60 * 1000);

    // 1시간마다: 비용 분석
    setInterval(async () => {
      if (!this.isRunning) return;
      await this.analyzeCosts();
    }, 60 * 60 * 1000);

    // 4시간마다: 백업 확인
    setInterval(async () => {
      if (!this.isRunning) return;
      await this.verifyBackups();
    }, 4 * 60 * 60 * 1000);
  }

  /**
   * 작업 처리 루프 시작
   */
  private startTaskProcessingLoop(): void {
    console.log('📋 작업 처리 루프 시작');

    const processTaskQueue = async (): Promise<void> => {
      if (!this.isRunning || this.taskQueue.length === 0) return;

      try {
        const task = this.taskQueue.shift();
        if (task) {
          await this.processTask(task);
        }
      } catch (error) {
        console.error('❌ 작업 처리 실패:', error);
      }
    };

    // 30초마다 작업 큐 처리
    setInterval(processTaskQueue, 30 * 1000);

    // 작업 큐 상태 확인 및 업데이트
    setInterval(async () => {
      if (!this.isRunning) return;
      await this.checkForNewTasks();
    }, 60 * 1000);
  }

  /**
   * 새 작업 확인
   */
  private async checkForNewTasks(): Promise<void> {
    try {
      const taskFile = path.join(process.cwd(), 'logs', 'module6_task_queue.json');
      
      try {
        const data = await fs.readFile(taskFile, 'utf8');
        const tasks = JSON.parse(data) as TaskData[];
        
        // 새 작업만 큐에 추가
        const newTasks = tasks.filter(task => 
          task.status === 'assigned' && 
          !this.taskQueue.some(queuedTask => queuedTask.id === task.id)
        );
        
        this.taskQueue.push(...newTasks);
        
        if (newTasks.length > 0) {
          console.log(`📋 새 작업 ${newTasks.length}개 감지, 큐에 추가`);
        }
      } catch (error) {
        // 파일이 없으면 무시
      }
    } catch (error) {
      console.error('❌ 작업 확인 실패:', error);
    }
  }

  /**
   * 작업 처리
   */
  private async processTask(task: TaskData): Promise<void> {
    console.log(`🔧 작업 처리 시작: ${task.title}`);
    
    try {
      // 작업 상태를 진행 중으로 변경
      task.status = 'in_progress';
      await this.updateTaskStatus(task);

      // 작업 타입에 따른 처리
      if (task.title.includes('CI/CD')) {
        await this.cicdService.handleTask(task);
      } else if (task.title.includes('인프라') || task.title.includes('infrastructure')) {
        await this.infrastructureService.handleTask(task);
      } else if (task.title.includes('모니터링') || task.title.includes('monitoring')) {
        await this.monitoringService.handleTask(task);
      } else if (task.title.includes('보안') || task.title.includes('security')) {
        await this.securityService.handleTask(task);
      } else {
        await this.devOpsService.handleTask(task);
      }

      // 작업 완료
      task.status = 'completed';
      await this.updateTaskStatus(task);
      
      console.log(`✅ 작업 완료: ${task.title}`);
      
      // 완료 보고
      await this.reportTaskCompletion(task);
      
    } catch (error) {
      console.error(`❌ 작업 실패: ${task.title}`, error);
      task.status = 'failed';
      await this.updateTaskStatus(task);
      await this.reportTaskFailure(task, error);
    }
  }

  /**
   * 루틴 헬스 체크
   */
  private async performRoutineHealthCheck(): Promise<void> {
    try {
      console.log('🏥 루틴 헬스 체크 수행 중...');
      
      const metrics = await this.collectSystemMetrics();
      await this.logMetrics(metrics);
      
      // 임계치 확인
      if (metrics.cpu_usage > 80) {
        console.warn('⚠️ CPU 사용률 높음:', metrics.cpu_usage);
        await this.handleHighCPUUsage();
      }
      
      if (metrics.memory_usage.heapUsed / metrics.memory_usage.heapTotal > 0.9) {
        console.warn('⚠️ 메모리 사용률 높음');
        await this.handleHighMemoryUsage();
      }
      
    } catch (error) {
      console.error('❌ 루틴 헬스 체크 실패:', error);
    }
  }

  /**
   * 시스템 상태 보고
   */
  private async reportSystemStatus(): Promise<void> {
    const status = {
      timestamp: new Date().toISOString(),
      module: 'module6',
      agent: 'DevOps Agent',
      status: 'operational',
      services: {
        devops: 'active',
        monitoring: 'active',
        security: 'active',
        cicd: 'active',
        infrastructure: 'active'
      },
      metrics: await this.collectSystemMetrics(),
      last_health_check: new Date().toISOString(),
      task_queue_length: this.taskQueue.length
    };

    await this.saveActivityLog(status);
    console.log('📊 시스템 상태 보고 완료');
  }

  /**
   * 활동 로그 저장
   */
  private async saveActivityLog(data: any): Promise<void> {
    try {
      const logFile = path.join(process.cwd(), 'logs', 'module6_activity.json');
      
      let logs = { logs: [] as any[] };
      try {
        const existingData = await fs.readFile(logFile, 'utf8');
        logs = JSON.parse(existingData);
      } catch (error) {
        // 파일이 없으면 새로 생성
      }
      
      logs.logs.push({
        timestamp: new Date().toISOString(),
        data: data
      });
      
      // 최대 1000개 로그 유지
      if (logs.logs.length > 1000) {
        logs.logs = logs.logs.slice(-1000);
      }
      
      await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
      
    } catch (error) {
      console.error('❌ 활동 로그 저장 실패:', error);
    }
  }

  /**
   * 시스템 메트릭 수집
   */
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    return {
      timestamp: new Date().toISOString(),
      cpu_usage: process.cpuUsage().user / 1000000, // 간단한 CPU 사용률 계산
      memory_usage: process.memoryUsage(),
      disk_usage: 0, // 실제 구현에서는 disk usage 계산
      network_status: 'healthy',
      services_status: {
        devops: 'active',
        monitoring: 'active',
        security: 'active',
        cicd: 'active',
        infrastructure: 'active'
      }
    };
  }

  /**
   * 메트릭 로깅
   */
  private async logMetrics(metrics: SystemMetrics): Promise<void> {
    await this.saveActivityLog({
      type: 'metrics',
      metrics: metrics
    });
  }

  /**
   * 작업 상태 업데이트
   */
  private async updateTaskStatus(task: TaskData): Promise<void> {
    const taskFile = path.join(process.cwd(), 'logs', 'module6_tasks.json');
    
    try {
      let tasks = [] as TaskData[];
      try {
        const data = await fs.readFile(taskFile, 'utf8');
        tasks = JSON.parse(data);
      } catch (error) {
        // 파일이 없으면 새로 생성
      }
      
      const existingIndex = tasks.findIndex(t => t.id === task.id);
      if (existingIndex >= 0) {
        tasks[existingIndex] = task;
      } else {
        tasks.push(task);
      }
      
      await fs.writeFile(taskFile, JSON.stringify(tasks, null, 2));
      
    } catch (error) {
      console.error('❌ 작업 상태 업데이트 실패:', error);
    }
  }

  /**
   * 작업 완료 보고
   */
  private async reportTaskCompletion(task: TaskData): Promise<void> {
    await this.saveActivityLog({
      type: 'task_completion',
      task: task,
      completed_at: new Date().toISOString()
    });
  }

  /**
   * 작업 실패 보고
   */
  private async reportTaskFailure(task: TaskData, error: any): Promise<void> {
    await this.saveActivityLog({
      type: 'task_failure',
      task: task,
      error: error.message || error,
      failed_at: new Date().toISOString()
    });
  }

  // 임시 헬퍼 메서드들 (실제 구현에서는 각 서비스에서 처리)
  private async handleInfrastructureIssues(issues: any[]): Promise<void> {
    console.log('🔧 인프라 이슈 처리 중...', issues);
  }

  private async collectPerformanceMetrics(): Promise<void> {
    console.log('📊 성능 메트릭 수집 중...');
  }

  private async performSecurityScan(): Promise<void> {
    console.log('🛡️ 보안 스캔 수행 중...');
  }

  private async analyzeCosts(): Promise<void> {
    console.log('💰 비용 분석 수행 중...');
  }

  private async verifyBackups(): Promise<void> {
    console.log('💾 백업 검증 수행 중...');
  }

  private async handleHighCPUUsage(): Promise<void> {
    console.log('🔥 높은 CPU 사용률 처리 중...');
  }

  private async handleHighMemoryUsage(): Promise<void> {
    console.log('🧠 높은 메모리 사용률 처리 중...');
  }

  /**
   * DevOps 에이전트 종료
   */
  async stop(): Promise<void> {
    console.log('🛑 Module6 DevOps Agent 종료 중...');
    this.isRunning = false;
    
    // 모든 서비스 정리
    await this.devOpsService.cleanup();
    await this.monitoringService.cleanup();
    await this.securityService.cleanup();
    await this.cicdService.cleanup();
    await this.infrastructureService.cleanup();
    
    // 최종 상태 보고
    await this.reportSystemStatus();
    
    console.log('✅ Module6 DevOps Agent 정상 종료');
  }
}

// 메인 실행
if (require.main === module) {
  const devOpsAgent = new Module6DevOpsAgent();
  
  // 시그널 핸들러
  process.on('SIGINT', async () => {
    await devOpsAgent.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await devOpsAgent.stop();
    process.exit(0);
  });
  
  // DevOps Agent 시작
  devOpsAgent.start().catch(console.error);
}

export { Module6DevOpsAgent };