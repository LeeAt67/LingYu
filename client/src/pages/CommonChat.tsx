/**
 * 通用AI聊天界面 - 语言学习助手
 */
import { useNavigate } from 'react-router-dom'
import { BookOpen, MessageCircle, Lightbulb, Sparkles } from 'lucide-react'
import ChatInput from '@/components/ChatInput'

interface QuestionCard {
  id: string
  question: string
  gradient: string
  textColor: string
  icon?: 'book' | 'message' | 'lightbulb' | 'sparkles'
  category?: string
}

const CommonChatPage = () => {
  const navigate = useNavigate()

  // TODO：个性化推荐问题卡片 - 语言学习场景
  const questionCards: QuestionCard[] = [
    {
      id: '1',
      question: '如何快速记住这个单词的多个含义?',
      gradient: 'from-[#DBEAFE] to-[#BFDBFE]',
      textColor: 'text-[#1E3A8A]',
      icon: 'book',
      category: '词汇学习'
    },
    {
      id: '2',
      question: '这个单词在句子中应该怎么用?',
      gradient: 'from-[#FCE7F3] to-[#FBCFE8]',
      textColor: 'text-[#831843]',
      icon: 'message',
      category: '语法应用'
    },
    {
      id: '3',
      question: '有什么好的记忆技巧吗?',
      gradient: 'from-[#FEF3C7] to-[#FDE68A]',
      textColor: 'text-[#78350F]',
      icon: 'lightbulb',
      category: '学习方法'
    },
    {
      id: '4',
      question: '帮我解释这个词组的文化背景',
      gradient: 'from-[#E0E7FF] to-[#C7D2FE]',
      textColor: 'text-[#3730A3]',
      icon: 'sparkles',
      category: '文化拓展'
    }
  ]

  // 处理问题卡片点击
  const handleQuestionClick = (question: string) => {
    const chatId = Date.now().toString()
    navigate(`/chat/${chatId}`, {
      state: {
        question: question,
      }
    })
  }

  // 处理发送消息
  const handleSendMessage = (message: string) => {
    const chatId = Date.now().toString()
    navigate(`/chat/${chatId}`, {
      state: {
        question: message,
      }
    })
  }

  // 处理相机点击
  const handleCameraClick = () => {
    console.log('打开相机/选择图片')
    // TODO: 实现图片上传功能
  }

  // 处理麦克风点击
  const handleMicClick = () => {
    console.log('开始语音输入')
    // TODO: 实现语音输入功能
  }

  // 处理加号点击
  const handlePlusClick = () => {
    console.log('打开附件选择')
    // TODO: 实现附件上传功能
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {/* App Icon */}
          <img 
            src="/icon-192.svg" 
            alt="好词" 
            className="w-8 h-8"
          />
          {/* App Name */}
          <h1 className="text-lg font-semibold text-gray-900">好词</h1>
        </div>
      </div>

      {/* main */}
      <div className="flex-1 overflow-y-auto px-4 py-8 pb-32">
        {/* 欢迎语 */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            你好,今天想学点什么?
          </h1>
          <p className="text-sm text-gray-500">
            选择一个话题开始你的学习之旅
          </p>
        </div>

        {/* 推荐问题卡片网格 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {questionCards.map((card) => {
            const IconComponent = 
              card.icon === 'book' ? BookOpen :
              card.icon === 'message' ? MessageCircle :
              card.icon === 'lightbulb' ? Lightbulb :
              card.icon === 'sparkles' ? Sparkles :
              BookOpen

            return (
              <button
                key={card.id}
                onClick={() => handleQuestionClick(card.question)}
                className={`relative p-4 rounded-2xl bg-gradient-to-br ${card.gradient} text-left transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98]`}
              >
                <div className="flex flex-col justify-between h-40">
                  <div className="space-y-3">
                    <div className={`w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center`}>
                      <IconComponent className={`w-4 h-4 ${card.textColor}`} />
                    </div>
                    <p className={`text-sm font-medium leading-relaxed ${card.textColor}`}>
                      {card.question}
                    </p>
                  </div>
                  <span className={`text-xs ${card.textColor} opacity-60`}>
                    {card.category}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* footer - 输入框 */}
      <ChatInput
        placeholder="发消息或者按住说话..."
        onSend={handleSendMessage}
        onCameraClick={handleCameraClick}
        onMicClick={handleMicClick}
        onPlusClick={handlePlusClick}
        className="fixed bottom-16 left-0 right-0"
      />
    </div>
  )
}

export default CommonChatPage
