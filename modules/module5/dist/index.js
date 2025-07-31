"use strict";
/**
 * Module5 - AI Integration Agent
 * AI 서비스 통합 전담 에이전트
 *
 * @author Module5 AI Integration Agent
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module5Agent = void 0;
const dotenv_1 = require("dotenv");
const logger_1 = require("./utils/logger");
const AIServiceManager_1 = require("./core/AIServiceManager");
const WorkflowEngine_1 = require("./workflows/WorkflowEngine");
const PerformanceMonitor_1 = require("./monitoring/PerformanceMonitor");
// 환경 변수 로드
(0, dotenv_1.config)();
/**
 * Module5 AI Integration Agent 메인 클래스
 */
class Module5Agent {
    constructor() {
        this.isRunning = false;
        logger_1.logger.info('🤖 Module5 AI Integration Agent 초기화 중...');
        this.aiServiceManager = new AIServiceManager_1.AIServiceManager();
        this.workflowEngine = new WorkflowEngine_1.WorkflowEngine();
        this.performanceMonitor = new PerformanceMonitor_1.PerformanceMonitor();
        logger_1.logger.info('✅ Module5 AI Integration Agent 초기화 완료');
    }
    /**
     * AI 에이전트 시작
     */
    async start() {
        try {
            if (this.isRunning) {
                logger_1.logger.warn('⚠️ Module5 AI Integration Agent가 이미 실행 중입니다');
                return;
            }
            logger_1.logger.info('🚀 Module5 AI Integration Agent 시작...');
            // AI 서비스 초기화
            await this.aiServiceManager.initialize();
            // 워크플로우 엔진 시작
            await this.workflowEngine.start();
            // 성능 모니터링 시작
            await this.performanceMonitor.start();
            this.isRunning = true;
            logger_1.logger.info('✅ Module5 AI Integration Agent 성공적으로 시작됨');
            // 에이전트 상태 리포트
            await this.reportStatus();
        }
        catch (error) {
            logger_1.logger.error('❌ Module5 AI Integration Agent 시작 실패:', error);
            throw error;
        }
    }
    /**
     * AI 에이전트 중지
     */
    async stop() {
        try {
            logger_1.logger.info('🛑 Module5 AI Integration Agent 중지 중...');
            // 성능 모니터링 중지
            await this.performanceMonitor.stop();
            // 워크플로우 엔진 중지
            await this.workflowEngine.stop();
            // AI 서비스 정리
            await this.aiServiceManager.cleanup();
            this.isRunning = false;
            logger_1.logger.info('✅ Module5 AI Integration Agent 중지 완료');
        }
        catch (error) {
            logger_1.logger.error('❌ Module5 AI Integration Agent 중지 실패:', error);
            throw error;
        }
    }
    /**
     * 상태 리포트 생성
     */
    async reportStatus() {
        const status = {
            module: 'Module5',
            name: 'AI Integration Agent',
            status: this.isRunning ? 'ACTIVE' : 'INACTIVE',
            timestamp: new Date().toISOString(),
            services: await this.aiServiceManager.getServiceStatus(),
            workflows: await this.workflowEngine.getActiveWorkflows(),
            performance: await this.performanceMonitor.getCurrentMetrics()
        };
        logger_1.logger.info('📊 Module5 상태 리포트:', status);
        // ARGO에게 상태 전송 (향후 구현)
        // await this.notifyARGO(status);
    }
    /**
     * 헬스 체크
     */
    async healthCheck() {
        try {
            const aiServicesHealthy = await this.aiServiceManager.healthCheck();
            const workflowEngineHealthy = await this.workflowEngine.healthCheck();
            const monitoringHealthy = await this.performanceMonitor.healthCheck();
            return aiServicesHealthy && workflowEngineHealthy && monitoringHealthy;
        }
        catch (error) {
            logger_1.logger.error('❌ Module5 헬스 체크 실패:', error);
            return false;
        }
    }
}
exports.Module5Agent = Module5Agent;
// 에이전트 인스턴스 생성
const agent = new Module5Agent();
// 프로세스 이벤트 핸들러
process.on('SIGTERM', async () => {
    logger_1.logger.info('🔄 SIGTERM 수신, Module5 AI Integration Agent 종료 중...');
    await agent.stop();
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.logger.info('🔄 SIGINT 수신, Module5 AI Integration Agent 종료 중...');
    await agent.stop();
    process.exit(0);
});
// 에러 핸들러
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    logger_1.logger.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
// 개발 모드에서 즉시 시작
if (process.env.NODE_ENV !== 'production') {
    agent.start().catch((error) => {
        logger_1.logger.error('❌ Module5 AI Integration Agent 시작 실패:', error);
        process.exit(1);
    });
}
exports.default = agent;
//# sourceMappingURL=index.js.map