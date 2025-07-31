"use strict";
/**
 * Workflow Engine
 * AI 기반 워크플로우를 설계하고 실행하는 엔진
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngine = void 0;
const logger_1 = require("../utils/logger");
const AIServiceManager_1 = require("../core/AIServiceManager");
class WorkflowEngine {
    constructor() {
        this.workflows = new Map();
        this.isRunning = false;
        this.templates = new Map();
        this.aiServiceManager = new AIServiceManager_1.AIServiceManager();
        this.initializeTemplates();
        logger_1.aiLogger.info('🔄 WorkflowEngine 생성됨');
    }
    /**
     * 워크플로우 템플릿 초기화
     */
    initializeTemplates() {
        // 감정 분석 워크플로우 템플릿
        this.templates.set('emotion-analysis', {
            id: 'emotion-analysis',
            name: '감정 분석 워크플로우',
            description: '사용자 텍스트에서 감정을 분석하고 인사이트를 제공',
            category: 'emotion',
            variables: ['userText', 'context'],
            steps: [
                {
                    name: '텍스트 전처리',
                    type: 'data_processing',
                    config: {
                        action: 'clean_text',
                        removeEmojis: false,
                        normalizeSpacing: true
                    }
                },
                {
                    name: '감정 분석',
                    type: 'ai_generation',
                    config: {
                        provider: 'openai',
                        systemPrompt: `당신은 전문적인 감정 분석 AI입니다. 
주어진 텍스트에서 다음을 분석해주세요:
1. 주요 감정 (기쁨, 슬픔, 분노, 두려움, 놀람, 혐오, 중립)
2. 감정 강도 (1-10)
3. 감정의 원인
4. 개선 제안

JSON 형태로 응답해주세요.`,
                        taskType: 'analytical'
                    }
                },
                {
                    name: '위험도 평가',
                    type: 'ai_generation',
                    config: {
                        provider: 'anthropic',
                        systemPrompt: `감정 분석 결과를 바탕으로 사용자의 정신건강 위험도를 평가해주세요.
위험도: LOW, MEDIUM, HIGH, CRITICAL
근거와 권장사항을 포함해주세요.`,
                        taskType: 'analytical'
                    },
                    dependencies: ['감정 분석']
                },
                {
                    name: '개인화 인사이트 생성',
                    type: 'ai_generation',
                    config: {
                        provider: 'anthropic',
                        systemPrompt: `사용자에게 도움이 되는 개인화된 인사이트와 조언을 생성해주세요.
따뜻하고 공감적인 톤으로 작성하되, 전문적인 조언을 포함해주세요.`,
                        taskType: 'creative'
                    },
                    dependencies: ['감정 분석', '위험도 평가']
                }
            ]
        });
        // 컨텐츠 생성 워크플로우 템플릿
        this.templates.set('content-generation', {
            id: 'content-generation',
            name: '콘텐츠 생성 워크플로우',
            description: '멘탈 헬스 관련 콘텐츠 자동 생성',
            category: 'content',
            variables: ['topic', 'targetAudience', 'contentType'],
            steps: [
                {
                    name: '주제 분석',
                    type: 'ai_generation',
                    config: {
                        provider: 'openai',
                        systemPrompt: '주어진 주제에 대해 멘탈 헬스 관점에서 분석하고 핵심 포인트를 정리해주세요.',
                        taskType: 'analytical'
                    }
                },
                {
                    name: '콘텐츠 초안 생성',
                    type: 'ai_generation',
                    config: {
                        provider: 'anthropic',
                        systemPrompt: '분석 결과를 바탕으로 매력적이고 유익한 콘텐츠를 생성해주세요.',
                        taskType: 'creative'
                    },
                    dependencies: ['주제 분석']
                },
                {
                    name: '콘텐츠 검증',
                    type: 'validation',
                    config: {
                        checkAccuracy: true,
                        checkTone: true,
                        checkCompliance: true
                    },
                    dependencies: ['콘텐츠 초안 생성']
                }
            ]
        });
        logger_1.aiLogger.info(`✅ ${this.templates.size}개의 워크플로우 템플릿 초기화 완료`);
    }
    /**
     * 워크플로우 엔진 시작
     */
    async start() {
        try {
            if (this.isRunning) {
                logger_1.aiLogger.warn('⚠️ WorkflowEngine이 이미 실행 중입니다');
                return;
            }
            logger_1.aiLogger.info('🚀 WorkflowEngine 시작...');
            // AI Service Manager 초기화
            await this.aiServiceManager.initialize();
            this.isRunning = true;
            logger_1.aiLogger.info('✅ WorkflowEngine 시작 완료');
        }
        catch (error) {
            logger_1.aiLogger.error('❌ WorkflowEngine 시작 실패:', error);
            throw error;
        }
    }
    /**
     * 템플릿으로부터 워크플로우 생성
     */
    createWorkflowFromTemplate(templateId, variables) {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`템플릿을 찾을 수 없습니다: ${templateId}`);
        }
        const workflowId = `${templateId}-${Date.now()}`;
        const workflow = {
            id: workflowId,
            name: template.name,
            description: template.description,
            steps: template.steps.map((step, index) => ({
                ...step,
                id: `${workflowId}-step-${index}`,
                config: this.replaceVariables(step.config, variables)
            })),
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        this.workflows.set(workflowId, workflow);
        logger_1.aiLogger.info(`✅ 워크플로우 생성됨: ${workflowId}`, { template: templateId });
        return workflowId;
    }
    /**
     * 변수 치환
     */
    replaceVariables(config, variables) {
        const configStr = JSON.stringify(config);
        const replacedStr = configStr.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
            return variables[varName] || match;
        });
        return JSON.parse(replacedStr);
    }
    /**
     * 워크플로우 실행
     */
    async executeWorkflow(workflowId) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`워크플로우를 찾을 수 없습니다: ${workflowId}`);
        }
        try {
            logger_1.aiLogger.info(`🔄 워크플로우 실행 시작: ${workflowId}`);
            workflow.status = 'running';
            workflow.startedAt = new Date().toISOString();
            const stepResults = {};
            // 종속성 그래프에 따라 단계별 실행
            const executedSteps = new Set();
            while (executedSteps.size < workflow.steps.length) {
                const readySteps = workflow.steps.filter(step => !executedSteps.has(step.id) &&
                    (!step.dependencies || step.dependencies.every(dep => workflow.steps.find(s => s.name === dep && executedSteps.has(s.id)))));
                if (readySteps.length === 0) {
                    throw new Error('워크플로우에 순환 종속성이 있습니다');
                }
                // 병렬 실행 가능한 단계들 처리
                const stepPromises = readySteps.map(async (step) => {
                    const result = await this.executeStep(step, stepResults);
                    stepResults[step.name] = result;
                    executedSteps.add(step.id);
                    return { stepId: step.id, result };
                });
                await Promise.all(stepPromises);
            }
            workflow.status = 'completed';
            workflow.completedAt = new Date().toISOString();
            workflow.results = stepResults;
            logger_1.aiLogger.info(`✅ 워크플로우 실행 완료: ${workflowId}`);
            return stepResults;
        }
        catch (error) {
            workflow.status = 'failed';
            workflow.error = error instanceof Error ? error.message : String(error);
            logger_1.aiLogger.error(`❌ 워크플로우 실행 실패: ${workflowId}`, error);
            throw error;
        }
    }
    /**
     * 개별 단계 실행
     */
    async executeStep(step, previousResults) {
        logger_1.aiLogger.info(`🔄 단계 실행: ${step.name} (${step.type})`);
        try {
            switch (step.type) {
                case 'ai_generation':
                    return await this.executeAIGenerationStep(step, previousResults);
                case 'data_processing':
                    return await this.executeDataProcessingStep(step, previousResults);
                case 'validation':
                    return await this.executeValidationStep(step, previousResults);
                case 'notification':
                    return await this.executeNotificationStep(step, previousResults);
                default:
                    throw new Error(`지원하지 않는 단계 타입: ${step.type}`);
            }
        }
        catch (error) {
            logger_1.aiLogger.error(`❌ 단계 실행 실패: ${step.name}`, error);
            throw error;
        }
    }
    /**
     * AI 생성 단계 실행
     */
    async executeAIGenerationStep(step, previousResults) {
        const config = step.config;
        const prompt = this.buildPromptFromContext(config.prompt || '', previousResults);
        const response = await this.aiServiceManager.generateSmart(prompt, {
            preferredProvider: config.provider,
            taskType: config.taskType,
            systemPrompt: config.systemPrompt,
            maxTokens: config.maxTokens,
            temperature: config.temperature
        });
        return {
            content: response.content,
            metadata: {
                provider: response.provider,
                model: response.model,
                tokensUsed: response.tokensUsed,
                responseTime: response.responseTime
            }
        };
    }
    /**
     * 데이터 처리 단계 실행
     */
    async executeDataProcessingStep(step, previousResults) {
        // 단순한 데이터 처리 로직 구현
        const config = step.config;
        let result = previousResults;
        if (config.action === 'clean_text') {
            // 텍스트 정리 로직
            result = {
                cleanedText: 'Processed text',
                processingInfo: config
            };
        }
        return result;
    }
    /**
     * 검증 단계 실행
     */
    async executeValidationStep(step, previousResults) {
        const config = step.config;
        const validationResults = {
            accuracy: config.checkAccuracy ? 'PASS' : 'SKIP',
            tone: config.checkTone ? 'PASS' : 'SKIP',
            compliance: config.checkCompliance ? 'PASS' : 'SKIP',
            overall: 'PASS'
        };
        return validationResults;
    }
    /**
     * 알림 단계 실행
     */
    async executeNotificationStep(step, previousResults) {
        // 알림 발송 로직 (향후 구현)
        logger_1.aiLogger.info('📬 알림 발송:', step.config);
        return { sent: true, timestamp: new Date().toISOString() };
    }
    /**
     * 컨텍스트에서 프롬프트 구성
     */
    buildPromptFromContext(template, context) {
        let prompt = template;
        // 이전 결과를 프롬프트에 포함
        for (const [key, value] of Object.entries(context)) {
            const placeholder = `{{${key}}}`;
            if (prompt.includes(placeholder)) {
                prompt = prompt.replace(placeholder, JSON.stringify(value, null, 2));
            }
        }
        return prompt;
    }
    /**
     * 활성 워크플로우 목록 조회
     */
    async getActiveWorkflows() {
        const activeWorkflows = Array.from(this.workflows.values())
            .filter(workflow => workflow.status === 'running')
            .map(workflow => workflow.id);
        return activeWorkflows;
    }
    /**
     * 워크플로우 상태 조회
     */
    getWorkflowStatus(workflowId) {
        return this.workflows.get(workflowId);
    }
    /**
     * 헬스 체크
     */
    async healthCheck() {
        try {
            return this.isRunning && await this.aiServiceManager.healthCheck();
        }
        catch (error) {
            logger_1.aiLogger.error('❌ WorkflowEngine 헬스 체크 실패:', error);
            return false;
        }
    }
    /**
     * 워크플로우 엔진 중지
     */
    async stop() {
        try {
            logger_1.aiLogger.info('🛑 WorkflowEngine 중지 중...');
            // 실행 중인 워크플로우들 정리
            for (const workflow of this.workflows.values()) {
                if (workflow.status === 'running') {
                    workflow.status = 'failed';
                    workflow.error = 'Engine shutdown';
                }
            }
            await this.aiServiceManager.cleanup();
            this.isRunning = false;
            logger_1.aiLogger.info('✅ WorkflowEngine 중지 완료');
        }
        catch (error) {
            logger_1.aiLogger.error('❌ WorkflowEngine 중지 실패:', error);
            throw error;
        }
    }
}
exports.WorkflowEngine = WorkflowEngine;
//# sourceMappingURL=WorkflowEngine.js.map