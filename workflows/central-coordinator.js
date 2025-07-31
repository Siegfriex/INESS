/**
 * Module1 ARGO - Central Coordination System
 * 백그라운드 에이전트들의 로컬 로그를 수집하여 노션 동기화 및 Git 관리
 */

const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar'); // 파일 감시

class CentralCoordinator {
  constructor() {
    this.logDirectory = './logs';
    this.agents = ['module2', 'module3', 'module4', 'module5', 'module6'];
    this.pendingApprovals = [];
    this.isMonitoring = false;
  }

  /**
   * 중앙 조정 시스템 시작
   */
  async start() {
    console.log('🎯 Module1 ARGO - 중앙 조정 시스템 시작');
    
    await this.initializeDirectories();
    await this.startLogMonitoring();
    await this.startPeriodicSync();
    
    console.log('✅ 모든 시스템 가동 완료');
  }

  /**
   * 로그 디렉토리 초기화
   */
  async initializeDirectories() {
    try {
      await fs.mkdir(this.logDirectory, { recursive: true });
      
      // 각 모듈별 로그 파일 초기화
      for (const agent of this.agents) {
        const logFile = path.join(this.logDirectory, `${agent}_activity.json`);
        const exists = await fs.access(logFile).then(() => true).catch(() => false);
        
        if (!exists) {
          await fs.writeFile(logFile, JSON.stringify({ logs: [] }, null, 2));
          console.log(`📁 ${agent} 로그 파일 생성`);
        }
      }
    } catch (error) {
      console.error('❌ 디렉토리 초기화 실패:', error);
    }
  }

  /**
   * 실시간 로그 파일 모니터링 시작
   */
  async startLogMonitoring() {
    const watcher = chokidar.watch(path.join(this.logDirectory, '*_activity.json'));
    
    watcher.on('change', (filePath) => {
      const agent = path.basename(filePath, '_activity.json');
      console.log(`📝 ${agent} 활동 감지`);
      this.processAgentLog(agent, filePath);
    });

    this.isMonitoring = true;
    console.log('👁️ 로그 모니터링 시작');
  }

  /**
   * 에이전트 로그 처리
   */
  async processAgentLog(agent, filePath) {
    try {
      const logData = await fs.readFile(filePath, 'utf8');
      const logs = JSON.parse(logData);
      
      // 최신 로그 분석
      const latestLogs = logs.logs.slice(-5); // 최근 5개
      
      for (const log of latestLogs) {
        await this.handleLogEntry(agent, log);
      }
      
    } catch (error) {
      console.error(`❌ ${agent} 로그 처리 실패:`, error);
    }
  }

  /**
   * 개별 로그 엔트리 처리
   */
  async handleLogEntry(agent, log) {
    console.log(`🔄 ${agent}: ${log.activity_type} - ${log.task?.title || 'Unknown'}`);
    
    // 노션 동기화 필요한 경우
    if (log.notion_sync?.should_sync) {
      await this.syncToNotion(agent, log);
    }
    
    // Git 커밋 요청이 있는 경우
    if (log.git_status?.commit_requested) {
      await this.handleCommitRequest(agent, log);
    }
    
    // 에러 발생 시 즉시 알림
    if (log.errors?.error_count > 0) {
      await this.handleErrors(agent, log);
    }
    
    // 작업 완료 시 다음 단계 조율
    if (log.activity_type === 'task_complete') {
      await this.coordinateNextSteps(agent, log);
    }
  }

  /**
   * 노션 동기화 (실제로는 Module1이 MCP를 통해 실행)
   */
  async syncToNotion(agent, log) {
    // 이 부분은 Cursor AI의 Module1 에이전트가 
    // MCP Notion 도구를 사용하여 실행해야 함
    
    const syncRequest = {
      timestamp: new Date().toISOString(),
      agent: agent,
      type: 'notion_sync_request',
      data: {
        task_update: log.task,
        communication_log: {
          agent_id: agent,
          activity: log.activity_type,
          details: log.details,
          timestamp: log.timestamp
        }
      }
    };
    
    // 동기화 요청을 파일로 저장 (Module1이 읽어서 처리)
    await this.saveNotionSyncRequest(syncRequest);
    
    console.log(`📤 ${agent} 노션 동기화 요청 저장`);
  }

  /**
   * Git 커밋 요청 처리
   */
  async handleCommitRequest(agent, log) {
    const approval = {
      id: `commit-${Date.now()}`,
      agent: agent,
      timestamp: new Date().toISOString(),
      files: log.git_status.files_staged,
      message: log.git_status.commit_message,
      task: log.task,
      status: 'pending_approval'
    };
    
    this.pendingApprovals.push(approval);
    
    // 승인 요청 파일 저장
    await fs.writeFile(
      './workflows/pending_approvals.json',
      JSON.stringify(this.pendingApprovals, null, 2)
    );
    
    console.log(`⏳ ${agent} Git 커밋 승인 대기: ${log.git_status.commit_message}`);
  }

  /**
   * 에러 처리
   */
  async handleErrors(agent, log) {
    const errorReport = {
      timestamp: new Date().toISOString(),
      agent: agent,
      errors: log.errors,
      task: log.task,
      severity: this.calculateErrorSeverity(log.errors)
    };
    
    // 긴급 에러는 즉시 알림
    if (errorReport.severity === 'critical') {
      console.log(`🚨 CRITICAL ERROR from ${agent}:`, log.errors.error_messages);
    }
    
    // 에러 리포트 저장
    await this.saveErrorReport(errorReport);
  }

  /**
   * 다음 단계 조율
   */
  async coordinateNextSteps(agent, log) {
    // 완료된 작업의 의존성 확인
    if (log.details.dependencies && log.details.dependencies.length > 0) {
      console.log(`🔗 ${agent} 작업 완료 - 의존성 모듈들에게 알림`);
      
      // 의존성 모듈들에게 알림 전송
      for (const dependency of log.details.dependencies) {
        await this.notifyDependentModule(dependency, agent, log.task);
      }
    }
  }

  /**
   * 주기적 동기화 (5분마다)
   */
  async startPeriodicSync() {
    setInterval(async () => {
      console.log('⏰ 주기적 상태 점검 시작');
      await this.generateStatusReport();
      await this.processNotionSyncQueue();
      await this.reviewPendingApprovals();
    }, 5 * 60 * 1000); // 5분
  }

  /**
   * 전체 상태 리포트 생성
   */
  async generateStatusReport() {
    const report = {
      timestamp: new Date().toISOString(),
      agents: {},
      overall_status: 'healthy',
      pending_approvals: this.pendingApprovals.length,
      active_tasks: 0
    };
    
    // 각 에이전트 상태 수집
    for (const agent of this.agents) {
      const logFile = path.join(this.logDirectory, `${agent}_activity.json`);
      try {
        const logData = await fs.readFile(logFile, 'utf8');
        const logs = JSON.parse(logData);
        const latestLog = logs.logs[logs.logs.length - 1];
        
        report.agents[agent] = {
          last_activity: latestLog?.timestamp || 'never',
          status: latestLog?.task?.status || 'unknown',
          current_task: latestLog?.task?.title || 'none'
        };
        
        if (latestLog?.task?.status === 'in_progress') {
          report.active_tasks++;
        }
        
      } catch (error) {
        report.agents[agent] = { status: 'error', error: error.message };
        report.overall_status = 'degraded';
      }
    }
    
    // 상태 리포트 저장
    await fs.writeFile(
      './logs/status_report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log(`📊 상태 리포트 생성 - 활성 작업: ${report.active_tasks}`);
  }

  // 유틸리티 메서드들
  async saveNotionSyncRequest(request) {
    const syncFile = './workflows/notion_sync_queue.json';
    let queue = [];
    
    try {
      const data = await fs.readFile(syncFile, 'utf8');
      queue = JSON.parse(data);
    } catch (error) {
      // 파일이 없으면 새로 생성
    }
    
    queue.push(request);
    await fs.writeFile(syncFile, JSON.stringify(queue, null, 2));
  }

  async saveErrorReport(report) {
    const errorFile = './logs/error_reports.json';
    let reports = [];
    
    try {
      const data = await fs.readFile(errorFile, 'utf8');
      reports = JSON.parse(data);
    } catch (error) {
      // 파일이 없으면 새로 생성
    }
    
    reports.push(report);
    await fs.writeFile(errorFile, JSON.stringify(reports, null, 2));
  }

  calculateErrorSeverity(errors) {
    if (errors.error_count === 0) return 'none';
    if (errors.error_count >= 5) return 'critical';
    if (errors.error_count >= 3) return 'high';
    if (errors.error_count >= 1) return 'medium';
    return 'low';
  }

  async notifyDependentModule(dependentAgent, completedAgent, task) {
    const notification = {
      timestamp: new Date().toISOString(),
      to: dependentAgent,
      from: completedAgent,
      type: 'dependency_completed',
      message: `${completedAgent}의 "${task.title}" 작업이 완료되었습니다.`,
      task: task
    };
    
    // 알림을 해당 모듈의 로그에 추가
    const notificationFile = path.join(this.logDirectory, `${dependentAgent}_notifications.json`);
    let notifications = [];
    
    try {
      const data = await fs.readFile(notificationFile, 'utf8');
      notifications = JSON.parse(data);
    } catch (error) {
      // 파일이 없으면 새로 생성
    }
    
    notifications.push(notification);
    await fs.writeFile(notificationFile, JSON.stringify(notifications, null, 2));
    
    console.log(`📨 ${dependentAgent}에게 의존성 완료 알림 전송`);
  }

  async processNotionSyncQueue() {
    // 이 메서드는 Module1 에이전트가 실제 노션 MCP 호출을 수행
    console.log('🔄 노션 동기화 큐 처리 중...');
  }

  async reviewPendingApprovals() {
    console.log(`📋 대기 중인 승인: ${this.pendingApprovals.length}개`);
  }
}

// 모듈 실행
if (require.main === module) {
  const coordinator = new CentralCoordinator();
  coordinator.start().catch(console.error);
}

module.exports = CentralCoordinator;