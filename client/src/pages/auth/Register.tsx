/**
 * 注册页面 - Web 桌面端版本
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const registerSchema = z
  .object({
    email: z.string().email("请输入有效的邮箱地址"),
    name: z.string().min(2, "姓名至少2个字符").max(50, "姓名最多50个字符"),
    password: z
      .string()
      .min(8, "密码至少8个字符")
      .regex(/[A-Z]/, "密码必须包含大写字母")
      .regex(/[a-z]/, "密码必须包含小写字母")
      .regex(/\d/, "密码必须包含数字"),
    confirmPassword: z.string().min(1, "请确认密码"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register: registerUser,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    clearError();
    try {
      await registerUser({
        email: data.email,
        name: data.name,
        password: data.password,
      });
      navigate("/");
    } catch (error) {
      console.error("注册失败:", error);
    }
  };

  return (
    <div className="h-screen bg-white flex items-center justify-center p-8 overflow-hidden">
      <div className="w-full max-w-md">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">创建账号</h1>
          <p className="text-gray-600">开始使用 Neo</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 注册表单 */}
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

          {/* 姓名 */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              姓名
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                {...register("name")}
                type="text"
                placeholder="你的姓名"
                disabled={isLoading}
                className="pl-10 h-11 border-gray-200"
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
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
                placeholder="至少8个字符"
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

          {/* 确认密码 */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              确认密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="再次输入密码"
                disabled={isLoading}
                className="pl-10 pr-10 h-11 border-gray-200"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* 注册按钮 */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-black hover:bg-gray-800 text-white mt-6"
          >
            {isLoading ? "注册中..." : "注册"}
          </Button>
        </form>

        {/* 用户协议 */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            注册即表示同意用户协议和隐私政策
          </p>
        </div>

        {/* 登录链接 */}
        <div className="text-center mt-6">
          <span className="text-sm text-gray-600">已有账号？</span>
          <Link
            to="/auth/login"
            className="text-sm text-black hover:underline font-medium ml-1"
          >
            立即登录
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
