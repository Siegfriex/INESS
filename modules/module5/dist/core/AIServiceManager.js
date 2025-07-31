"use strict";
/**
 * AI Service Manager
 * 다양한 AI 서비스들을 통합 관리하는 핵심 컴포넌트
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIServiceManager = void 0;
const openai_1 = __importDefault(require("openai"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const logger_1 = require("../utils/logger");
class AIServiceManager {
    constructor(config) {
        this.isInitialized = false;
        this.config = config || this.loadConfigFromEnv();
        logger_1.aiLogger.info('🤖 AIServiceManager 생성됨');
    }
    /**
     * 환경 변수에서 설정 로드
     */
    loadConfigFromEnv() {
        return {
            openai: process.env.OPENAI_API_KEY ? {
                apiKey: process.env.OPENAI_API_KEY,
                model: process.env.OPENAI_MODEL || 'gpt-4',
                maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4096')
            } : undefined,
            anthropic: process.env.ANTHROPIC_API_KEY ? {
                apiKey: process.env.ANTHROPIC_API_KEY,
                model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
                maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4096')
            } : undefined,
            google: process.env.GOOGLE_AI_API_KEY ? {
                apiKey: process.env.GOOGLE_AI_API_KEY,
                model: process.env.GOOGLE_AI_MODEL || 'gemini-pro'
            } : undefined
        };
    }
    /**
     * AI 서비스들 초기화
     */
    async initialize() {
        try {
            logger_1.aiLogger.info('🔄 AI 서비스들 초기화 중...');
            // OpenAI 초기화
            if (this.config.openai) {
                this.openaiClient = new openai_1.default({
                    apiKey: this.config.openai.apiKey
                });
                logger_1.aiLogger.info('✅ OpenAI 클라이언트 초기화 완료');
            }
            // Anthropic 초기화
            if (this.config.anthropic) {
                this.anthropicClient = new sdk_1.default({
                    apiKey: this.config.anthropic.apiKey
                });
                logger_1.aiLogger.info('✅ Anthropic 클라이언트 초기화 완료');
            }
            // Google AI 초기화 (향후 구현)
            if (this.config.google) {
                // TODO: Google AI 클라이언트 초기화
                logger_1.aiLogger.info('📋 Google AI 클라이언트 초기화 예정');
            }
            this.isInitialized = true;
            logger_1.aiLogger.info('✅ 모든 AI 서비스 초기화 완료');
        }
        catch (error) {
            logger_1.aiLogger.error('❌ AI 서비스 초기화 실패:', error);
            throw new Error(`AI 서비스 초기화 실패: ${error}`);
        }
    }
    /**
     * OpenAI 텍스트 생성
     */
    async generateWithOpenAI(prompt, options) {
        const startTime = Date.now();
        try {
            if (!this.openaiClient) {
                throw new Error('OpenAI 클라이언트가 초기화되지 않았습니다');
            }
            const messages = [];
            if (options?.systemPrompt) {
                messages.push({
                    role: 'system',
                    content: options.systemPrompt
                });
            }
            messages.push({
                role: 'user',
                content: prompt
            });
            const completion = await this.openaiClient.chat.completions.create({
                model: options?.model || this.config.openai.model || 'gpt-4',
                messages,
                max_tokens: options?.maxTokens || this.config.openai.maxTokens || 4096,
                temperature: options?.temperature || 0.7
            });
            const responseTime = Date.now() - startTime;
            const response = {
                content: completion.choices[0]?.message?.content || '',
                model: completion.model,
                provider: 'openai',
                tokensUsed: completion.usage?.total_tokens || 0,
                responseTime,
                timestamp: new Date().toISOString()
            };
            logger_1.aiLogger.info('✅ OpenAI 응답 생성 완료', {
                model: response.model,
                tokensUsed: response.tokensUsed,
                responseTime: `${responseTime}ms`
            });
            return response;
        }
        catch (error) {
            logger_1.aiLogger.error('❌ OpenAI 응답 생성 실패:', error);
            throw new Error(`OpenAI 응답 생성 실패: ${error}`);
        }
    }
    /**
     * Anthropic 텍스트 생성
     */
    async generateWithAnthropic(prompt, options) {
        const startTime = Date.now();
        try {
            if (!this.anthropicClient) {
                throw new Error('Anthropic 클라이언트가 초기화되지 않았습니다');
            }
            const message = await this.anthropicClient.messages.create({
                model: options?.model || this.config.anthropic.model || 'claude-3-sonnet-20240229',
                max_tokens: options?.maxTokens || this.config.anthropic.maxTokens || 4096,
                temperature: options?.temperature || 0.7,
                system: options?.systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            });
            const responseTime = Date.now() - startTime;
            const content = message.content[0];
            const response = {
                content: content.type === 'text' ? content.text : '',
                model: message.model,
                provider: 'anthropic',
                tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
                responseTime,
                timestamp: new Date().toISOString()
            };
            logger_1.aiLogger.info('✅ Anthropic 응답 생성 완료', {
                model: response.model,
                tokensUsed: response.tokensUsed,
                responseTime: `${responseTime}ms`
            });
            return response;
        }
        catch (error) {
            logger_1.aiLogger.error('❌ Anthropic 응답 생성 실패:', error);
            throw new Error(`Anthropic 응답 생성 실패: ${error}`);
        }
    }
    /**
     * 최적 AI 서비스 자동 선택 및 생성
     */
    async generateSmart(prompt, options) {
        try {
            // 작업 유형별 최적 프로바이더 선택
            let provider = options?.preferredProvider;
            if (!provider) {
                switch (options?.taskType) {
                    case 'creative':
                        provider = this.anthropicClient ? 'anthropic' : 'openai';
                        break;
                    case 'analytical':
                        provider = this.openaiClient ? 'openai' : 'anthropic';
                        break;
                    case 'coding':
                        provider = this.openaiClient ? 'openai' : 'anthropic';
                        break;
                    default:
                        provider = this.openaiClient ? 'openai' : 'anthropic';
                }
            }
            // 선택된 프로바이더로 생성
            switch (provider) {
                case 'openai':
                    if (this.openaiClient) {
                        return await this.generateWithOpenAI(prompt, options);
                    }
                    break;
                case 'anthropic':
                    if (this.anthropicClient) {
                        return await this.generateWithAnthropic(prompt, options);
                    }
                    break;
                case 'google':
                    // TODO: Google AI 구현
                    throw new Error('Google AI는 아직 구현되지 않았습니다');
            }
            // 폴백: 사용 가능한 첫 번째 서비스 사용
            if (this.openaiClient) {
                return await this.generateWithOpenAI(prompt, options);
            }
            else if (this.anthropicClient) {
                return await this.generateWithAnthropic(prompt, options);
            }
            throw new Error('사용 가능한 AI 서비스가 없습니다');
        }
        catch (error) {
            logger_1.aiLogger.error('❌ 스마트 AI 생성 실패:', error);
            throw error;
        }
    }
    /**
     * 서비스 상태 확인
     */
    async getServiceStatus() {
        const status = {
            openai: false,
            anthropic: false,
            google: false,
            lastChecked: new Date().toISOString()
        };
        try {
            // OpenAI 상태 확인
            if (this.openaiClient) {
                try {
                    await this.openaiClient.models.list();
                    status.openai = true;
                }
                catch (error) {
                    logger_1.aiLogger.warn('⚠️ OpenAI 서비스 상태 확인 실패:', error);
                }
            }
            // Anthropic 상태 확인
            if (this.anthropicClient) {
                // Anthropic은 직접적인 상태 확인 API가 없으므로 초기화 상태로 판단
                status.anthropic = true;
            }
            // Google AI 상태 확인 (향후 구현)
            status.google = false;
        }
        catch (error) {
            logger_1.aiLogger.error('❌ 서비스 상태 확인 중 오류:', error);
        }
        return status;
    }
    /**
     * 헬스 체크
     */
    async healthCheck() {
        try {
            const status = await this.getServiceStatus();
            return status.openai || status.anthropic || status.google;
        }
        catch (error) {
            logger_1.aiLogger.error('❌ AI 서비스 헬스 체크 실패:', error);
            return false;
        }
    }
    /**
     * 리소스 정리
     */
    async cleanup() {
        try {
            logger_1.aiLogger.info('🧹 AI 서비스 리소스 정리 중...');
            // 클라이언트 정리
            this.openaiClient = undefined;
            this.anthropicClient = undefined;
            this.isInitialized = false;
            logger_1.aiLogger.info('✅ AI 서비스 리소스 정리 완료');
        }
        catch (error) {
            logger_1.aiLogger.error('❌ AI 서비스 리소스 정리 실패:', error);
            throw error;
        }
    }
}
exports.AIServiceManager = AIServiceManager;
//# sourceMappingURL=AIServiceManager.js.map