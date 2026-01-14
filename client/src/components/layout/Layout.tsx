/**
 * 主布局组件 - 简化 Web 版本
 * 只包含翻译器和 AI 对话功能
 */
import { Outlet, useLocation, NavLink } from "react-router-dom";
import { Languages, Bot } from "lucide-react";

const Layout = () => {
  const location = useLocation();

  // 侧边栏导航配置
  const navItems = [
    { path: "/translator", icon: Languages, label: "翻译器" },
    { path: "/chat", icon: Bot, label: "AI 对话" },
  ];

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
      </aside>

      {/* 主内容区域 */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
