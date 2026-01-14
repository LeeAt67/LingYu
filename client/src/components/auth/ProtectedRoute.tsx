/**
 * 受保护路由组件
 * 用于需要登录才能访问的页面
 */
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, token, isLoading, getCurrentUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // 如果有 token 但没有用户信息，尝试获取用户信息
    if (token && !isAuthenticated) {
      getCurrentUser().catch(() => {
        // 获取用户信息失败，token 可能已过期
        console.error("获取用户信息失败");
      });
    }
  }, [token, isAuthenticated, getCurrentUser]);

  // 正在加载用户信息
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  // 未登录，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 已登录，渲染子组件
  return <>{children}</>;
};
