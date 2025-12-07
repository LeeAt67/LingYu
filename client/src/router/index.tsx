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
const Library = lazy(() => import('@/pages/library/Library'))
const SmartLearning = lazy(() => import('@/pages/CommonChat'))
const Progress = lazy(() => import('@/pages/Progress'))

// 详情页面
const ContentDetail = lazy(() => import('@/pages/library/ContentDetail'))
const ChatDetail = lazy(() => import('@/pages/chat/ChatDetail'))

// 个人中心和设置
const Profile = lazy(() => import('@/pages/profile/Profile'))
const Settings = lazy(() => import('@/pages/settings/Settings'))
const Notifications = lazy(() => import('@/pages/settings/Notifications'))
const About = lazy(() => import('@/pages/settings/About'))

// 搜索页面
const Search = lazy(() => import('@/pages/Search'))

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

  // 聊天详情页面 (无布局，全屏显示)
  {
    path: '/chat/:chatId',
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
      // 首页 - 学习中心
      {
        index: true,
        element: (
          <LazyLoad>
            <Home />
          </LazyLoad>
        ),
      },

      // 知识库
      {
        path: 'library',
        element: (
          <LazyLoad>
            <Library />
          </LazyLoad>
        ),
      },
      {
        path: 'library/:contentId',
        element: (
          <LazyLoad>
            <ContentDetail />
          </LazyLoad>
        ),
      },
      
      // AI智能学习
      {
        path: 'smart-learning',
        element: (
          <LazyLoad>
            <SmartLearning />
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


      // 搜索
      {
        path: 'search',
        element: (
          <LazyLoad>
            <Search />
          </LazyLoad>
        ),
      },

      // 个人中心
      {
        path: 'profile',
        element: (
          <LazyLoad>
            <Profile />
          </LazyLoad>
        ),
      },

      // 设置相关
      {
        path: 'settings',
        element: (
          <LazyLoad>
            <Settings />
          </LazyLoad>
        ),
      },
      {
        path: 'settings/notifications',
        element: (
          <LazyLoad>
            <Notifications />
          </LazyLoad>
        ),
      },
      {
        path: 'settings/about',
        element: (
          <LazyLoad>
            <About />
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
