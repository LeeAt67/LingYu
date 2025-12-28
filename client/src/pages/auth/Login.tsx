/**
 * 登录页
 * 根据 UI_DESIGN_SPEC.md 设计
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/useAuthStore";

const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "密码不能为空"),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    clearError();
    try {
      await login(data);
      navigate("/");
    } catch (error) {
      // 错误已经在 store 中处理
      console.error("登录失败:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <div className="h-14 flex items-center px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
            <span className="text-4xl">📚</span>
          </div>
        </div>

        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            欢迎回来 👋
          </h1>
          <p className="text-sm text-text-secondary">登录继续你的学习之旅</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-error">{error}</p>
            </div>
          </div>
        )}

        {/* 表单 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 邮箱 */}
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <input
                {...register("email")}
                type="email"
                placeholder="邮箱地址"
                disabled={isLoading}
                className="w-full h-12 pl-12 pr-4 bg-surface border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-error mt-1 ml-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* 密码 */}
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="密码"
                disabled={isLoading}
                className="w-full h-12 pl-12 pr-12 bg-surface border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-error mt-1 ml-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* 忘记密码 */}
          <div className="flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-primary hover:text-primary-dark"
            >
              忘记密码?
            </Link>
          </div>

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "登录中..." : "登 录 🚀"}
          </button>
        </form>

        {/* 分隔线 */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-divider" />
          <span className="text-sm text-text-tertiary">或</span>
          <div className="flex-1 h-px bg-divider" />
        </div>

        {/* 第三方登录 */}
        <div className="space-y-3">
          <button
            disabled={isLoading}
            className="w-full h-12 bg-surface border border-border rounded-xl flex items-center justify-center gap-2 hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">🍎</span>
            <span className="text-text-primary font-medium">Apple登录</span>
          </button>
          <button
            disabled={isLoading}
            className="w-full h-12 bg-surface border border-border rounded-xl flex items-center justify-center gap-2 hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">📱</span>
            <span className="text-text-primary font-medium">微信登录</span>
          </button>
        </div>

        {/* 注册链接 */}
        <div className="text-center mt-6">
          <span className="text-sm text-text-secondary">还没有账号? </span>
          <Link
            to="/auth/register"
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            立即注册
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
