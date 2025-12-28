/**
 * 个人资料编辑页面
 * 用户可以编辑姓名和修改密码
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/useAuthStore";
import { PasswordStrength } from "@/components/auth/PasswordStrength";

// 个人信息表单
const profileSchema = z.object({
  name: z.string().min(2, "姓名至少2个字符").max(50, "姓名最多50个字符"),
});

type ProfileForm = z.infer<typeof profileSchema>;

// 修改密码表单
const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "请输入当前密码"),
    newPassword: z
      .string()
      .min(8, "密码至少8个字符")
      .regex(/[A-Z]/, "密码必须包含大写字母")
      .regex(/[a-z]/, "密码必须包含小写字母")
      .regex(/\d/, "密码必须包含数字")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "密码必须包含特殊字符"),
    confirmPassword: z.string().min(1, "请确认新密码"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "新密码不能与旧密码相同",
    path: ["newPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword, isLoading, error, clearError } =
    useAuthStore();

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 个人信息表单
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  // 修改密码表单
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const newPassword = passwordForm.watch("newPassword", "");

  const onProfileSubmit = async (data: ProfileForm) => {
    clearError();
    setSuccessMessage(null);

    try {
      await updateProfile(data);
      setSuccessMessage("个人信息更新成功");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("更新失败:", error);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    clearError();
    setSuccessMessage(null);

    try {
      await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      setSuccessMessage("密码修改成功");
      passwordForm.reset();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("修改密码失败:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 导航栏 */}
      <div className="h-14 flex items-center justify-between px-4 bg-surface border-b border-divider">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
        <h1 className="text-lg font-semibold text-text-primary">编辑资料</h1>
        <div className="w-16" /> {/* 占位，保持标题居中 */}
      </div>

      {/* 标签切换 */}
      <div className="flex bg-surface border-b border-divider">
        <button
          onClick={() => {
            setActiveTab("profile");
            clearError();
            setSuccessMessage(null);
          }}
          className={`flex-1 h-12 text-sm font-medium transition-colors ${
            activeTab === "profile"
              ? "text-primary border-b-2 border-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          个人信息
        </button>
        <button
          onClick={() => {
            setActiveTab("password");
            clearError();
            setSuccessMessage(null);
          }}
          className={`flex-1 h-12 text-sm font-medium transition-colors ${
            activeTab === "password"
              ? "text-primary border-b-2 border-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          修改密码
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {/* 成功提示 */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* 个人信息表单 */}
        {activeTab === "profile" && (
          <form
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className="space-y-4"
          >
            {/* 邮箱（只读） */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-text-tertiary cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-text-tertiary mt-1 ml-1">
                邮箱地址不可修改
              </p>
            </div>

            {/* 姓名 */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                姓名
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  {...profileForm.register("name")}
                  type="text"
                  placeholder="请输入姓名"
                  disabled={isLoading}
                  className="w-full h-12 pl-12 pr-4 bg-surface border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {profileForm.formState.errors.name && (
                <p className="text-sm text-error mt-1 ml-1">
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "保存中..." : "保存修改"}
            </button>
          </form>
        )}

        {/* 修改密码表单 */}
        {activeTab === "password" && (
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-4"
          >
            {/* 当前密码 */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                当前密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  {...passwordForm.register("oldPassword")}
                  type={showOldPassword ? "text" : "password"}
                  placeholder="请输入当前密码"
                  disabled={isLoading}
                  className="w-full h-12 pl-12 pr-12 bg-surface border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary disabled:opacity-50"
                >
                  {showOldPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordForm.formState.errors.oldPassword && (
                <p className="text-sm text-error mt-1 ml-1">
                  {passwordForm.formState.errors.oldPassword.message}
                </p>
              )}
            </div>

            {/* 新密码 */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                新密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  {...passwordForm.register("newPassword")}
                  type={showNewPassword ? "text" : "password"}
                  placeholder="请输入新密码"
                  disabled={isLoading}
                  className="w-full h-12 pl-12 pr-12 bg-surface border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary disabled:opacity-50"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-error mt-1 ml-1">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
              {/* 密码强度指示器 */}
              {newPassword && (
                <div className="mt-3 p-3 bg-surface rounded-lg">
                  <PasswordStrength password={newPassword} />
                </div>
              )}
            </div>

            {/* 确认新密码 */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                确认新密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  {...passwordForm.register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="请再次输入新密码"
                  disabled={isLoading}
                  className="w-full h-12 pl-12 pr-12 bg-surface border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary disabled:opacity-50"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-error mt-1 ml-1">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* 提示信息 */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-xs text-yellow-800">
                ⚠️
                修改密码后，您将在所有设备上退出登录，需要使用新密码重新登录。
              </p>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "修改中..." : "修改密码"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileEditPage;
