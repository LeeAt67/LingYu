/**
 * 路由配置文件
 */
import { lazy, Suspense } from "react";
import { RouteObject, Navigate } from "react-router-dom";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// 布局组件
import Layout from "@/components/layout/Layout";
import AuthLayout from "@/components/layout/AuthLayout";

// 认证相关页面 (懒加载)
const Splash = lazy(() => import("@/pages/auth/Splash"));
const Onboarding = lazy(() => import("@/pages/auth/Onboarding"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));

// 主要功能页面
const Translator = lazy(() =>
  import("@/pages/translator/Translator").then((module) => ({
    default: module.Translator,
  }))
);

// 详情页面
const ChatDetail = lazy(() => import("@/pages/chat/ChatDetail"));

// 404页面
const NotFound = lazy(() => import("@/pages/NotFound"));

const LazyLoad = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
);

/**
 * 路由配置
 */
export const routes: RouteObject[] = [
  // 启动页和引导页 (无布局)
  {
    path: "/splash",
    element: (
      <LazyLoad>
        <Splash />
      </LazyLoad>
    ),
  },
  {
    path: "/onboarding",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Onboarding />
      </Suspense>
    ),
  },

  // 聊天页面 (无布局，全屏显示)
  {
    path: "/chat",
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <LazyLoad>
            <ChatDetail />
          </LazyLoad>
        ),
      },
    ],
  },

  // 认证相关页面 (使用认证布局)
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: (
          <LazyLoad>
            <Login />
          </LazyLoad>
        ),
      },
      {
        path: "register",
        element: (
          <LazyLoad>
            <Register />
          </LazyLoad>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <LazyLoad>
            <ForgotPassword />
          </LazyLoad>
        ),
      },
      {
        path: "reset-password",
        element: (
          <LazyLoad>
            <ResetPassword />
          </LazyLoad>
        ),
      },
    ],
  },

  // 主应用页面 (使用主布局和侧边导航)
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      // 默认重定向到翻译器
      {
        index: true,
        element: <Navigate to="/translator" replace />,
      },
      // 翻译器
      {
        path: "translator",
        element: (
          <LazyLoad>
            <Translator />
          </LazyLoad>
        ),
      },
    ],
  },

  // 聊天页面
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyLoad>
            <ChatDetail />
          </LazyLoad>
        ),
      },
    ],
  },

  // 404 页面
  {
    path: "/404",
    element: (
      <LazyLoad>
        <NotFound />
      </LazyLoad>
    ),
  },

  // 重定向所有未匹配的路由到404
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
];

export default routes;
