/**
 * 忘记密码页面
 * 用户请求密码重置
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/api/auth";

const forgotPasswordSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.requestPasswordReset(data.email);
      setSuccess(true);
      // 开发环境下显示重置令牌（生产环境应该通过邮件发送）
      if (response.resetToken) {
        setResetToken(response.resetToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "请求失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* 导航栏 */}
        <div className="h-14 flex items-center px-4">
          <button
            onClick={() => navigate("/auth/login")}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回登录</span>
          </button>
        </div>

        {/* 成功提示 */}
        <div className="flex-1 px-6 pb-8 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-2">
            邮件已发送 ✉️
          </h1>
          <p className="text-sm text-text-secondary text-center mb-6 max-w-sm">
            我们已向您的邮箱发送了密码重置链接，请查收邮件并按照说明操作。
          </p>

          {/* 开发环境：显示重置令牌 */}
          {resetToken && (
            <div className="w-full max-w-md mb-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-xs text-yellow-800 font-medium mb-2">
                  开发模式 - 重置令牌：
                </p>
                <div className="p-2 bg-white rounded border border-yellow-300">
                  <code className="text-xs text-yellow-900 break-all">
                    {resetToken}
                  </code>
                </div>
                <p className="text-xs text-yellow-700 mt-2">
                  生产环境下，此令牌将通过邮件发送
                </p>
                <Link
                  to={`/auth/reset-password?token=${resetToken}`}
                  className="mt-3 block text-center text-sm text-primary hover:text-primary-dark font-medium"
                >
                  点击这里直接重置密码 →
                </Link>
              </div>
            </div>
          )}

          <div className="space-y-3 w-full max-w-md">
            <button
              onClick={() => navigate("/auth/login")}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow"
            >
              返回登录
            </button>

            <button
              onClick={() => {
                setSuccess(false);
                setResetToken(null);
              }}
              className="w-full h-12 bg-surface border border-border rounded-xl text-text-primary font-medium hover:bg-background transition-colors"
            >
              重新发送
            </button>
          </div>

          <p className="text-xs text-text-tertiary mt-6 text-center">
            没有收到邮件？请检查垃圾邮件文件夹
          </p>
        </div>
      </div>
    );
  }

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
            <span className="text-4xl">🔑</span>
          </div>
        </div>

        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            忘记密码？
          </h1>
          <p className="text-sm text-text-secondary">
            输入您的邮箱地址，我们将发送重置链接
          </p>
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

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "发送中..." : "发送重置链接 📧"}
          </button>
        </form>

        {/* 提示信息 */}
        <div className="mt-6 p-4 bg-surface rounded-xl">
          <p className="text-xs text-text-secondary">
            💡 提示：重置链接将在1小时后过期，请及时使用。
          </p>
        </div>

        {/* 返回登录 */}
        <div className="text-center mt-6">
          <span className="text-sm text-text-secondary">记起密码了? </span>
          <Link
            to="/auth/login"
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            返回登录
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
