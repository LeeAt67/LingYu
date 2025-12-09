/**
 * Practice练习页面
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

// 示例单词库
const practiceWords = [
  { 
    word: 'Abandon', 
    phonetic: '/əˈbændən/',
    hint: '先回想词义再选择，想不起来↓看答案↓',
    options: [
      { type: 'v.', meaning: '放弃；抛弃；遗弃' },
      { type: 'v.', meaning: '获得；得到；赢得' },
      { type: 'v.', meaning: '保持；维持；继续' },
      { type: 'v.', meaning: '继续；持续；延续' }
    ],
    correct: 0
  },
  { 
    word: 'Ability', 
    phonetic: '/əˈbɪləti/',
    hint: '先回想词义再选择，想不起来↓看答案↓',
    options: [
      { type: 'n.', meaning: '能力；才能；本领' },
      { type: 'n.', meaning: '残疾；障碍；缺陷' },
      { type: 'n.', meaning: '无能；无力；软弱' },
      { type: 'n.', meaning: '困难；难题；障碍' }
    ],
    correct: 0
  },
  { 
    word: 'Absent', 
    phonetic: '/ˈæbsənt/',
    hint: '先回想词义再选择，想不起来↓看答案↓',
    options: [
      { type: 'adj.', meaning: '缺席的；不在场的' },
      { type: 'adj.', meaning: '出席的；在场的' },
      { type: 'adj.', meaning: '现在的；当前的' },
      { type: 'adj.', meaning: '未来的；将来的' }
    ],
    correct: 0
  },
]

const Practice = () => {
  const navigate = useNavigate()
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isAnswered, setIsAnswered] = useState(false)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)
  const [showBubble, setShowBubble] = useState(true)
  const [showAnswer, setShowAnswer] = useState(false)
  const [practiceCount] = useState(Math.floor(Math.random() * 20) + 1) // 模拟练习次数
  const [correctCount, setCorrectCount] = useState(0)
  
  const currentWord = practiceWords[currentWordIndex]

  // 气泡显示2秒后隐藏
  useEffect(() => {
    setShowBubble(true)
    const timer = setTimeout(() => {
      setShowBubble(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [currentWordIndex])

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleOptionClick = (optionIndex: number) => {
    if (isAnswered) return // 已答题则不处理
    
    setIsAnswered(true)
    setSelectedOptionIndex(optionIndex)
    
    // 判断答案是否正确
    if (optionIndex === currentWord.correct) {
      setCorrectCount(correctCount + 1)
    }
    
    // 1.5秒后跳转到下一题
    setTimeout(() => {
      if (currentWordIndex < practiceWords.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1)
        setIsAnswered(false)
        setSelectedOptionIndex(null)
        setShowAnswer(false)
      } else {
        // 练习完成,返回首页
        console.log('练习完成!')
        navigate('/')
      }
    }, 1500)
  }
  
  const handleShowAnswer = () => {
    setShowAnswer(true)
  }

  // 获取选项的样式
  const getOptionStyle = (optionIndex: number) => {
    if (!isAnswered && !showAnswer) {
      return 'bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/30'
    }
    
    // 显示答案或已答题后显示正确/错误
    if (optionIndex === currentWord.correct) {
      return 'bg-green-500/80 text-white border border-green-400'
    }
    if (optionIndex === selectedOptionIndex && optionIndex !== currentWord.correct) {
      return 'bg-red-500/80 text-white border border-red-400'
    }
    return 'bg-white/10 opacity-60 border border-white/20'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-teal-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white/10 backdrop-blur-sm">
        <button
          onClick={handleGoBack}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">练习</h1>
        <div className="w-10" /> {/* 占位元素保持居中 */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* 单词卡片 */}
        <div className="w-full max-w-md mb-8 relative">
          {/* 气泡提示 */}
          {showBubble && (
            <div className="absolute -top-2 -right-2 z-10 animate-bounce">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium whitespace-nowrap">
                已练习 {practiceCount} 次~
                {/* 小三角 */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-indigo-500" />
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-5xl font-light text-white mb-3 tracking-wide">
              {currentWord.word}
            </h2>
            <p className="text-white/60 text-base mb-4">{currentWord.phonetic}</p>
            <p className="text-white/50 text-sm">{currentWord.hint}</p>
          </div>
        </div>

        {/* 选项列表 */}
        <div className="w-full max-w-md space-y-3">
          {currentWord.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={isAnswered || showAnswer}
              className={`w-full rounded-2xl py-4 px-5 text-left transition-all ${getOptionStyle(index)}`}
            >
              <div className="text-sm text-white/80 mb-1">{option.type}</div>
              <div className="text-base font-medium text-white">{option.meaning}</div>
            </button>
          ))}
        </div>
        
        {/* 看答案按钮 */}
        {!isAnswered && !showAnswer && (
          <button
            onClick={handleShowAnswer}
            className="mt-6 text-white text-base font-medium underline underline-offset-4 hover:text-white/80 transition-colors"
          >
            看答案
          </button>
        )}
      </div>

      {/* 底部进度 */}
      <div className="px-6 pb-6">
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-white h-full transition-all duration-300"
            style={{ width: `${((currentWordIndex + 1) / practiceWords.length) * 100}%` }}
          />
        </div>
        <p className="text-white text-center text-sm mt-2">
          第 {currentWordIndex + 1} / {practiceWords.length} 题 · 正确 {correctCount} 题
        </p>
      </div>
    </div>
  )
}

export default Practice
