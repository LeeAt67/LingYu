/**
 * 注册页
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const registerSchema = z.object({
  username: z.string().min(2, '用户名至少2位'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位').max(20, '密码最多20位'),
})

type RegisterForm = z.infer<typeof registerSchema>

const RegisterPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password', '')
  
  // 密码强度计算
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: '' }
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    
    if (strength <= 2) return { level: 2, text: '弱' }
    if (strength <= 3) return { level: 3, text: '中' }
    return { level: 5, text: '强' }
  }

  const strength = getPasswordStrength()

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      console.log('注册数据:', data)
      await new Promise(resolve => setTimeout(resolve, 1000))
      navigate('/auth/login')
    } catch (error) {
      console.error('注册失败:', error)
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

      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            创建账号 ✨
          </h1>
          <p className="text-sm text-text-secondary">
            开启你的学习之旅
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <input
                {...register('username')}
                type="text"
                placeholder="用户名"
                className="w-full h-12 pl-12 pr-4 bg-surface border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            {errors.username && (
              <p className="text-sm text-error mt-1 ml-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <input
                {...register('email')}
                type="email"
                placeholder="邮箱地址"
                className="w-full h-12 pl-12 pr-4 bg-surface border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-error mt-1 ml-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="密码 (6-20位)"
                className="w-full h-12 pl-12 pr-12 bg-surface border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && (
              <div className="flex items-center gap-2 mt-2 ml-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-6 h-1 rounded-full ${
                        i <= strength.level ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-text-secondary">
                  密码强度: {strength.text}
                </span>
              </div>
            )}
            {errors.password && (
              <p className="text-sm text-error mt-1 ml-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '注册中...' : '注 册 🚀'}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-sm text-text-secondary">已有账号? </span>
          <Link
            to="/auth/login"
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            立即登录
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
