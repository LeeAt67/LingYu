/**
 * 聊天详情页 - 全屏AI聊天界面（无底部导航栏）
 */
import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, ArrowLeft } from 'lucide-react'
import ChatInput from '@/components/ChatInput'
import UserIcon from '@/components/icons/UserIcon'

interface LocationState {
  question?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const ChatDetailPage = () => {
  const { chatId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [messages, setMessages] = useState<Message[]>([])

  // 快捷功能按钮
  const quickActions = [
    { id: '1', label: '深度思考' },
    { id: '2', label: '帮我写作' },
    { id: '3', label: 'AI 创作' },
    { id: '4', label: '打电话' }
  ]


  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 处理发送消息
  const handleSendMessage = (content: string) => {
    if (content.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: content,
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, userMessage])
      
      // 模拟AI回复
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '这是AI的回复内容,正在思考中...',
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, aiMessage])
      }, 1000)
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
    // 如果有初始问题，自动发送
    if (state?.question && messages.length === 0) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: state.question,
        timestamp: Date.now()
      }
      setMessages([userMessage])
    }
  }, [state?.question, chatId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* 头像 */}
              <div className="flex-shrink-0">
                {message.role === 'user' ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <UserIcon className="text-white" size={24} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserIcon className="text-gray-600" size={24} />
                  </div>
                )}
              </div>

              {/* 消息气泡 */}
              <div
                className={`max-w-[70%] rounded-xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
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
