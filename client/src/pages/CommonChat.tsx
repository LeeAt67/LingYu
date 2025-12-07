/**
 * 通用AI聊天界面 - 语言学习助手
 */
import { useNavigate } from 'react-router-dom'
import { BookOpen, MessageCircle, Lightbulb, Sparkles } from 'lucide-react'
import CameraIcon from '@/components/icons/CameraIcon'
import MicrophoneIcon from '@/components/icons/MicrophoneIcon'
import PlusIcon from '@/components/icons/PlusIcon'

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

  // 推荐问题卡片数据 - 语言学习场景
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
      <div className="fixed bottom-16 left-0 right-0 bg-white px-4 py-2">
        <div className="flex items-center gap-2 max-w-3xl mx-auto h-11">
          {/* 左侧相机按钮 */}
          <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0">
            <CameraIcon size={24} className="text-gray-500" />
          </button>
          
          {/* 中间输入框容器 */}
          <div className="flex-1 bg-gray-100 rounded-full px-4 h-full flex items-center">
            <input 
              type="text" 
              placeholder="Text or hold to talk" 
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          
          {/* 右侧按钮组 */}
          <button className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0">
            <MicrophoneIcon size={20} className="text-gray-600" />
          </button>
          
          <button className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0">
            <PlusIcon size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommonChatPage
