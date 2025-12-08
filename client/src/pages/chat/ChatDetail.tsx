/**
 * 聊天详情页 - 全屏AI聊天界面（无底部导航栏）
 */
import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, ArrowLeft, Sparkles } from 'lucide-react'
import ChatInput from '@/components/ChatInput'
import UserIcon from '@/components/icons/UserIcon'
import { chatWithOllamaStream, checkOllamaHealth } from '@/api/ollama'
import { toast } from '@/hooks/use-toast'

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
  const [isLoading, setIsLoading] = useState(false)
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null)

  // 快捷功能按钮
  const quickActions = [
    { id: '1', label: '深度思考' },
    { id: '2', label: '帮我写作' },
    { id: '3', label: 'AI 创作' },
    { id: '4', label: '打电话' }
  ]

  // 检查 Ollama 服务状态
  useEffect(() => {
    const checkOllama = async () => {
      const isAvailable = await checkOllamaHealth()
      setOllamaAvailable(isAvailable)
      if (!isAvailable) {
        toast({
          title: '提示',
          description: 'Ollama 服务未启动，将使用模拟回复',
          variant: 'default'
        })
      }
    }
    checkOllama()
  }, [])


  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 处理发送消息
  const handleSendMessage = async (content: string) => {
    if (content.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: content,
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, userMessage])
      setIsLoading(true)
      
      try {
        if (ollamaAvailable) {
          // 使用 Ollama AI 流式回复
          const aiMessageId = (Date.now() + 1).toString()
          const aiMessage: Message = {
            id: aiMessageId,
            role: 'assistant',
            content: '',
            timestamp: Date.now()
          }
          
          // 先添加空的 AI 消息
          setMessages(prev => [...prev, aiMessage])
          setIsLoading(false) // 开始接收流式数据,取消加载状态
          
          // 流式接收 AI 回复
          await chatWithOllamaStream(
            { message: content },
            (chunk: string) => {
              // 每次收到新的文本块,更新消息内容
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, content: msg.content + chunk }
                    : msg
                )
              )
            },
            (error: Error) => {
              console.error('流式回复错误:', error)
              toast({
                title: '错误',
                description: error.message,
                variant: 'destructive'
              })
            }
          )
          
          return // 流式处理完成,直接返回
        } else {
          // 模拟回复（Ollama 不可用时）
          setTimeout(() => {
            const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: '抱歉，AI 服务暂时不可用。请确保 Ollama 服务已启动。',
              timestamp: Date.now()
            }
            setMessages(prev => [...prev, aiMessage])
            setIsLoading(false)
          }, 1000)
          return
        }
      } catch (error) {
        console.error('AI 回复失败:', error)
        toast({
          title: '错误',
          description: error instanceof Error ? error.message : 'AI 回复失败',
          variant: 'destructive'
        })
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '抱歉，我遇到了一些问题，请稍后再试。',
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
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
    // 如果有初始问题，等待 Ollama 检查完成后自动发送
    if (state?.question && messages.length === 0 && ollamaAvailable !== null) {
      handleSendMessage(state.question)
    }
  }, [state?.question, chatId, ollamaAvailable])

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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="text-white" size={20} />
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
          
          {/* 加载状态 */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="text-white animate-pulse" size={20} />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-sm text-gray-500">AI 正在思考...</span>
                </div>
              </div>
            </div>
          )}
          
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
