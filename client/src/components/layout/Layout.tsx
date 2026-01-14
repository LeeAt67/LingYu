/**
 * 主布局组件 - 简化 Web 版本
 * 只包含翻译器和 AI 对话功能
 */
import { Outlet, useLocation, NavLink, useNavigate } from "react-router-dom";
import { Languages, Bot, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/hooks/use-toast";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // 侧边栏导航配置
  const navItems = [
    { path: "/translator", icon: Languages, label: "翻译器" },
    { path: "/chat", icon: Bot, label: "AI 对话" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "退出成功",
        description: "已成功退出登录",
      });
      navigate("/auth/login");
    } catch (error) {
      toast({
        title: "退出失败",
        description: "退出登录时出现错误",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* 左侧边栏 */}
      <aside className="w-64 border-r border-gray-200 flex flex-col">
        {/* Logo 区域 */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-black">Neo</h1>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? "bg-gray-100 text-black border-r-2 border-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* 底部用户信息和退出 */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black truncate">
                {user?.name || "用户"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* 主内容区域 */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
