/**
 * INESS 진짜 자동화 시스템
 * CSO 작전담당관 - 완전 자율 AI 협업 시스템
 * 
 * 핵심: Cursor AI 제한 우회 → 실제 AI API 직접 활용
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Anthropic } = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { spawn } = require('child_process');

class RealAIAgentSystem {
    constructor() {
        this.systemName = "INESS 진짜 자동화 시스템";
        this.version = "2.0.0";
        this.isRunning = false;
        
        // 환경변수 로드
        require('dotenv').config();
        
        // AI API 클라이언트들
        this.gemini = new GoogleGenerativeAI(
            process.env.GEMINI_API_KEY || (() => {
                console.error('❌ GEMINI_API_KEY가 환경변수에 설정되지 않았습니다!');
                console.log('💡 .env 파일에 GEMINI_API_KEY를 설정해주세요');
                process.exit(1);
            })()
        );
        
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY || (() => {
                console.error('❌ ANTHROPIC_API_KEY가 환경변수에 설정되지 않았습니다!');
                console.log('💡 .env 파일에 ANTHROPIC_API_KEY를 설정해주세요');
                process.exit(1);
            })()
        });
        
        // 에이전트 정의 (Gemini + Claude 최적 조합)
        this.agents = {
            module1: {
                name: "ARGO 메인 아키텍트",
                ai_provider: "anthropic",
                model: "claude-3-5-sonnet-20241022",
                role: "프로젝트 총괄 및 조율",
                personality: "전략적 사고, 효율성 중시, 명확한 지시, 리더십",
                capabilities: ["프로젝트 관리", "AI 에이전트 조율", "의사결정", "전략 수립"],
                workspace: "./",
                active: true,
                specialization: "최신 Claude 3.5 Sonnet으로 전략적 사고와 프로젝트 관리 최적화"
            },
            module2: {
                name: "Frontend 개발 마스터",
                ai_provider: "gemini", 
                model: "gemini-1.5-pro-latest",
                role: "React Native 앱 개발",
                personality: "사용자 경험 중시, 창의적, 세심함, 실용적",
                capabilities: ["React Native", "UI/UX", "TypeScript", "모바일 최적화", "성능 튜닝"],
                workspace: "./modules/module2",
                active: false,
                specialization: "Gemini 1.5 Pro로 코딩 및 UI/UX 구현 최적화"
            },
            module3: {
                name: "Backend 아키텍트",
                ai_provider: "gemini",
                model: "gemini-1.5-pro-latest",
                role: "API 및 서버 개발",
                personality: "안정성 중시, 체계적, 보안 의식, 효율성 추구",
                capabilities: ["Node.js", "Firebase Functions", "API 설계", "서버 아키텍처", "보안"],
                workspace: "./modules/module3", 
                active: false,
                specialization: "Gemini 1.5 Pro로 백엔드 코딩 및 API 개발 최적화"
            },
            module4: {
                name: "데이터베이스 설계자",
                ai_provider: "anthropic",
                model: "claude-3-5-sonnet-20241022",
                role: "데이터 모델링 및 최적화",
                personality: "논리적, 구조적 사고, 성능 중시, 분석적",
                capabilities: ["Firestore", "데이터 모델링", "쿼리 최적화", "스키마 설계", "데이터 분석"],
                workspace: "./modules/module4",
                active: false,
                specialization: "Claude 3.5 Sonnet으로 데이터 구조 설계 및 분석 최적화"
            },
            module5: {
                name: "AI 통합 엔지니어",
                ai_provider: "gemini",
                model: "gemini-1.5-pro-latest",
                role: "AI 서비스 통합 및 구현",
                personality: "혁신적, 실험적, 기술 트렌드 민감, 창의적",
                capabilities: ["Gemini AI API", "Claude API", "프롬프트 엔지니어링", "ML 파이프라인", "AI 워크플로우"],
                workspace: "./modules/module5",
                active: false,
                specialization: "Gemini 1.5 Pro로 AI API 통합 및 기술 구현 최적화"
            },
            module6: {
                name: "DevOps 시스템 엔지니어",
                ai_provider: "anthropic",
                model: "claude-3-5-sonnet-20241022", 
                role: "인프라 및 배포 관리",
                personality: "안정성 우선, 자동화 선호, 모니터링 중시, 체계적",
                capabilities: ["GCP", "Firebase", "CI/CD", "모니터링", "보안", "인프라 설계"],
                workspace: "./modules/module6",
                active: false,
                specialization: "Claude 3.5 Sonnet으로 인프라 설계 및 시스템 분석 최적화"
            }
        };
        
        // 실행 상태
        this.activeConversations = new Map();
        this.taskQueue = [];
        this.executionHistory = [];
        this.monitoringInterval = null;
    }

    async start() {
        console.log(`🎖️ CSO 작전담당관 - ${this.systemName} 시작`);
        console.log(`⚡ 실제 AI API 기반 완전 자율 에이전트 시스템`);
        
        this.isRunning = true;
        
        console.log(`🤖 ${this.systemName} v${this.version} 초기화 완료`);
        console.log(`🎯 AI 에이전트 ${Object.keys(this.agents).length}개 준비됨`);
        
        // 1. ARGO 에이전트 활성화 (메인 아키텍트)
        await this.activateAgent('module1');
        
        // 2. 수동 제어 모드 시작
        this.startControlMode();
        
        // 3. 실시간 모니터링 시작
        this.startRealtimeMonitoring();
        
        console.log(`✅ ${this.systemName} 완전 가동!`);
    }

    async activateAgent(agentId) {
        const agent = this.agents[agentId];
        if (!agent) {
            console.log(`❌ 알 수 없는 에이전트: ${agentId}`);
            return;
        }

        console.log(`🤖 에이전트 활성화: ${agent.name}`);
        
        // 에이전트 활성화
        agent.active = true;
        
        // 대화 세션 시작
        const conversation = {
            agentId: agentId,
            messages: [],
            startTime: new Date(),
            lastActivity: new Date(),
            taskProgress: 0,
            currentTask: null
        };
        
        this.activeConversations.set(agentId, conversation);
        
        // 초기 시스템 프롬프트 생성
        const systemPrompt = this.generateSystemPrompt(agent);
        
        try {
            const response = await this.sendToAI(agentId, systemPrompt);
            console.log(`💬 ${agent.name} 응답:`, response.substring(0, 100) + '...');
            
            // 대화 히스토리에 추가
            conversation.messages.push(
                { role: 'user', content: systemPrompt },
                { role: 'assistant', content: response }
            );
            
            // 로그 기록
            await this.logAgentActivity(agentId, 'activation', response);
            
        } catch (error) {
            console.error(`❌ ${agent.name} 활성화 실패:`, error.message);
        }
    }

    generateSystemPrompt(agent) {
        return `
🎖️ CSO 작전 환경 - INESS 프로젝트 

당신은 ${agent.name}입니다.

**역할**: ${agent.role}
**성격**: ${agent.personality}
**전문 분야**: ${agent.capabilities.join(', ')}
**특화**: ${agent.specialization}

**프로젝트 개요**:
- 심리 건강 모바일 앱 "마음로그"
- React Native + Firebase + AI 통합
- 6개 AI 모듈 협업 개발 체계

**현재 상황**:
- 개발 환경 구축 완료
- Notion 통합 워크플로우 가동
- Phase 2: 실제 개발 단계 진입

**지시사항**:
1. 당신의 전문 분야에 맞는 작업 계획을 수립하세요
2. 다른 모듈과의 협업이 필요한 부분을 식별하세요
3. 구체적이고 실행 가능한 첫 번째 작업을 제안하세요

지금부터 ${agent.role} 역할을 시작해주세요. 
첫 번째로 현재 상황을 파악하고 다음 작업 계획을 세워주세요.
`;
    }

    async sendToAI(agentId, message, conversation = []) {
        const agent = this.agents[agentId];
        
        try {
            let response;
            
            if (agent.ai_provider === 'gemini') {
                const model = this.gemini.getGenerativeModel({ 
                    model: agent.model,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2000,
                    }
                });
                
                // Gemini는 대화 형식이 다르므로 변환
                const chatHistory = conversation.map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }));
                
                const chat = model.startChat({ history: chatHistory });
                const result = await chat.sendMessage(message);
                response = result.response.text();
                
            } else if (agent.ai_provider === 'anthropic') {
                const completion = await this.anthropic.messages.create({
                    model: agent.model,
                    max_tokens: 2000,
                    temperature: 0.7,
                    messages: [
                        ...conversation,
                        { role: 'user', content: message }
                    ]
                });
                response = completion.content[0].text;
            }
            
            return response;
            
        } catch (error) {
            console.error(`❌ AI API 호출 실패 (${agentId}):`, error.message);
            return `죄송합니다. 현재 AI 서비스에 연결할 수 없습니다. 잠시 후 다시 시도하겠습니다.`;
        }
    }

    async getProjectContext() {
        try {
            // 현재 프로젝트 상태 수집
            const gitStatus = await this.executeCommand('git status --porcelain');
            const packageJson = await fs.readFile('./package.json', 'utf8').catch(() => '{}');
            const projectStructure = await this.getDirectoryStructure('./');
            
            return `
**현재 프로젝트 상태**:
- Git 상태: ${gitStatus.stdout || 'Clean working tree'}
- 활성 에이전트: ${this.activeConversations.size}개
- 진행 중인 작업: ${this.taskQueue.length}개
- 프로젝트 구조: ${projectStructure}
`;
        } catch (error) {
            return "프로젝트 초기 단계 - 상세 정보 수집 중";
        }
    }

    startControlMode() {
        console.log('🎮 수동 제어 모드 시작');
        console.log('✅ 진짜 자동화 시스템 대기 상태!');
        console.log('🎖️ ARGO가 명령을 기다립니다');
        console.log('');
        console.log('📝 사용 가능한 명령어:');
        console.log('  • activateAgent <module2|module3|module4|module5|module6>');
        console.log('  • assignTask <agentId> <task description>');
        console.log('  • getStatus - 현재 상태 확인'); 
        console.log('  • help - 도움말 표시');
        console.log('  • exit - 시스템 종료');
        console.log('');
        console.log('💡 명령어를 입력하세요 (또는 Ctrl+C로 종료):');
        
        // 사용자 입력 대기
        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', () => {
            const chunk = process.stdin.read();
            if (chunk !== null) {
                this.processUserCommand(chunk.trim());
            }
        });
        
        process.on('SIGINT', () => {
            console.log('\n🛑 시스템 종료 중...');
            this.stop();
            process.exit(0);
        });
    }
    
    async processUserCommand(command) {
        if (!command) return;
        
        const [cmd, ...args] = command.split(' ');
        
        try {
            switch (cmd.toLowerCase()) {
                case 'activateagent':
                    if (args[0]) {
                        await this.activateAgent(args[0]);
                    } else {
                        console.log('❌ 사용법: activateAgent <agentId>');
                    }
                    break;
                    
                case 'assigntask':
                    if (args.length >= 2) {
                        const agentId = args[0];
                        const task = args.slice(1).join(' ');
                        await this.assignTaskToAgent(agentId, task);
                    } else {
                        console.log('❌ 사용법: assignTask <agentId> <task description>');
                    }
                    break;
                    
                case 'getstatus':
                    await this.displaySystemStatus();
                    break;
                    
                case 'help':
                    console.log('\n📖 도움말:');
                    console.log('  activateAgent - AI 에이전트 활성화');
                    console.log('  assignTask - 특정 작업 할당');
                    console.log('  getStatus - 시스템 현재 상태 확인');
                    console.log('  exit - 시스템 종료\n');
                    break;
                    
                case 'exit':
                    await this.stop();
                    process.exit(0);
                    break;
                    
                default:
                    console.log(`❓ 알 수 없는 명령어: ${cmd}`);
                    console.log('💡 "help" 명령어로 사용법을 확인하세요');
            }
        } catch (error) {
            console.error('❌ 명령 처리 오류:', error.message);
        }
        
        console.log('\n💡 다음 명령어를 입력하세요:');
    }

    async executeAutomationCycle() {
        console.log(`🎯 자동화 사이클 실행 중...`);
        
        for (const [agentId, conversation] of this.activeConversations) {
            const agent = this.agents[agentId];
            
            // 에이전트가 너무 오래 비활성 상태면 활성화
            const timeSinceLastActivity = Date.now() - conversation.lastActivity.getTime();
            if (timeSinceLastActivity > 10 * 60 * 1000) { // 10분
                await this.reactivateAgent(agentId);
            }
            
            // 진행 상황 체크 및 다음 작업 지시
            await this.checkAgentProgress(agentId);
        }
        
        // 상태 모니터링
        if (this.executionHistory.length > 0) {
            console.log(`📊 시스템 상태: 활성 에이전트 ${this.activeConversations.size}개, 대기 작업 ${this.taskQueue.length}개`);
        }
    }

    async assignTaskToAgent(agentId, taskDescription) {
        const agent = this.agents[agentId];
        const conversation = this.activeConversations.get(agentId);
        
        if (!agent || !conversation) {
            console.log(`❌ 에이전트 ${agentId}가 활성화되지 않았습니다. 먼저 activateAgent ${agentId}를 실행하세요.`);
            return;
        }

        console.log(`📋 작업 할당: ${agent.name} → ${taskDescription}`);
        
        const taskPrompt = `
🎯 새로운 작업 할당:
${taskDescription}

다음을 포함한 상세한 계획을 세워주세요:
1. 작업 분석 및 이해
2. 구체적인 실행 단계
3. 필요한 리소스 및 의존성
4. 예상 소요 시간
5. 완료 기준

작업을 시작하겠습니다.
`;

        try {
            const response = await this.sendToAI(agentId, taskPrompt, conversation.messages);
            
            // 대화 히스토리 업데이트
            conversation.messages.push(
                { role: 'user', content: taskPrompt },
                { role: 'assistant', content: response }
            );
            conversation.lastActivity = new Date();
            conversation.currentTask = taskDescription;
            
            console.log(`💬 ${agent.name} 응답:`, response.substring(0, 200) + '...');
            
            // 로그 기록
            await this.logAgentActivity(agentId, 'task_assignment', `Task: ${taskDescription}\nResponse: ${response}`);
            
        } catch (error) {
            console.error(`❌ 작업 할당 실패 (${agentId}):`, error.message);
        }
    }

    async reactivateAgent(agentId) {
        const agent = this.agents[agentId];
        const conversation = this.activeConversations.get(agentId);
        
        console.log(`🔄 에이전트 재활성화: ${agent.name}`);
        
        const statusRequest = `
현재 작업 상황을 보고해주세요.
- 진행 중인 작업이 있나요?
- 완료된 작업이 있나요? 
- 다른 에이전트의 도움이 필요한가요?
- 다음에 할 작업은 무엇인가요?

구체적이고 실행 가능한 계획을 제시해주세요.
`;
        
        await this.sendMessageToAgent(agentId, statusRequest);
    }

    async assignTaskToAgent(agentId) {
        const agent = this.agents[agentId];
        
        // 역할별 작업 할당
        const taskTemplates = {
            module2: [
                "React Native 프로젝트 구조를 설정하고 기본 컴포넌트를 생성해주세요",
                "회원가입 화면 UI를 디자인하고 구현해주세요",
                "폼 유효성 검사 로직을 추가해주세요"
            ],
            module3: [
                "Firebase Functions 프로젝트를 초기화해주세요",
                "회원가입 API 엔드포인트를 구현해주세요",
                "JWT 토큰 인증 시스템을 구축해주세요"
            ],
            module4: [
                "사용자 데이터베이스 스키마를 설계해주세요",
                "Firestore 보안 규칙을 작성해주세요", 
                "데이터 검증 로직을 구현해주세요"
            ],
            module5: [
                "신규 사용자를 위한 AI 웰컴 메시지를 생성해주세요",
                "사용자 온보딩 AI 가이드를 구현해주세요",
                "스팸 가입 감지 AI 시스템을 만들어주세요"
            ],
            module6: [
                "Firebase 프로젝트를 설정하고 환경을 구축해주세요",
                "CI/CD 파이프라인을 구성해주세요",
                "모니터링 및 로깅 시스템을 설정해주세요"
            ]
        };
        
        const tasks = taskTemplates[agentId];
        if (tasks && tasks.length > 0) {
            const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
            await this.sendMessageToAgent(agentId, `
🎯 새로운 작업 할당:
${randomTask}

구체적인 구현 계획과 함께 작업을 시작해주세요.
필요하다면 다른 모듈과의 협업 방안도 제안해주세요.
`);
        }
    }

    async checkAgentProgress(agentId) {
        const conversation = this.activeConversations.get(agentId);
        if (!conversation || !conversation.currentTask) return;
        
        // 15분마다 진행 상황 체크
        const timeSinceLastCheck = Date.now() - conversation.lastActivity.getTime();
        if (timeSinceLastCheck > 15 * 60 * 1000) {
            await this.sendMessageToAgent(agentId, `
진행 상황을 업데이트해주세요:
- 현재 작업: ${conversation.currentTask}
- 완료율: ?%
- 현재 진행 중인 단계는?
- 어려움이나 블로커가 있나요?
- 다음 단계 계획은?
`);
        }
    }

    async sendMessageToAgent(agentId, message) {
        const conversation = this.activeConversations.get(agentId);
        if (!conversation) return;
        
        try {
            const response = await this.sendToAI(agentId, message, conversation.messages);
            
            // 대화 히스토리 업데이트
            conversation.messages.push(
                { role: 'user', content: message },
                { role: 'assistant', content: response }
            );
            conversation.lastActivity = new Date();
            
            console.log(`💬 ${this.agents[agentId].name}:`, response.substring(0, 150) + '...');
            
            // 로그 기록
            await this.logAgentActivity(agentId, 'communication', response);
            
        } catch (error) {
            console.error(`❌ 메시지 전송 실패 (${agentId}):`, error.message);
        }
    }

    async facilitateAgentCollaboration() {
        // 활성 에이전트들 간의 협업 촉진
        const activeAgents = Array.from(this.activeConversations.keys());
        
        if (activeAgents.length > 1) {
            console.log(`🤝 에이전트 간 협업 체크: ${activeAgents.length}개 에이전트`);
            
            // 각 에이전트에게 다른 에이전트와의 협업 필요성 확인
            for (const agentId of activeAgents) {
                await this.sendMessageToAgent(agentId, `
다른 팀원들과의 협업이 필요한 부분이 있나요?
현재 활성 팀원: ${activeAgents.map(id => this.agents[id].name).join(', ')}

협업이 필요하다면:
1. 어떤 팀원과 협업이 필요한지
2. 무엇에 대해 협업이 필요한지  
3. 어떤 형태의 협업인지 (정보 공유, 공동 작업, 의존성 해결 등)

명확하게 설명해주세요.
`);
            }
        }
    }

    startRealtimeMonitoring() {
        // 5분마다 전체 시스템 상태 모니터링
        this.monitoringInterval = setInterval(async () => {
            if (!this.isRunning) return;
            
            await this.displaySystemStatus();
        }, 5 * 60 * 1000);
    }

    async displaySystemStatus() {
        console.log('\n============================================');
        console.log(`🎖️ ${this.systemName} 상태 보고`);
        console.log(`⏰ 시간: ${new Date().toLocaleString()}`);
        console.log(`🎯 활성 에이전트: ${this.activeConversations.size}개`);
        
        for (const [agentId, conversation] of this.activeConversations) {
            const agent = this.agents[agentId];
            const lastActivity = Math.floor((Date.now() - conversation.lastActivity.getTime()) / 1000 / 60);
            console.log(`  🤖 ${agent.name}: ${lastActivity}분 전 활동, 진행률 ${conversation.taskProgress}%`);
        }
        
        console.log(`📊 총 실행 기록: ${this.executionHistory.length}개`);
        console.log(`============================================\n`);
    }

    async executeCommand(command) {
        return new Promise((resolve, reject) => {
            const process = spawn('sh', ['-c', command], {
                cwd: process.cwd(),
                stdio: 'pipe'
            });
            
            let stdout = '';
            let stderr = '';
            
            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            process.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout, stderr });
                } else {
                    reject(new Error(`Command failed: ${stderr}`));
                }
            });
        });
    }

    async logAgentActivity(agentId, activityType, details) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            agentId: agentId,
            agentName: this.agents[agentId].name,
            activityType: activityType,
            details: details.substring(0, 500) // 처음 500자만 저장
        };
        
        this.executionHistory.push(logEntry);
        
        // 로그 파일에도 저장
        const logFile = './logs/ai-agent-activity.json';
        try {
            await fs.mkdir('./logs', { recursive: true });
            let logs = [];
            try {
                const existing = await fs.readFile(logFile, 'utf8');
                logs = JSON.parse(existing);
            } catch (e) {
                // 파일이 없으면 새로 생성
            }
            logs.push(logEntry);
            await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('로그 저장 실패:', error.message);
        }
    }

    async stop() {
        console.log(`🛑 ${this.systemName} 종료 중...`);
        this.isRunning = false;
        
        // 모든 활성 대화 종료
        for (const [agentId] of this.activeConversations) {
            await this.sendMessageToAgent(agentId, "시스템이 종료됩니다. 현재 작업을 정리하고 상태를 저장해주세요.");
        }
        
        this.activeConversations.clear();
        console.log(`✅ ${this.systemName} 완전 종료`);
    }
}

// 글로벌 인스턴스
let realAISystem = null;

// 시작 함수
async function startRealAutomation() {
    if (realAISystem && realAISystem.isRunning) {
        console.log("⚠️ 진짜 자동화 시스템이 이미 실행 중입니다.");
        return realAISystem;
    }
    
    realAISystem = new RealAIAgentSystem();
    await realAISystem.start();
    return realAISystem;
}

// 종료 함수
async function stopRealAutomation() {
    if (realAISystem && realAISystem.isRunning) {
        await realAISystem.stop();
        realAISystem = null;
    }
}

// 메인 실행부
if (require.main === module) {
    startRealAutomation().catch(console.error);
}

module.exports = {
    RealAIAgentSystem,
    startRealAutomation,
    stopRealAutomation
};