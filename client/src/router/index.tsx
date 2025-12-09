/**
 * 路由配置文件
 */
import { lazy, Suspense } from 'react'
import { RouteObject, Navigate } from 'react-router-dom'

import LoadingSpinner from '@/components/common/LoadingSpinner'

// 布局组件
import Layout from '@/components/layout/Layout'
import AuthLayout from '@/components/layout/AuthLayout'

// 认证相关页面 (懒加载)
const Splash = lazy(() => import('@/pages/auth/Splash'))
const Onboarding = lazy(() => import('@/pages/auth/Onboarding'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))

// 主要功能页面
const Home = lazy(() => import('@/pages/Home'))
const Content = lazy(() => import('@/pages/content/Content'))
const Progress = lazy(() => import('@/pages/Progress'))
const Battle = lazy(() => import('@/pages/Battle'))
const Practice = lazy(() => import('@/pages/Practice'))

// 详情页面
const ChatDetail = lazy(() => import('@/pages/chat/ChatDetail'))

// 个人中心和设置
const Profile = lazy(() => import('@/pages/profile/Profile'))
const Settings = lazy(() => import('@/pages/profile/Settings'))
const Notifications = lazy(() => import('@/pages/profile/Notifications'))

// 404页面
const NotFound = lazy(() => import('@/pages/NotFound'))

const LazyLoad = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
)

/**
 * 路由配置
 */
export const routes: RouteObject[] = [
  // 启动页和引导页 (无布局)
  {
    path: '/splash',
    element: (
      <LazyLoad>
        <Splash />
      </LazyLoad>
    ),
  },
  {
    path: '/onboarding',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Onboarding />
      </Suspense>
    ),
  },

  // 聊天页面 (无布局，全屏显示)
  {
    path: '/chat',
    element: (
      <LazyLoad>
        <ChatDetail />
      </LazyLoad>
    ),
  },

  // 认证相关页面 (使用认证布局)
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <LazyLoad>
            <Login />
          </LazyLoad>
        ),
      },
      {
        path: 'register',
        element: (
          <LazyLoad>
            <Register />
          </LazyLoad>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <LazyLoad>
            <ForgotPassword />
          </LazyLoad>
        ),
      },
    ],
  },

  // 主应用页面 (使用主布局和底部导航)
  {
    path: '/',
    element: <Layout />,
    children: [
      // 首页 - 唯一显示底部导航栏的页面
      {
        index: true,
        element: (
          <LazyLoad>
            <Home />
          </LazyLoad>
        ),
      },
    ],
  },

  // Content页面 (无底部导航)
  {
    path: '/content',
    element: (
      <LazyLoad>
        <Content />
      </LazyLoad>
    ),
  },


  // Battle对战 (无底部导航)
  {
    path: '/battle',
    element: (
      <LazyLoad>
        <Battle />
      </LazyLoad>
    ),
  },

  // Practice练习 (无底部导航)
  {
    path: '/practice',
    element: (
      <LazyLoad>
        <Practice />
      </LazyLoad>
    ),
  },

  // 个人中心 (无底部导航)
  {
    path: '/profile',
    element: (
      <LazyLoad>
        <Profile />
      </LazyLoad>
    ),
  },

  // 设置相关 (无底部导航)
  {
    path: '/settings',
    element: (
      <LazyLoad>
        <Settings />
      </LazyLoad>
    ),
  },
  {
    path: '/settings/notifications',
    element: (
      <LazyLoad>
        <Notifications />
      </LazyLoad>
    ),
  },

  // 学习进度
  {
    path: 'progress',
    element: (
      <LazyLoad>
        <Progress />
      </LazyLoad>
    ),
  },

  // 404 页面
  {
    path: '/404',
    element: (
      <LazyLoad>
        <NotFound />
      </LazyLoad>
    ),
  },

  // 重定向所有未匹配的路由到404
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]

export default routes
