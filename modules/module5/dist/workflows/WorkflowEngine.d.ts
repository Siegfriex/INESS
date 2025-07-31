/**
 * Workflow Engine
 * AI 기반 워크플로우를 설계하고 실행하는 엔진
 */
export interface WorkflowStep {
    id: string;
    name: string;
    type: 'ai_generation' | 'data_processing' | 'validation' | 'notification';
    config: any;
    dependencies?: string[];
}
export interface Workflow {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    status: 'pending' | 'running' | 'completed' | 'failed';
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    results?: any;
    error?: string;
}
export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    steps: Omit<WorkflowStep, 'id'>[];
    variables: string[];
}
export declare class WorkflowEngine {
    private workflows;
    private aiServiceManager;
    private isRunning;
    private templates;
    constructor();
    /**
     * 워크플로우 템플릿 초기화
     */
    private initializeTemplates;
    /**
     * 워크플로우 엔진 시작
     */
    start(): Promise<void>;
    /**
     * 템플릿으로부터 워크플로우 생성
     */
    createWorkflowFromTemplate(templateId: string, variables: Record<string, any>): string;
    /**
     * 변수 치환
     */
    private replaceVariables;
    /**
     * 워크플로우 실행
     */
    executeWorkflow(workflowId: string): Promise<any>;
    /**
     * 개별 단계 실행
     */
    private executeStep;
    /**
     * AI 생성 단계 실행
     */
    private executeAIGenerationStep;
    /**
     * 데이터 처리 단계 실행
     */
    private executeDataProcessingStep;
    /**
     * 검증 단계 실행
     */
    private executeValidationStep;
    /**
     * 알림 단계 실행
     */
    private executeNotificationStep;
    /**
     * 컨텍스트에서 프롬프트 구성
     */
    private buildPromptFromContext;
    /**
     * 활성 워크플로우 목록 조회
     */
    getActiveWorkflows(): Promise<string[]>;
    /**
     * 워크플로우 상태 조회
     */
    getWorkflowStatus(workflowId: string): Workflow | undefined;
    /**
     * 헬스 체크
     */
    healthCheck(): Promise<boolean>;
    /**
     * 워크플로우 엔진 중지
     */
    stop(): Promise<void>;
}
//# sourceMappingURL=WorkflowEngine.d.ts.map