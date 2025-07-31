/**
 * Module1 ARGO - Main Execution Script
 * 중앙 조정 시스템의 메인 실행 파일
 */

const NotionSyncHandler = require('../notion-sync-handler');
const CentralCoordinator = require('../../workflows/central-coordinator');
const fs = require('fs').promises;

class ARGOMainAgent {
  constructor() {
    this.notionSyncHandler = new NotionSyncHandler();
    this.centralCoordinator = new CentralCoordinator();
    this.isRunning = false;
  }

  /**
   * ARGO 메인 에이전트 시작
   */
  async start() {
    console.log('🎯 Module1 ARGO - 메인 아키텍트 에이전트 시작');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    this.isRunning = true;
    
    try {
      // 1. 중앙 조정 시스템 시작
      await this.centralCoordinator.start();
      
      // 2. 주기적 작업 스케줄링
      this.schedulePeriodicTasks();
      
      // 3. 노션 명령어 처리 루프 시작
      this.startNotionCommandProcessor();
      
      console.log('✅ ARGO 시스템 완전 가동');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
    } catch (error) {
      console.error('❌ ARGO 시작 실패:', error);
      this.isRunning = false;
    }
  }

  /**
   * 주기적 작업 스케줄링
   */
  schedulePeriodicTasks() {
    // 5분마다: 노션 동기화
    setInterval(async () => {
      if (!this.isRunning) return;
      console.log('⏰ 정기 노션 동기화 시작');
      await this.notionSyncHandler.processSyncQueue();
    }, 5 * 60 * 1000);

    // 15분마다: 전체 상태 보고
    setInterval(async () => {
      if (!this.isRunning) return;
      console.log('📊 전체 상태 보고서 생성');
      await this.generateFullStatusReport();
    }, 15 * 60 * 1000);

    // 1시간마다: 시스템 최적화
    setInterval(async () => {
      if (!this.isRunning) return;
      console.log('🔧 시스템 최적화 실행');
      await this.performSystemOptimization();
    }, 60 * 60 * 1000);
  }

  /**
   * 노션 명령어 처리 루프
   */
  async startNotionCommandProcessor() {
    const processCommands = async () => {
      if (!this.isRunning) return;

      try {
        const commands = await this.notionSyncHandler.getNotionCommandsForExecution();
        
        if (commands.length > 0) {
          console.log(`📝 노션 명령어 ${commands.length}개 처리 중...`);
          
          for (const command of commands) {
            await this.executeNotionCommand(command);
            await this.notionSyncHandler.markCommandAsProcessed(command.timestamp);
          }
        }
      } catch (error) {
        console.error('❌ 노션 명령어 처리 실패:', error);
      }
    };

    // 30초마다 명령어 확인
    setInterval(processCommands, 30 * 1000);
    
    // 즉시 한 번 실행
    await processCommands();
  }

  /**
   * 노션 명령어 실행
   * 실제 MCP 호출이 이루어지는 부분
   */
  async executeNotionCommand(command) {
    try {
      switch (command.type) {
        case 'create_or_update_task':
          await this.createOrUpdateNotionTask(command.data);
          break;
          
        case 'create_communication_log':
          await this.createNotionCommunicationLog(command.data);
          break;
          
        default:
          console.warn(`⚠️ 알 수 없는 명령어 타입: ${command.type}`);
      }
      
      console.log(`✅ 노션 명령어 실행 완료: ${command.type}`);
      
    } catch (error) {
      console.error(`❌ 노션 명령어 실행 실패: ${command.type}`, error);
    }
  }

  /**
   * 노션 작업 생성/업데이트
   * 이 메서드는 Module1 에이전트가 MCP 도구로 실행해야 함
   */
  async createOrUpdateNotionTask(taskData) {
    // 실제 구현에서는 여기서 MCP Notion API 호출
    console.log('📝 노션 작업 업데이트:', taskData["작업명"]);
    
    // TODO: 여기에 실제 MCP mcp_Notion_create-pages 또는 mcp_Notion_update-page 호출
    // 예시:
    // await mcp_Notion_create_pages({
    //   parent: { database_id: "AI 작업 관리 시스템 ID" },
    //   pages: [{ properties: taskData }]
    // });
    
    // 현재는 로그만 출력
    this.logNotionOperation('작업 업데이트', taskData);
  }

  /**
   * 노션 통신 로그 생성
   */
  async createNotionCommunicationLog(logData) {
    console.log('💬 노션 통신 로그 생성:', logData["로그 ID"]);
    
    // TODO: 여기에 실제 MCP mcp_Notion_create-pages 호출
    
    this.logNotionOperation('통신 로그', logData);
  }

  /**
   * 노션 작업 기록
   */
  logNotionOperation(type, data) {
    const operation = {
      timestamp: new Date().toISOString(),
      type: type,
      data: data,
      status: 'logged_for_manual_execution'
    };
    
    // 작업 로그를 파일에 저장하여 추후 수동 확인 가능
    this.saveOperationLog(operation);
  }

  /**
   * 작업 로그 저장
   */
  async saveOperationLog(operation) {
    try {
      const logFile = './logs/notion_operations.json';
      let operations = [];
      
      try {
        const data = await fs.readFile(logFile, 'utf8');
        operations = JSON.parse(data);
      } catch (error) {
        // 파일이 없으면 새로 생성
      }
      
      operations.push(operation);
      
      // 최대 1000개 유지
      if (operations.length > 1000) {
        operations = operations.slice(-1000);
      }
      
      await fs.writeFile(logFile, JSON.stringify(operations, null, 2));
      
    } catch (error) {
      console.error('작업 로그 저장 실패:', error);
    }
  }

  /**
   * 전체 상태 보고서 생성
   */
  async generateFullStatusReport() {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        system_status: 'operational',
        agents: await this.getAgentStatuses(),
        tasks: await this.getTaskSummary(),
        performance: await this.getPerformanceMetrics(),
        pending_approvals: await this.getPendingApprovals()
      };
      
      await fs.writeFile('./logs/full_status_report.json', JSON.stringify(report, null, 2));
      console.log('📊 전체 상태 보고서 생성 완료');
      
      return report;
      
    } catch (error) {
      console.error('❌ 상태 보고서 생성 실패:', error);
    }
  }

  /**
   * 에이전트 상태 수집
   */
  async getAgentStatuses() {
    const agents = ['module2', 'module3', 'module4', 'module5', 'module6'];
    const statuses = {};
    
    for (const agent of agents) {
      try {
        const logFile = `./logs/${agent}_activity.json`;
        const data = await fs.readFile(logFile, 'utf8');
        const logs = JSON.parse(data);
        const latestLog = logs.logs[logs.logs.length - 1];
        
        statuses[agent] = {
          status: latestLog?.task?.status || 'idle',
          last_activity: latestLog?.timestamp || 'never',
          current_task: latestLog?.task?.title || 'none'
        };
      } catch (error) {
        statuses[agent] = { status: 'unknown', error: error.message };
      }
    }
    
    return statuses;
  }

  /**
   * 작업 요약
   */
  async getTaskSummary() {
    // 실제 구현에서는 로그에서 작업 통계 수집
    return {
      total_tasks: 0,
      completed_tasks: 0,
      in_progress_tasks: 0,
      pending_tasks: 0
    };
  }

  /**
   * 성능 메트릭
   */
  async getPerformanceMetrics() {
    return {
      cpu_usage: process.cpuUsage(),
      memory_usage: process.memoryUsage(),
      uptime: process.uptime()
    };
  }

  /**
   * 대기 중인 승인 목록
   */
  async getPendingApprovals() {
    try {
      const data = await fs.readFile('./workflows/pending_approvals.json', 'utf8');
      const approvals = JSON.parse(data);
      return approvals.filter(approval => approval.status === 'pending_approval');
    } catch (error) {
      return [];
    }
  }

  /**
   * 시스템 최적화
   */
  async performSystemOptimization() {
    console.log('🔧 시스템 최적화 시작');
    
    // 1. 로그 파일 정리
    await this.cleanupLogFiles();
    
    // 2. 메모리 정리
    if (global.gc) {
      global.gc();
    }
    
    console.log('✅ 시스템 최적화 완료');
  }

  /**
   * 로그 파일 정리
   */
  async cleanupLogFiles() {
    // 7일 이상 된 로그 파일 압축 또는 삭제
    console.log('🧹 로그 파일 정리 중...');
  }

  /**
   * 시스템 종료
   */
  async stop() {
    console.log('🛑 ARGO 시스템 종료 중...');
    this.isRunning = false;
    
    // 정리 작업
    await this.generateFullStatusReport();
    
    console.log('✅ ARGO 시스템 정상 종료');
  }
}

// 메인 실행
if (require.main === module) {
  const argo = new ARGOMainAgent();
  
  // 시그널 핸들러
  process.on('SIGINT', async () => {
    await argo.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await argo.stop();
    process.exit(0);
  });
  
  // ARGO 시작
  argo.start().catch(console.error);
}

module.exports = ARGOMainAgent;