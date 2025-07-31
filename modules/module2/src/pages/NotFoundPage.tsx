import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mt-4">
            페이지를 찾을 수 없습니다
          </h2>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <p className="text-gray-600 max-w-md mx-auto">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            아래 버튼을 통해 홈페이지로 돌아가세요.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-4"
        >
          <Link
            to="/"
            className="btn btn-primary px-8 py-3 text-lg inline-block"
          >
            홈으로 돌아가기
          </Link>
          
          <div className="text-sm text-gray-500">
            또는{' '}
            <Link to="/about" className="text-primary-600 hover:text-primary-700">
              소개 페이지
            </Link>
            를 확인해보세요
          </div>
        </motion.div>

        {/* 장식적인 요소 */}
        <motion.div
          initial={{ rotate: -10, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-12 text-6xl"
        >
          🚀
        </motion.div>
      </motion.div>
    </div>
  )
}