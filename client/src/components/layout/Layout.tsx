/**
 * 主布局组件
 * 包含底部导航栏
 */
import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { Home, Library, Bot, User } from 'lucide-react'

const Layout = () => {
  const location = useLocation()

  // 底部导航配置
  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/library', icon: Library, label: '知识' },
    { path: '/chat', icon: Bot, label: 'AI' },
    { path: '/profile', icon: User, label: '我的' },
  ]

  // 不显示底部导航的路径
  const hideNavPaths = [
    '/search',
    '/settings',
    '/chat/',
    '/library/',
  ]

  const shouldHideNav = hideNavPaths.some(path => {
    if (path.endsWith('/')) {
      return location.pathname.startsWith(path)
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 主内容区域 */}
      <main className="flex-1 overflow-y-auto pb-safe">
        <Outlet />
      </main>

      {/* 底部导航栏 */}
      {!shouldHideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border safe-area-inset-bottom">
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map((item) => {
              const Icon = item.icon
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                      isActive
                        ? 'text-primary'
                        : 'text-text-tertiary hover:text-text-secondary'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                      <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}

export default Layout
