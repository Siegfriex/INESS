/**
 * Module1 ARGO - Notion Sync Handler
 * 백그라운드 에이전트들의 로그를 노션에 동기화하는 핸들러
 * 이 스크립트는 Module1 에이전트가 MCP Notion 도구를 사용하여 실행
 */

const fs = require('fs').promises;
const path = require('path');

class NotionSyncHandler {
  constructor() {
    this.syncQueueFile = '../../workflows/notion_sync_queue.json';
    this.tasksDatabase = 'AI 작업 관리 시스템';
    this.communicationDatabase = 'AI 모듈 통신 로그';
    this.processedRequests = new Set();
  }

  /**
   * 동기화 큐 처리 - Module1 에이전트가 주기적으로 호출
   */
  async processSyncQueue() {
    try {
      const queue = await this.loadSyncQueue();
      if (queue.length === 0) return;

      console.log(`🔄 노션 동기화 요청 ${queue.length}개 처리 중...`);

      for (const request of queue) {
        if (this.processedRequests.has(request.timestamp)) continue;

        await this.processSyncRequest(request);
        this.processedRequests.add(request.timestamp);
      }

      // 처리된 요청들 큐에서 제거
      await this.clearProcessedRequests(queue);

    } catch (error) {
      console.error('❌ 노션 동기화 처리 실패:', error);
    }
  }

  /**
   * 개별 동기화 요청 처리
   */
  async processSyncRequest(request) {
    const { agent, data } = request;

    try {
      // 작업 관리 시스템 업데이트
      if (data.task_update) {
        await this.updateTaskDatabase(agent, data.task_update);
      }

      // 통신 로그 업데이트
      if (data.communication_log) {
        await this.updateCommunicationLog(data.communication_log);
      }

      console.log(`✅ ${agent} 노션 동기화 완료`);

    } catch (error) {
      console.error(`❌ ${agent} 노션 동기화 실패:`, error);
    }
  }

  /**
   * 작업 데이터베이스 업데이트
   * 이 메서드의 내용은 Module1 에이전트가 MCP 도구로 실행해야 함
   */
  async updateTaskDatabase(agent, task) {
    // Module1 에이전트가 실제 MCP 호출을 수행할 명령어 생성
    const notionCommand = this.generateNotionUpdateCommand(agent, task);
    
    // 명령어를 파일로 저장하여 Module1이 읽어서 실행하도록 함
    await this.saveNotionCommand(notionCommand);
    
    console.log(`📝 ${agent} 작업 데이터베이스 업데이트 명령 생성`);
  }

  /**
   * 통신 로그 업데이트
   */
  async updateCommunicationLog(logData) {
    const communicationCommand = this.generateCommunicationLogCommand(logData);
    await this.saveNotionCommand(communicationCommand);
    
    console.log(`💬 통신 로그 업데이트 명령 생성`);
  }

  /**
   * 노션 업데이트 명령어 생성
   */
  generateNotionUpdateCommand(agent, task) {
    let status = '🆕 대기중';
    switch(task.status) {
      case 'in_progress': status = '🔄 진행중'; break;
      case 'completed': status = '✅ 완료'; break;
      case 'failed': status = '❌ 실패'; break;
      case 'blocked': status = '⏸️ 보류'; break;
    }

    let priority = '🟢 보통';
    switch(task.priority) {
      case 'high': priority = '🟡 높음'; break;
      case 'critical': priority = '🔴 긴급'; break;
      case 'low': priority = '⚪ 낮음'; break;
    }

    return {
      type: 'create_or_update_task',
      database: this.tasksDatabase,
      data: {
        "작업명": task.title,
        "담당 AI": this.getAgentDisplayName(agent),
        "상태": status,
        "우선순위": priority,
        "작업 설명": task.description,
        "시작일": task.started_at ? task.started_at.split('T')[0] : null,
        "완료일": task.completed_at ? task.completed_at.split('T')[0] : null,
        "AI 메모": this.generateAIMemoryText(task)
      }
    };
  }

  /**
   * 통신 로그 명령어 생성
   */
  generateCommunicationLogCommand(logData) {
    let messageType = '진행보고';
    switch(logData.activity) {
      case 'task_start': messageType = '작업할당'; break;
      case 'task_complete': messageType = '완료통보'; break;
      case 'collaboration': messageType = '협업요청'; break;
      case 'error': messageType = '오류보고'; break;
    }

    return {
      type: 'create_communication_log',
      database: this.communicationDatabase,
      data: {
        "로그 ID": `[${logData.activity}] ${logData.agent_id} - ${new Date().toISOString()}`,
        "발신 AI": this.getAgentDisplayName(logData.agent_id),
        "수신 AI": "ARGO",
        "메시지 유형": messageType,
        "내용": this.generateLogContent(logData),
        "작업 연결 ID": logData.details?.task_id || ''
      }
    };
  }

  /**
   * 에이전트 표시명 변환
   */
  getAgentDisplayName(agentId) {
    const names = {
      'module2': 'Module2',
      'module3': 'Module3', 
      'module4': 'Module4',
      'module5': 'Module5',
      'module6': 'Module6',
      'module1': 'ARGO'
    };
    return names[agentId] || agentId;
  }

  /**
   * AI 메모 텍스트 생성
   */
  generateAIMemoryText(task) {
    let memo = `진행률: ${task.progress_percentage}%\n`;
    
    if (task.started_at) {
      memo += `시작: ${new Date(task.started_at).toLocaleString('ko-KR')}\n`;
    }
    
    if (task.completed_at) {
      memo += `완료: ${new Date(task.completed_at).toLocaleString('ko-KR')}\n`;
    }

    if (task.dependencies && task.dependencies.length > 0) {
      memo += `의존성: ${task.dependencies.join(', ')}\n`;
    }

    return memo;
  }

  /**
   * 로그 내용 생성
   */
  generateLogContent(logData) {
    let content = `${logData.agent_id}에서 ${logData.activity} 활동 발생\n`;
    
    if (logData.details) {
      content += `작업: ${logData.details.action_taken}\n`;
      
      if (logData.details.files_modified?.length > 0) {
        content += `수정된 파일: ${logData.details.files_modified.join(', ')}\n`;
      }
      
      if (logData.details.lines_changed > 0) {
        content += `변경된 라인: ${logData.details.lines_changed}줄\n`;
      }
    }

    content += `시간: ${new Date(logData.timestamp).toLocaleString('ko-KR')}`;
    
    return content;
  }

  /**
   * 노션 명령어 저장 (Module1이 읽어서 실행)
   */
  async saveNotionCommand(command) {
    const commandFile = '../../workflows/notion_commands.json';
    let commands = [];

    try {
      const data = await fs.readFile(commandFile, 'utf8');
      commands = JSON.parse(data);
    } catch (error) {
      // 파일이 없으면 새로 생성
    }

    commands.push({
      ...command,
      timestamp: new Date().toISOString(),
      processed: false
    });

    await fs.writeFile(commandFile, JSON.stringify(commands, null, 2));
  }

  /**
   * 동기화 큐 로드
   */
  async loadSyncQueue() {
    try {
      const data = await fs.readFile(this.syncQueueFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  /**
   * 처리된 요청들 큐에서 제거
   */
  async clearProcessedRequests(queue) {
    const remaining = queue.filter(req => !this.processedRequests.has(req.timestamp));
    await fs.writeFile(this.syncQueueFile, JSON.stringify(remaining, null, 2));
  }

  /**
   * Module1 에이전트가 실행할 명령어들 반환
   */
  async getNotionCommandsForExecution() {
    const commandFile = '../../workflows/notion_commands.json';
    
    try {
      const data = await fs.readFile(commandFile, 'utf8');
      const commands = JSON.parse(data);
      
      return commands.filter(cmd => !cmd.processed);
    } catch (error) {
      return [];
    }
  }

  /**
   * 명령어 처리 완료 표시
   */
  async markCommandAsProcessed(commandTimestamp) {
    const commandFile = '../../workflows/notion_commands.json';
    
    try {
      const data = await fs.readFile(commandFile, 'utf8');
      const commands = JSON.parse(data);
      
      const updatedCommands = commands.map(cmd => 
        cmd.timestamp === commandTimestamp 
          ? { ...cmd, processed: true }
          : cmd
      );
      
      await fs.writeFile(commandFile, JSON.stringify(updatedCommands, null, 2));
    } catch (error) {
      console.error('명령어 처리 완료 표시 실패:', error);
    }
  }
}

module.exports = NotionSyncHandler;