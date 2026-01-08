/**
 * 个人中心页面
 */
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  ChevronRight,
  Palette,
  Settings as SettingsIcon,
  Cog,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-white text-black pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-300">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-medium">个人中心</h1>
        <button
          onClick={() => navigate("/settings/notifications")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Mail className="w-6 h-6" />
        </button>
      </div>

      {/* 用户信息区域 */}
      <div className="flex flex-col items-center mt-8 mb-8">
        {/* 头像 */}
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-500/30">
            {user?.name ? (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl">
                👤
              </div>
            )}
          </div>
        </div>

        {/* 用户名 */}
        <h2 className="text-2xl font-semibold mb-2">
          {user?.name || "67的学习助手"}
        </h2>
      </div>

      {/* 设置选项 */}
      <div className="px-4 space-y-3">
        {/* 外观&沉浸场景 */}
        <button
          onClick={() => navigate("/settings/appearance")}
          className="w-full bg-gray-100 rounded-2xl p-4 border border-gray-300 flex items-center justify-between hover:bg-gray-200 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Palette className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-medium">外观 & 沉浸场景</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>

        {/* 学习设置 */}
        <button
          onClick={() => navigate("/settings/learning")}
          className="w-full bg-gray-100 rounded-2xl p-4 border border-gray-300 flex items-center justify-between hover:bg-gray-200 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-medium">学习设置</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>

        {/* 更多设置 */}
        <button
          onClick={() => navigate("/settings")}
          className="w-full bg-gray-100 rounded-2xl p-4 border border-gray-300 flex items-center justify-between hover:bg-gray-200 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Cog className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-medium">更多设置</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
