import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '@components/Layout'
import HomePage from '@pages/HomePage'
import AboutPage from '@pages/AboutPage'
import NotFoundPage from '@pages/NotFoundPage'

function App() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50"
    >
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </motion.div>
  )
}

export default App