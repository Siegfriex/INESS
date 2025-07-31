/**
 * Module4 - Database Agent
 * 데이터베이스 관리 전담 AI 에이전트
 *
 * @description Firebase Firestore 기반 데이터베이스 설계, 최적화, 관리
 * @author Module4 Database Agent
 * @version 1.0.0
 */
import { DatabaseAgent } from './services/DatabaseAgent';
export * from './models';
export * from './services';
export * from './types';
export * from './utils';
/**
 * Module4 Database Agent 초기화
 */
export declare class Module4Agent {
    private databaseAgent;
    constructor();
    /**
     * 에이전트 시작
     */
    start(): Promise<void>;
    /**
     * 에이전트 중지
     */
    stop(): Promise<void>;
    /**
     * Database Agent 인스턴스 반환
     */
    getDatabaseAgent(): DatabaseAgent;
}
export declare const module4Agent: Module4Agent;
