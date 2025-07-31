import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">소개</h1>
        <p className="text-xl text-gray-600">
          INESS 프로젝트의 Module2 Frontend Agent에 대해 알아보세요
        </p>
      </motion.div>

      <div className="space-y-12">
        {/* Module2 소개 */}
        <motion.section
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎨 Module2 - Frontend Agent
          </h2>
          <p className="text-gray-600 mb-6">
            Module2는 INESS 프로젝트의 프론트엔드 개발을 전담하는 AI 에이전트입니다.
            사용자 중심의 인터페이스 개발과 최적의 사용자 경험 제공을 목표로 합니다.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">주요 책임</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• React 컴포넌트 개발 및 최적화</li>
                <li>• UI/UX 디자인 구현</li>
                <li>• 반응형 웹 디자인</li>
                <li>• 성능 최적화</li>
                <li>• 접근성 (a11y) 구현</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">기술 특화</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• 상태 관리 (Redux, Zustand)</li>
                <li>• CSS/SCSS 스타일링</li>
                <li>• 애니메이션 및 인터랙션</li>
                <li>• PWA 기능 구현</li>
                <li>• 테스팅 (Jest, RTL)</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* INESS 프로젝트 소개 */}
        <motion.section
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🚀 INESS 프로젝트
          </h2>
          <p className="text-gray-600 mb-6">
            INESS는 AI 에이전트들이 협업하여 자동으로 소프트웨어를 개발하는 
            혁신적인 프로젝트입니다. 각 모듈이 전문화된 역할을 담당하며, 
            효율적이고 고품질의 애플리케이션을 만들어냅니다.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modules.map((module, index) => (
              <motion.div
                key={module.name}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className={`p-4 rounded-lg border-2 ${
                  module.name === 'Module2' 
                    ? 'border-primary-200 bg-primary-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">{module.icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {module.name}
                </h3>
                <p className="text-gray-600 text-xs">{module.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 개발 워크플로우 */}
        <motion.section
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="card p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ⚡ 개발 워크플로우
          </h2>
          <div className="space-y-4">
            {workflow.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}

const modules = [
  { name: 'Module1', icon: '🏗️', role: 'ARGO 메인 아키텍트' },
  { name: 'Module2', icon: '🎨', role: 'Frontend 개발 마스터' },
  { name: 'Module3', icon: '⚙️', role: 'Backend 아키텍트' },
  { name: 'Module4', icon: '🗄️', role: '데이터베이스 설계자' },
  { name: 'Module5', icon: '🤖', role: 'AI 통합 엔지니어' },
  { name: 'Module6', icon: '☁️', role: 'DevOps 엔지니어' },
]

const workflow = [
  {
    title: '요구사항 분석',
    description: '와이어프레임 및 디자인 검토를 통한 요구사항 파악'
  },
  {
    title: '아키텍처 설계',
    description: '컴포넌트 구조 및 상태 관리 계획 수립'
  },
  {
    title: '컴포넌트 개발',
    description: '재사용 가능한 React 컴포넌트 구현'
  },
  {
    title: '테스팅',
    description: '단위/통합 테스트 작성 및 품질 보증'
  },
  {
    title: '최적화',
    description: '성능 및 접근성 개선 작업'
  },
  {
    title: '문서화',
    description: '컴포넌트 문서 및 스타일가이드 업데이트'
  }
]