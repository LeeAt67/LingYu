/**
 * 聊天详情页 - 全屏AI聊天界面（无底部导航栏）
 */
import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Paperclip, Send, Plus, ArrowLeft } from 'lucide-react'

interface QuestionCard {
  id: string
  question: string
  gradient: string
  textColor: string
}

interface LocationState {
  question?: string
  model?: 'yuanbao' | 'hunyuan'
}

const ChatDetailPage = () => {
  const { chatId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState
  
  const [selectedModel, setSelectedModel] = useState<'yuanbao' | 'hunyuan'>(state?.model || 'yuanbao')
  const [inputText, setInputText] = useState('')
  const [initialQuestion, setInitialQuestion] = useState(state?.question || '')

  // 推荐问题卡片数据
  const questionCards: QuestionCard[] = [
    {
      id: '1',
      question: '冬天手脚冰凉怎么改善?',
      gradient: 'from-[#DCFCE7] to-[#B9F8CF]',
      textColor: 'text-[#0D542B]'
    },
    {
      id: '2',
      question: '"冬吃萝卜夏吃人参", 到底是哪种萝卜?',
      gradient: 'from-[#F3F4F6] to-[#E5E7EB]',
      textColor: 'text-gray-900'
    },
    {
      id: '3',
      question: '吃什么可以缓解脱发问题?',
      gradient: 'from-[#F3F4F6] to-[#E5E7EB]',
      textColor: 'text-gray-900'
    },
    {
      id: '4',
      question: '用冷水洗脸真的能帮助毛孔收缩吗?',
      gradient: 'from-[#F3F4F6] to-[#E5E7EB]',
      textColor: 'text-gray-900'
    }
  ]

  // 快捷功能按钮
  const quickActions = [
    { id: '1', label: '深度思考' },
    { id: '2', label: '帮我写作' },
    { id: '3', label: 'AI 创作' },
    { id: '4', label: '打电话' }
  ]

  // 处理问题卡片点击
  const handleQuestionClick = (question: string) => {
    setInitialQuestion(question)
    // 这里可以添加发送问题到AI的逻辑
    console.log('发送问题:', question, '使用模型:', selectedModel)
  }

  // 处理发送消息
  const handleSendMessage = () => {
    if (inputText.trim()) {
      // 这里可以添加发送消息到AI的逻辑
      console.log('发送消息:', inputText, '使用模型:', selectedModel)
      setInputText('')
    }
  }

  // 返回上一页
  const handleGoBack = () => {
    navigate(-1)
  }

  useEffect(() => {
    // 如果有初始问题，可以在这里自动发送
    if (initialQuestion) {
      console.log('初始问题:', initialQuestion, '聊天ID:', chatId)
    }
  }, [initialQuestion, chatId])

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 顶部AI模型切换器 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* 返回按钮 */}
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Yuanbao 模型 */}
          <button
            onClick={() => setSelectedModel('yuanbao')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              selectedModel === 'yuanbao'
                ? 'bg-gray-100'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
            <span className="text-sm font-medium text-gray-900">Yuanbao</span>
          </button>

          {/* Hunyuan 模型 */}
          <button
            onClick={() => setSelectedModel('hunyuan')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              selectedModel === 'hunyuan'
                ? 'bg-gray-100'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-purple-600" />
            <span className="text-sm font-medium text-gray-600">Hunyuan</span>
          </button>
        </div>

        {/* 更多选项按钮 */}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        {/* 欢迎语 */}
        <h1 className="text-2xl font-normal text-gray-900 mb-8">
          Hi, where shall we start today?
        </h1>

        {/* 如果有初始问题，显示问题 */}
        {initialQuestion && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">你的问题：</p>
            <p className="text-base text-gray-900">{initialQuestion}</p>
          </div>
        )}

        {/* 推荐问题卡片网格 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {questionCards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleQuestionClick(card.question)}
              className={`relative p-4 rounded-3xl bg-gradient-to-br ${card.gradient} text-left transition-transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="flex flex-col justify-between h-40">
                <p className={`text-sm leading-relaxed ${card.textColor}`}>
                  {card.question}
                </p>
                <span className="text-xs text-gray-500">大家都在问</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 底部区域 */}
      <div className="border-t border-gray-200">
        {/* 快捷功能按钮 */}
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="flex-shrink-0 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* 输入框区域 */}
        <div className="flex items-center gap-2 px-4 py-3">
          {/* 附件按钮 */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          {/* 输入框 */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="输入你的问题..."
              className="w-full px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 发送按钮 */}
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>

          {/* 添加按钮 */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatDetailPage
