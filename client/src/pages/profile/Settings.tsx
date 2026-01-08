/**
 * 更多设置页面
 */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-300">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-medium">更多设置</h1>
        <div className="w-10"></div>
      </div>

      {/* 设置列表 */}
      <div className="pb-32">
        {/* 账号信息 */}
        <div className="mb-2">
          <div className="px-4 py-2 text-sm text-gray-600">账号信息</div>
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
            <span>账号信息</span>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 帮助与反馈 */}
        <div className="mb-2">
          <div className="px-4 py-2 text-sm text-gray-600">帮助与反馈</div>
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
            <span>帮助与反馈</span>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 其他选项 */}
        <div className="mb-2">
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
            <span>评价应用</span>
            <span className="text-sm text-gray-600">V5.9.16</span>
          </button>
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors border-t border-gray-200">
            <span>推荐给好友</span>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors border-t border-gray-200">
            <span>兑换中心</span>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors border-t border-gray-200">
            <span>违法不良信息举报</span>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 法律条款 */}
        <div className="mb-2">
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
            <span>服务条款</span>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors border-t border-gray-200">
            <span>隐私协议及简明版</span>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors border-t border-gray-200">
            <span>儿童信息保护</span>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors border-t border-gray-200">
            <span>个人信息收集清单</span>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors border-t border-gray-200">
            <span>第三方信息数据共享</span>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 应用信息 */}
        <div className="mb-2">
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
            <span>应用权限说明</span>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors border-t border-gray-200">
            <span>应用权限管理</span>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors border-t border-gray-200">
            <span>个性化推荐</span>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors border-t border-gray-200">
            <span>ICP 备案号</span>
            <span className="text-sm text-gray-600">京ICP备12032362号-6A</span>
          </button>
        </div>

        {/* 账号管理 */}
        <div className="mb-2">
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
            <span>清除缓存</span>
            <span className="text-sm text-gray-600">118 MB</span>
          </button>
          <button className="w-full bg-gray-50 px-4 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors border-t border-gray-200">
            <span>注销账号</span>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 退出登录按钮 */}
        <div className="px-4 mt-6">
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-4 rounded-xl transition-all"
          >
            退出登录
          </button>
          <div className="text-center text-sm text-gray-500 mt-4">
            ID: {user?.id || "61163662"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
