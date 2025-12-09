/**
 * 仪表盘 - 学习进度页面
 */
import { useState, useEffect } from 'react'
import { ChevronDown, RefreshCw, MoreVertical, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getUserWordStats } from '@/api/words'
import { getPracticeStats } from '@/api/practice'


const ProgressPage = () => {
  const navigate = useNavigate()
  
  // 学习数据状态
  const [learningData, setLearningData] = useState({
    todayStudy: 0,
    todayReview: 0,
    totalStudy: 0,
    totalTime: 0,
    todayTime: 0,
    totalWords: 0,
    studiedWords: 0,
    currentBook: '四级',
    currentUnit: '生词本 9',
    consecutiveDays: 1
  })

  // 日历数据
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  const calendarDays = [
    { day: 8, status: 'normal' },
    { day: 9, status: 'active' },
    { day: 10, status: 'normal' },
    { day: 11, status: 'normal' },
    { day: 12, status: 'normal' },
    { day: 13, status: 'normal' },
    { day: 14, status: 'normal' }
  ]

  // 获取学习数据
  const fetchData = async () => {
    // 获取单词统计
    const wordStats = await getUserWordStats()
    
    // 获取练习统计
    const practiceStats = await getPracticeStats()
    
    setLearningData(prev => ({
      ...prev,
      totalWords: wordStats.totalWords,
      studiedWords: wordStats.studiedWords,
      totalStudy: practiceStats.totalPractice,
      todayStudy: practiceStats.todayPractice,
      totalTime: Math.floor(wordStats.practiceCount * 2), // 假设每次练习平均2分钟
    }))
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 刷新数据
  const handleRefresh = () => {
    fetchData()
  }

  return (
    <div className="min-h-screen bg-[#1a1d2e] text-white pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <ChevronDown className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-medium">仪表盘</h1>
        <button onClick={handleRefresh} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>

      {/* 正在学习卡片 */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">正在学习</h2>
          <button className="px-4 py-1 bg-yellow-600 hover:bg-yellow-700 rounded-full text-sm font-medium transition-colors">
            换本词书
          </button>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <div className="flex gap-4">
            {/* 词书封面 */}
            <div className="w-24 h-32 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0">
              <div className="text-sm font-bold mb-2">{learningData.currentBook}</div>
              <div className="text-xs px-2 py-1 bg-white/20 rounded">大纲词汇</div>
            </div>

            {/* 学习信息 */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-300">配套真题词组</div>
                <button className="p-1 hover:bg-white/10 rounded">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* 添加词组按钮 */}
              <div className="w-full h-20 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center mb-3 hover:border-white/40 transition-colors cursor-pointer">
                <span className="text-3xl text-white/40">+</span>
              </div>

              {/* 当前单元 */}
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4 rounded" checked readOnly />
                <span className="text-gray-300">{learningData.currentUnit}</span>
              </div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>🪙 已学习 {learningData.studiedWords}</span>
              <span>总词数 {learningData.totalWords}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                style={{ width: `${(learningData.studiedWords / learningData.totalWords) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 我的数据 */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">我的数据</h2>

        {/* 概览卡片 */}
        <button className="w-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-3 hover:bg-white/15 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-300">概览</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 今日学习&复习 */}
            <div>
              <div className="flex items-center gap-2 text-yellow-500 mb-1">
                <span className="text-xs">📊</span>
                <span className="text-xs">今日学习&复习</span>
              </div>
              <div className="text-2xl font-bold">{learningData.todayStudy} <span className="text-sm text-gray-400">词</span></div>
            </div>

            {/* 累计学习 */}
            <div>
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <span className="text-xs">📈</span>
                <span className="text-xs">累计学习</span>
              </div>
              <div className="text-2xl font-bold">{learningData.totalStudy} <span className="text-sm text-gray-400">词</span></div>
            </div>

            {/* 今日总时长 */}
            <div>
              <div className="flex items-center gap-2 text-yellow-500 mb-1">
                <span className="text-xs">🕐</span>
                <span className="text-xs">今日总时长</span>
              </div>
              <div className="text-2xl font-bold">{learningData.todayTime} <span className="text-sm text-gray-400">分钟</span></div>
            </div>

            {/* 累计时长 */}
            <div>
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <span className="text-xs">⏱️</span>
                <span className="text-xs">累计时长</span>
              </div>
              <div className="text-2xl font-bold">{learningData.totalTime} <span className="text-sm text-gray-400">分钟</span></div>
            </div>
          </div>
        </button>

        {/* 日历卡片 */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-300">日历</span>
            <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              <span>连续签到 {learningData.consecutiveDays} 天</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 星期标签 */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* 日期 */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((item, idx) => (
              <div
                key={idx}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium ${
                  item.status === 'active'
                    ? 'bg-yellow-500 text-white'
                    : 'text-gray-300'
                }`}
              >
                {item.day}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressPage
