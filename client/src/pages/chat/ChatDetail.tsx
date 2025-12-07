/**
 * 聊天详情页 - 全屏AI聊天界面（无底部导航栏）
 */
import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown,  ArrowLeft } from 'lucide-react'
import ChatInput from '@/components/ChatInput'

interface LocationState {
  question?: string
}

const ChatDetailPage = () => {
  const { chatId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState
  
  const [inputText, setInputText] = useState('')

  // 快捷功能按钮
  const quickActions = [
    { id: '1', label: '深度思考' },
    { id: '2', label: '帮我写作' },
    { id: '3', label: 'AI 创作' },
    { id: '4', label: '打电话' }
  ]


  // 处理发送消息
  const handleSendMessage = () => {
    if (inputText.trim()) {
      // 这里可以添加发送消息到AI的逻辑
      console.log('发送消息:', inputText)
      setInputText('')
    }
  }

  const handleCameraClick = () => {
    console.log('打开相机/选择图片')
    // TODO: 实现图片上传功能
  }

  const handleMicClick = () => {
    console.log('开始语音输入')
    // TODO: 实现语音输入功能
  }

  const handlePlusClick = () => {
    console.log('打开附件选择')
    // TODO: 实现附件上传功能
  }
  // 返回上一页
  const handleGoBack = () => {
    navigate(-1)
  }

  useEffect(() => {
    // 如果有初始问题，可以在这里自动发送
    if (state?.question) {
      console.log('初始问题:', state.question, '聊天ID:', chatId)
    }
  }, [state?.question, chatId])

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 顶部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* 返回按钮 */}
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <h1 className="flex-1 text-lg font-semibold text-gray-900">好词</h1>

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
        {state?.question && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">你的问题：</p>
            <p className="text-base text-gray-900">{state.question}</p>
          </div>
        )}

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
        <ChatInput
          placeholder="输入你的问题..."
          onSend={handleSendMessage}
          onCameraClick={handleCameraClick}
          onMicClick={handleMicClick}
          onPlusClick={handlePlusClick}
        />
        </div>
      </div>
  )
}

export default ChatDetailPage
