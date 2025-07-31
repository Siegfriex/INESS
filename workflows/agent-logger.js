/**
 * Agent Logger - 백그라운드 에이전트들이 사용할 로깅 유틸리티
 * 각 모듈에서 import하여 활동을 로그에 기록
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class AgentLogger {
  constructor(agentId) {
    this.agentId = agentId;
    this.sessionId = uuidv4();
    this.logFile = path.join('../../logs', `${agentId}_activity.json`);
    this.currentTask = null;
  }

  /**
   * 작업 시작 로그
   */
  async logTaskStart(task) {
    this.currentTask = {
      id: task.id || uuidv4(),
      title: task.title,
      description: task.description,
      priority: task.priority || 'medium',
      status: 'in_progress',
      progress_percentage: 0,
      started_at: new Date().toISOString()
    };

    await this.writeLog({
      activity_type: 'task_start',
      task: this.currentTask,
      details: {
        action_taken: `"${task.title}" 작업 시작`,
        files_modified: [],
        lines_changed: 0,
        dependencies: task.dependencies || [],
        next_steps: task.next_steps || []
      }
    });

    console.log(`📋 [${this.agentId}] 작업 시작: ${task.title}`);
  }

  /**
   * 작업 진행 상황 로그
   */
  async logProgress(progressPercentage, actionTaken, filesModified = []) {
    if (!this.currentTask) return;

    this.currentTask.progress_percentage = progressPercentage;
    this.currentTask.status = progressPercentage >= 100 ? 'completed' : 'in_progress';

    await this.writeLog({
      activity_type: 'task_progress',
      task: this.currentTask,
      details: {
        action_taken: actionTaken,
        files_modified: filesModified,
        lines_changed: await this.calculateLinesChanged(filesModified),
        dependencies: this.currentTask.dependencies || [],
        next_steps: []
      }
    });

    console.log(`⚡ [${this.agentId}] 진행: ${progressPercentage}% - ${actionTaken}`);
  }

  /**
   * 작업 완료 로그
   */
  async logTaskComplete(result, requestCommit = false, commitMessage = '') {
    if (!this.currentTask) return;

    this.currentTask.status = 'completed';
    this.currentTask.progress_percentage = 100;
    this.currentTask.completed_at = new Date().toISOString();

    await this.writeLog({
      activity_type: 'task_complete',
      task: this.currentTask,
      details: {
        action_taken: `"${this.currentTask.title}" 작업 완료`,
        files_modified: result.files || [],
        lines_changed: result.lines_changed || 0,
        dependencies: this.currentTask.dependencies || [],
        next_steps: result.next_steps || []
      },
      git_status: {
        commit_requested: requestCommit,
        files_staged: result.files || [],
        commit_message: commitMessage,
        branch: `feature/${this.agentId}-${this.currentTask.id}`
      },
      notion_sync: {
        should_sync: true,
        task_database_update: true,
        communication_log_update: true,
        custom_updates: result.notion_updates || []
      }
    });

    console.log(`✅ [${this.agentId}] 작업 완료: ${this.currentTask.title}`);
    this.currentTask = null;
  }

  /**
   * 에러 로그
   */
  async logError(error, context = '') {
    const errorLog = {
      activity_type: 'error',
      task: this.currentTask,
      details: {
        action_taken: `에러 발생: ${context}`,
        files_modified: [],
        lines_changed: 0,
        dependencies: [],
        next_steps: ['에러 해결 필요']
      },
      errors: {
        error_count: 1,
        error_messages: [error.message || error],
        warnings: [],
        resolutions: []
      }
    };

    await this.writeLog(errorLog);
    console.error(`❌ [${this.agentId}] 에러: ${error.message || error}`);
  }

  /**
   * 협업 활동 로그
   */
  async logCollaboration(targetAgent, action, data = {}) {
    await this.writeLog({
      activity_type: 'collaboration',
      task: this.currentTask,
      details: {
        action_taken: `${targetAgent}와 협업: ${action}`,
        files_modified: [],
        lines_changed: 0,
        dependencies: [targetAgent],
        next_steps: []
      },
      communication: {
        reported_to: ['ARGO'],
        collaborated_with: [targetAgent],
        requests_sent: [{ target: targetAgent, action: action, data: data }],
        responses_received: []
      }
    });

    console.log(`🤝 [${this.agentId}] 협업: ${targetAgent} - ${action}`);
  }

  /**
   * 성능 메트릭 로그
   */
  async logPerformance(executionTime, memoryUsage, cpuUsage) {
    if (!this.currentTask) return;

    await this.writeLog({
      activity_type: 'performance_metric',
      task: this.currentTask,
      performance: {
        execution_time_ms: executionTime,
        memory_usage_mb: memoryUsage,
        cpu_usage_percent: cpuUsage
      }
    });
  }

  /**
   * 기본 로그 작성 메서드
   */
  async writeLog(logData) {
    const logEntry = {
      agent_id: this.agentId,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      ...logData,
      performance: logData.performance || {
        execution_time_ms: 0,
        memory_usage_mb: process.memoryUsage().heapUsed / 1024 / 1024,
        cpu_usage_percent: 0
      },
      communication: logData.communication || {
        reported_to: ['ARGO'],
        collaborated_with: [],
        requests_sent: [],
        responses_received: []
      },
      errors: logData.errors || {
        error_count: 0,
        error_messages: [],
        warnings: [],
        resolutions: []
      },
      git_status: logData.git_status || {
        commit_requested: false,
        files_staged: [],
        commit_message: '',
        branch: 'main'
      },
      notion_sync: logData.notion_sync || {
        should_sync: false,
        task_database_update: false,
        communication_log_update: false,
        custom_updates: []
      }
    };

    try {
      // 기존 로그 파일 읽기
      let existingLogs = { logs: [] };
      try {
        const data = await fs.readFile(this.logFile, 'utf8');
        existingLogs = JSON.parse(data);
      } catch (error) {
        // 파일이 없으면 새로 생성
      }

      // 새 로그 추가
      existingLogs.logs.push(logEntry);

      // 로그 파일 크기 제한 (최대 1000개 엔트리)
      if (existingLogs.logs.length > 1000) {
        existingLogs.logs = existingLogs.logs.slice(-1000);
      }

      // 파일에 저장
      await fs.writeFile(this.logFile, JSON.stringify(existingLogs, null, 2));

    } catch (error) {
      console.error(`로그 작성 실패 [${this.agentId}]:`, error);
    }
  }

  /**
   * 파일 변경 라인 수 계산
   */
  async calculateLinesChanged(files) {
    // 실제 구현에서는 git diff를 사용하거나 파일 크기 비교
    return files.length * 10; // 임시 계산
  }

  /**
   * 현재 작업 상태 반환
   */
  getCurrentTask() {
    return this.currentTask;
  }

  /**
   * 에이전트 상태 요약
   */
  getAgentStatus() {
    return {
      agent_id: this.agentId,
      session_id: this.sessionId,
      current_task: this.currentTask,
      is_busy: !!this.currentTask,
      last_activity: new Date().toISOString()
    };
  }
}

module.exports = AgentLogger;