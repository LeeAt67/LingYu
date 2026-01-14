/**
 * 登录页 - Web 桌面端版本
 */
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "密码不能为空"),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
      // 登录成功后跳转到之前访问的页面或默认页面
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("登录失败:", error);
    }
  };

  return (
    <div className="h-screen bg-white flex items-center justify-center p-8 overflow-hidden">
      <div className="w-full max-w-md">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Neo</h1>
          <p className="text-gray-600">登录以继续</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 登录表单 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 邮箱 */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              邮箱
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                {...register("email")}
                type="email"
                placeholder="your@email.com"
                disabled={isLoading}
                className="pl-10 h-11 border-gray-200"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* 密码 */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isLoading}
                className="pl-10 pr-10 h-11 border-gray-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* 忘记密码 */}
          <div className="flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-gray-600 hover:text-black"
            >
              忘记密码？
            </Link>
          </div>

          {/* 登录按钮 */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-black hover:bg-gray-800 text-white"
          >
            {isLoading ? "登录中..." : "登录"}
          </Button>
        </form>

        {/* 注册链接 */}
        <div className="text-center mt-6">
          <span className="text-sm text-gray-600">还没有账号？</span>
          <Link
            to="/auth/register"
            className="text-sm text-black hover:underline font-medium ml-1"
          >
            立即注册
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
