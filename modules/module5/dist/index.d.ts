/**
 * Module5 - AI Integration Agent
 * AI 서비스 통합 전담 에이전트
 *
 * @author Module5 AI Integration Agent
 * @version 1.0.0
 */
/**
 * Module5 AI Integration Agent 메인 클래스
 */
declare class Module5Agent {
    private aiServiceManager;
    private workflowEngine;
    private performanceMonitor;
    private isRunning;
    constructor();
    /**
     * AI 에이전트 시작
     */
    start(): Promise<void>;
    /**
     * AI 에이전트 중지
     */
    stop(): Promise<void>;
    /**
     * 상태 리포트 생성
     */
    private reportStatus;
    /**
     * 헬스 체크
     */
    healthCheck(): Promise<boolean>;
}
declare const agent: Module5Agent;
export default agent;
export { Module5Agent };
//# sourceMappingURL=index.d.ts.map