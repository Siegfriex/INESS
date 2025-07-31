import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAppStore } from '@store/appStore'

export default function HomePage() {
  const [counter, setCounter] = useState(0)
  const { isLoading, setLoading } = useAppStore()

  const handleAsyncAction = async () => {
    setLoading(true)
    // 시뮬레이션: API 호출
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    setCounter(prev => prev + 1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          INESS{' '}
          <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            Frontend
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Module2 Frontend Agent로 구축된 현대적이고 반응형 웹 애플리케이션입니다.
          React, TypeScript, Vite, Tailwind CSS를 활용하여 최적의 사용자 경험을 제공합니다.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleAsyncAction}
            disabled={isLoading}
            className="btn btn-primary px-8 py-3 text-lg disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                처리 중...
              </>
            ) : (
              '상태 관리 테스트'
            )}
          </button>
          
          <div className="flex items-center justify-center space-x-2">
            <span className="text-gray-600">카운터:</span>
            <motion.span
              key={counter}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-primary-100 text-primary-800 px-3 py-1 rounded-lg font-semibold"
            >
              {counter}
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
            className="card p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Tech Stack */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-8">기술 스택</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {techStack.map((tech, index) => (
            <motion.span
              key={tech}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-100 hover:text-primary-800 transition-colors"
            >
              {tech}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

const features = [
  {
    title: 'React 18+',
    icon: '⚛️',
    description: '최신 React 기능과 Hooks를 활용한 현대적인 컴포넌트 개발'
  },
  {
    title: 'TypeScript',
    icon: '🔷',
    description: '타입 안정성과 개발자 경험을 향상시키는 정적 타입 시스템'
  },
  {
    title: 'Tailwind CSS',
    icon: '🎨',
    description: '유틸리티 우선의 CSS 프레임워크로 빠른 UI 개발'
  }
]

const techStack = [
  'React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion',
  'React Router', 'React Query', 'Zustand', 'React Hook Form', 'Zod'
]