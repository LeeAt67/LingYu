/**
 * 重置密码页面
 * 用户使用令牌重置密码
 */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/api/auth";
import { PasswordStrength } from "@/components/auth/PasswordStrength";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "密码至少8个字符")
      .regex(/[A-Z]/, "密码必须包含大写字母")
      .regex(/[a-z]/, "密码必须包含小写字母")
      .regex(/\d/, "密码必须包含数字")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "密码必须包含特殊字符"),
    confirmPassword: z.string().min(1, "请确认密码"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password", "");

  useEffect(() => {
    if (!token) {
      setError("重置令牌无效或已过期");
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      setError("重置令牌无效");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await authApi.resetPassword({
        token,
        newPassword: data.password,
      });
      setSuccess(true);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "重置失败，请稍后重试";
      setError(errorMessage);
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
            密码重置成功 🎉
          </h1>
          <p className="text-sm text-text-secondary text-center mb-8 max-w-sm">
            您的密码已成功重置，现在可以使用新密码登录了。
          </p>

          <button
            onClick={() => navigate("/auth/login")}
            className="w-full max-w-md h-12 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow"
          >
            前往登录 🚀
          </button>
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
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
            <span className="text-4xl">🔐</span>
          </div>
        </div>

        {/* 标题 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            重置密码
          </h1>
          <p className="text-sm text-text-secondary">请输入您的新密码</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-error">{error}</p>
              {error.includes("令牌") && (
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-primary hover:text-primary-dark mt-2 inline-block"
                >
                  重新申请重置链接 →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* 表单 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 新密码 */}
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="新密码"
                disabled={isLoading || !token}
                className="w-full h-12 pl-12 pr-12 bg-surface border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || !token}
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
            {/* 密码强度指示器 */}
            {password && (
              <div className="mt-3 p-3 bg-surface rounded-lg">
                <PasswordStrength password={password} />
              </div>
            )}
          </div>

          {/* 确认密码 */}
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="确认新密码"
                disabled={isLoading || !token}
                className="w-full h-12 pl-12 pr-12 bg-surface border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading || !token}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary disabled:opacity-50"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-error mt-1 ml-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "重置中..." : "重置密码 🔐"}
          </button>
        </form>

        {/* 提示信息 */}
        <div className="mt-6 p-4 bg-surface rounded-xl">
          <p className="text-xs text-text-secondary">
            💡 提示：重置成功后，您的所有登录会话将被清除，需要重新登录。
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

export default ResetPasswordPage;
