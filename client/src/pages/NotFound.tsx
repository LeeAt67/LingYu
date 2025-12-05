/**
 * 404页面
 */
import { useNavigate } from 'react-router-dom'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-text-primary mb-2">页面未找到</h2>
        <p className="text-text-secondary mb-8">抱歉,您访问的页面不存在</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow"
        >
          返回首页
        </button>
      </div>
    </div>
  )
}

export default NotFoundPage
