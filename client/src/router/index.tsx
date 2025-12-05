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
const SplashPage = lazy(() => import('@/pages/auth/SplashPage'))
const OnboardingPage = lazy(() => import('@/pages/auth/OnboardingPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))

// 主要功能页面
const HomePage = lazy(() => import('@/pages/HomePage'))
const LibraryPage = lazy(() => import('@/pages/library/LibraryPage'))
const SmartLearningPage = lazy(() => import('@/pages/SmartLearningPage'))
const ProgressPage = lazy(() => import('@/pages/ProgressPage'))

// 详情页面
const ContentDetailPage = lazy(() => import('@/pages/library/ContentDetailPage'))
const ChatDetailPage = lazy(() => import('@/pages/chat/ChatDetailPage'))

// 个人中心和设置
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const NotificationsPage = lazy(() => import('@/pages/settings/NotificationsPage'))
const AboutPage = lazy(() => import('@/pages/settings/AboutPage'))

// 搜索页面
const SearchPage = lazy(() => import('@/pages/SearchPage'))

// 404页面
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

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
        <SplashPage />
      </LazyLoad>
    ),
  },
  {
    path: '/onboarding',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <OnboardingPage />
      </Suspense>
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
            <LoginPage />
          </LazyLoad>
        ),
      },
      {
        path: 'register',
        element: (
          <LazyLoad>
            <RegisterPage />
          </LazyLoad>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <LazyLoad>
            <ForgotPasswordPage />
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
      // 首页 - 学习中心
      {
        index: true,
        element: (
          <LazyLoad>
            <HomePage />
          </LazyLoad>
        ),
      },

      // 知识库
      {
        path: 'library',
        element: (
          <LazyLoad>
            <LibraryPage />
          </LazyLoad>
        ),
      },
      {
        path: 'library/:contentId',
        element: (
          <LazyLoad>
            <ContentDetailPage />
          </LazyLoad>
        ),
      },

      // AI智能学习
      {
        path: 'smart-learning',
        element: (
          <LazyLoad>
            <SmartLearningPage />
          </LazyLoad>
        ),
      },
      {
        path: 'chat/:chatId',
        element: (
          <LazyLoad>
            <ChatDetailPage />
          </LazyLoad>
        ),
      },

      // 学习进度
      {
        path: 'progress',
        element: (
          <LazyLoad>
            <ProgressPage />
          </LazyLoad>
        ),
      },


      // 搜索
      {
        path: 'search',
        element: (
          <LazyLoad>
            <SearchPage />
          </LazyLoad>
        ),
      },

      // 个人中心
      {
        path: 'profile',
        element: (
          <LazyLoad>
            <ProfilePage />
          </LazyLoad>
        ),
      },

      // 设置相关
      {
        path: 'settings',
        element: (
          <LazyLoad>
            <SettingsPage />
          </LazyLoad>
        ),
      },
      {
        path: 'settings/notifications',
        element: (
          <LazyLoad>
            <NotificationsPage />
          </LazyLoad>
        ),
      },
      {
        path: 'settings/about',
        element: (
          <LazyLoad>
            <AboutPage />
          </LazyLoad>
        ),
      },
    ],
  },

  // 404 页面
  {
    path: '/404',
    element: (
      <LazyLoad>
        <NotFoundPage />
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
