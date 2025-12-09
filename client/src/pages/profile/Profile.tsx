/**
 * 个人中心页面
 */
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, ChevronRight, Palette, Settings as SettingsIcon, Cog } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // 装备图标列表
  const equipmentIcons = ['📅', '📚', '🎯', '📝']

  return (
    <div className="min-h-screen bg-[#1a1d2e] text-white pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={() => navigate('/settings/notifications')}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
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
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl">
                👤
              </div>
            )}
          </div>
          {/* VIP徽章 */}
          <div className="absolute bottom-0 right-0 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-[#1a1d2e]">
            VIP
          </div>
        </div>

        {/* 用户名 */}
        <h2 className="text-2xl font-semibold mb-2">
          {user?.name || '67的学习助手'}
        </h2>

        {/* 会员信息 */}
        <button className="flex items-center gap-2 text-yellow-500 text-sm">
          <span>成为终身大会员 404 天</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 酷币和装备卡片 */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-6">
        {/* 酷币卡片 */}
        <button className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">酷币</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <span className="text-2xl font-bold">2,686</span>
          </div>
        </button>

        {/* 装备卡片 */}
        <button className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">装备</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">8/8</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {equipmentIcons.map((icon, idx) => (
              <span key={idx} className="text-2xl">{icon}</span>
            ))}
          </div>
        </button>
      </div>

      {/* 设置选项 */}
      <div className="px-4 space-y-3">
        {/* 外观&沉浸场景 */}
        <button
          onClick={() => navigate('/settings/appearance')}
          className="w-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 flex items-center justify-between hover:bg-white/15 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-green-400" />
            </div>
            <span className="font-medium">外观 & 沉浸场景</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        {/* 学习设置 */}
        <button
          onClick={() => navigate('/settings/learning')}
          className="w-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 flex items-center justify-between hover:bg-white/15 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-purple-400" />
            </div>
            <span className="font-medium">学习设置</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        {/* 更多设置 */}
        <button
          onClick={() => navigate('/settings')}
          className="w-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 flex items-center justify-between hover:bg-white/15 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Cog className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-medium">更多设置</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
