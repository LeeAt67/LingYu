/**
 * 欢迎引导页 (Onboarding)
 * 三屏滑动引导
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, BookOpen, Bot, TrendingUp } from 'lucide-react'

const slides = [
  {
    icon: BookOpen,
    title: '个人知识库管理',
    description: '支持文本、音频、视频\n多种形式的学习内容',
    color: 'from-blue-500 to-purple-500',
  },
  {
    icon: Bot,
    title: 'AI 智能学习助手',
    description: '基于你的知识库提供\n个性化学习建议和答疑',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: TrendingUp,
    title: '学习进度追踪',
    description: '详细的学习统计和\n智能复习提醒系统',
    color: 'from-pink-500 to-red-500',
  },
]

const OnboardingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      // 标记已看过引导页
      localStorage.setItem('hasSeenOnboarding', 'true')
      navigate('/auth/login')
    }
  }

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    navigate('/auth/login')
  }

  const slide = slides[currentSlide]
  const Icon = slide.icon

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 跳过按钮 */}
      {currentSlide < slides.length - 1 && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleSkip}
            className="text-sm text-text-secondary hover:text-text-primary px-4 py-2"
          >
            跳过
          </button>
        </div>
      )}

      {/* 指示器 */}
      <div className="flex justify-center gap-2 pt-12 pb-8">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'w-8 bg-primary'
                : 'w-2 bg-border'
            }`}
          />
        ))}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* 图标 */}
        <div className={`w-60 h-60 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center mb-12 shadow-xl`}>
          <Icon className="w-32 h-32 text-white" strokeWidth={1.5} />
        </div>

        {/* 标题 */}
        <h2 className="text-3xl font-bold text-text-primary mb-4">
          {slide.title}
        </h2>

        {/* 描述 */}
        <p className="text-base text-text-secondary whitespace-pre-line leading-relaxed max-w-sm">
          {slide.description}
        </p>
      </div>

      {/* 底部按钮 */}
      <div className="p-8">
        <button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
        >
          {currentSlide < slides.length - 1 ? (
            <>
              下一步
              <ChevronRight className="w-5 h-5" />
            </>
          ) : (
            <>
              开始使用 🚀
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default OnboardingPage
