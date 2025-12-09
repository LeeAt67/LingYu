/**
 * 通用AI聊天界面 - 语言学习助手
 */
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, MessageCircle, Lightbulb, Sparkles, ArrowLeft } from 'lucide-react'
import ChatInput from '@/components/ChatInput'
import { toast } from '@/hooks/use-toast'

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<any>(null)

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

  // 处理图片上传
  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  // 处理文件选择
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: '文件类型错误',
        description: '请选择图片文件',
        variant: 'destructive'
      })
      return
    }

    // 检查文件大小（限制5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '文件过大',
        description: '图片大小不能超过5MB',
        variant: 'destructive'
      })
      return
    }

    try {
      // 读取图片并转换为base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageData = e.target?.result as string
        
        toast({
          title: '图片已选择',
          description: '正在处理图片...',
        })

        // TODO: 这里可以调用OCR API进行文字识别
        // 目前先将图片信息作为消息发送
        const chatId = Date.now().toString()
        navigate(`/chat/${chatId}`, {
          state: {
            question: `[图片] ${file.name}`,
            imageData: imageData
          }
        })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('图片处理失败:', error)
      toast({
        title: '处理失败',
        description: '图片处理时出现错误',
        variant: 'destructive'
      })
    }

    // 清空input，允许重复选择同一文件
    event.target.value = ''
  }

  // 处理语音输入
  const handleMicClick = () => {
    // 检查浏览器是否支持语音识别
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      toast({
        title: '不支持语音识别',
        description: '您的浏览器不支持语音识别功能，请使用Chrome或Edge浏览器',
        variant: 'destructive'
      })
      return
    }

    if (isRecording) {
      // 停止录音
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    try {
      // 创建语音识别实例
      const recognition = new SpeechRecognition()
      recognition.lang = 'zh-CN' // 设置为中文
      recognition.continuous = false // 单次识别
      recognition.interimResults = false // 不返回中间结果

      recognition.onstart = () => {
        setIsRecording(true)
        toast({
          title: '开始录音',
          description: '请说话...',
        })
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        if (transcript) {
          // 将识别的文字作为消息发送
          handleSendMessage(transcript)
          toast({
            title: '识别成功',
            description: `识别内容：${transcript}`,
          })
        }
      }

      recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error)
        setIsRecording(false)
        
        let errorMessage = '语音识别失败'
        if (event.error === 'no-speech') {
          errorMessage = '未检测到语音，请重试'
        } else if (event.error === 'network') {
          errorMessage = '网络错误，请检查网络连接'
        } else if (event.error === 'not-allowed') {
          errorMessage = '请允许使用麦克风权限'
        }

        toast({
          title: '识别失败',
          description: errorMessage,
          variant: 'destructive'
        })
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (error) {
      console.error('启动语音识别失败:', error)
      toast({
        title: '启动失败',
        description: '无法启动语音识别',
        variant: 'destructive'
      })
    }
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
        <div className="flex items-center gap-3">
          {/* 返回按钮 */}
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
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
        placeholder={isRecording ? '正在录音...' : '发消息或者按住说话...'}
        onSend={handleSendMessage}
        onCameraClick={handleCameraClick}
        onMicClick={handleMicClick}
        onPlusClick={handlePlusClick}
        className="fixed bottom-16 left-0 right-0"
      />
      
      {/* 隐藏的文件输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

export default CommonChatPage
