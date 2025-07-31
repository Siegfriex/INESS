/**
 * Module4 - Database Agent
 * 데이터베이스 관리 전담 AI 에이전트
 * 
 * @description Firebase Firestore 기반 데이터베이스 설계, 최적화, 관리
 * @author Module4 Database Agent
 * @version 1.0.0
 */

import { DatabaseAgent } from './services/DatabaseAgent';
import { FirestoreService } from './services/FirestoreService';
import { SchemaValidator } from './services/SchemaValidator';
import { PerformanceMonitor } from './services/PerformanceMonitor';

export * from './models';
export * from './services';
export * from './types';
export * from './utils';

/**
 * Module4 Database Agent 초기화
 */
export class Module4Agent {
  private databaseAgent: DatabaseAgent;
  
  constructor() {
    console.log('🗄️ Module4 Database Agent 시작 중...');
    
    // 서비스 초기화
    const firestoreService = new FirestoreService();
    const schemaValidator = new SchemaValidator();
    const performanceMonitor = new PerformanceMonitor();
    
    // Database Agent 초기화
    this.databaseAgent = new DatabaseAgent(
      firestoreService,
      schemaValidator,
      performanceMonitor
    );
    
    console.log('✅ Module4 Database Agent 준비 완료');
  }
  
  /**
   * 에이전트 시작
   */
  public async start(): Promise<void> {
    try {
      await this.databaseAgent.initialize();
      await this.databaseAgent.startMonitoring();
      
      console.log('🚀 Module4 Database Agent 활성화됨');
    } catch (error) {
      console.error('❌ Module4 초기화 실패:', error);
      throw error;
    }
  }
  
  /**
   * 에이전트 중지
   */
  public async stop(): Promise<void> {
    await this.databaseAgent.stop();
    console.log('⏹️ Module4 Database Agent 중지됨');
  }
  
  /**
   * Database Agent 인스턴스 반환
   */
  public getDatabaseAgent(): DatabaseAgent {
    return this.databaseAgent;
  }
}

// 기본 에이전트 인스턴스 생성
export const module4Agent = new Module4Agent();

// 자동 시작 (환경변수로 제어 가능)
if (process.env.NODE_ENV !== 'test' && process.env.AUTO_START !== 'false') {
  module4Agent.start().catch(console.error);
}