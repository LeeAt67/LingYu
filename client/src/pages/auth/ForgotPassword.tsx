/**
 * 忘记密码页面 - Web 桌面端版本
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      // TODO: 调用忘记密码 API
      // await authApi.forgotPassword(data.email);

      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setEmailSent(true);
      toast({
        title: "邮件已发送",
        description: "请查收重置密码邮件",
      });
    } catch (error) {
      toast({
        title: "发送失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">邮件已发送</h1>
          <p className="text-gray-600 mb-8">
            我们已向您的邮箱发送了重置密码链接，请查收邮件并按照说明操作。
          </p>
          <Button
            onClick={() => navigate("/auth/login")}
            className="w-full h-11 bg-black hover:bg-gray-800 text-white"
          >
            返回登录
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate("/auth/login")}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回登录</span>
        </button>

        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">忘记密码</h1>
          <p className="text-gray-600">
            输入您的邮箱地址，我们将发送重置密码链接
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-black hover:bg-gray-800 text-white"
          >
            {isLoading ? "发送中..." : "发送重置链接"}
          </Button>
        </form>

        {/* 返回登录链接 */}
        <div className="text-center mt-6">
          <span className="text-sm text-gray-600">记起密码了？</span>
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

export default ForgotPasswordPage;
