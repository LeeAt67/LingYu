/**
 * 忘记密码页
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // TODO: 调用重置密码API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSent(true)
    } catch (error) {
      console.error('发送失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-14 flex items-center px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
      </div>

      <div className="flex-1 px-6 pb-8 flex flex-col justify-center">
        {!isSent ? (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                忘记密码?
              </h1>
              <p className="text-sm text-text-secondary">
                输入你的邮箱地址,我们将发送重置链接
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="邮箱地址"
                  required
                  className="w-full h-12 pl-12 pr-4 bg-surface border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '发送中...' : '发送重置链接'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              邮件已发送
            </h2>
            <p className="text-sm text-text-secondary mb-8">
              请检查你的邮箱 {email} 并点击重置链接
            </p>
            <button
              onClick={() => navigate('/auth/login')}
              className="text-primary hover:text-primary-dark font-medium"
            >
              返回登录
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage
