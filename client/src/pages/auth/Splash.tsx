/**
 * 启动页 (Splash Screen)
 * 根据 UI_DESIGN_SPEC.md 设计
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const SplashPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // 检查是否是首次使用
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    const isLoggedIn = localStorage.getItem('token')

    const timer = setTimeout(() => {
      if (!hasSeenOnboarding) {
        navigate('/onboarding')
      } else if (isLoggedIn) {
        navigate('/')
      } else {
        navigate('/auth/login')
      }
    }, 2000) // 停留2秒

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-secondary flex flex-col items-center justify-center text-white">
      {/* Logo */}
      <div className="mb-8 animate-pulse">
        <div className="w-32 h-32 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
          <span className="text-6xl">📚</span>
        </div>
      </div>

      {/* 品牌名 */}
      <h1 className="text-4xl font-bold mb-2">LingYu</h1>
      
      {/* Slogan */}
      <p className="text-sm font-light opacity-90 mb-12">智能语言学习助手</p>

      {/* 加载动画 */}
      <div className="flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">加载中...</span>
      </div>
    </div>
  )
}

export default SplashPage
