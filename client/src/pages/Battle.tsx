/**
 * Battle对战页面
 */
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  startBattle,
  getBattleWords,
  submitBattleAnswer,
  completeBattle,
  type BattleRecord,
  type BattleWord,
} from '@/api/battle'

const Battle = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  
  const wordCount = parseInt(searchParams.get('count') || '30')
  
  // 对战状态
  const [battle, setBattle] = useState<BattleRecord | null>(null)
  const [words, setWords] = useState<BattleWord[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isMatching, setIsMatching] = useState(true)
  const [timeLeft, setTimeLeft] = useState(5)
  const [isAnswered, setIsAnswered] = useState(false)
  const [showBubble, setShowBubble] = useState(true)
  const [userScore, setUserScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [startTime, setStartTime] = useState<number>(0)

  // 初始化对战
  useEffect(() => {
    const initBattle = async () => {
      const battleRecord = await startBattle(wordCount)
      if (battleRecord) {
        setBattle(battleRecord)
        // 等待匹配完成后获取单词
        setTimeout(async () => {
          const wordsData = await getBattleWords(battleRecord.id)
          if (wordsData) {
            setWords(wordsData.words)
            setIsMatching(false)
            setStartTime(Date.now())
          }
        }, 2000)
      }
    }
    initBattle()
  }, [])

  // 气泡显示2秒后隐藏
  useEffect(() => {
    if (isMatching) return
    
    setShowBubble(true)
    const timer = setTimeout(() => {
      setShowBubble(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [isMatching])

  // 倒计时逻辑
  useEffect(() => {
    if (isMatching || isAnswered) return

    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // 时间到,自动跳到下一题
      console.log('时间到!')
      // TODO: 跳转到下一题
    }
  }, [timeLeft, isMatching, isAnswered])

  const handleGoBack = async () => {
    // 如果对战已开始，先完成对战
    if (battle && !isMatching) {
      await completeBattle(battle.id)
    }
    navigate(-1)
  }

  const handleOptionClick = async (selectedMeaning: string) => {
    if (isAnswered || !battle || !words[currentWordIndex]) return
    
    setIsAnswered(true)
    const currentWord = words[currentWordIndex]
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    
    // 判断答案是否正确（第一个选项为正确答案）
    const isCorrect = currentWord.options[0]?.meaning === selectedMeaning
    
    // 提交答案
    await submitBattleAnswer(battle.id, {
      wordId: currentWord.id,
      isCorrect,
      timeSpent,
    })
    
    // 更新分数
    if (isCorrect) {
      setUserScore(prev => prev + 1)
    }
    
    // 模拟对手得分（70%正确率）
    if (Math.random() > 0.3) {
      setOpponentScore(prev => prev + 1)
    }
    
    // 1.5秒后跳转到下一题或完成对战
    setTimeout(async () => {
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prev => prev + 1)
        setTimeLeft(5)
        setIsAnswered(false)
        setStartTime(Date.now())
      } else {
        // 对战完成
        await completeBattle(battle.id)
        navigate('/')
      }
    }, 1500)
  }

  // 匹配中界面
  if (isMatching || words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-500 to-teal-700 flex flex-col items-center justify-center p-6">
        <div className="text-white text-center">
          <div className="mb-8">
            <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">正在匹配对手...</h2>
            <p className="text-white/80">对战词汇量: {wordCount} 词</p>
          </div>
        </div>
      </div>
    )
  }

  const currentWord = words[currentWordIndex]

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
        <h1 className="text-xl font-bold text-white">对战</h1>
        {/* 倒计时 */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-4 ${
          timeLeft <= 2 ? 'bg-red-500 border-red-300 text-white animate-pulse' : 'bg-white border-white/50 text-teal-600'
        }`}>
          {timeLeft}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* VS区域 */}
        <div className="flex items-center justify-center gap-8 mb-12">
          {/* 玩家1头像 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold mb-2 border-4 border-white shadow-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'Y'}
            </div>
            <p className="text-white font-semibold">{user?.name || '你'}</p>
            <p className="text-white/80 text-sm">{userScore}/{wordCount}</p>
          </div>

          {/* VS */}
          <div className="text-white text-4xl font-bold">VS</div>

          {/* 玩家2头像 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-2 border-4 border-white shadow-lg">
              O
            </div>
            <p className="text-white font-semibold">对手</p>
            <p className="text-white/80 text-sm">{opponentScore}/{wordCount}</p>
          </div>
        </div>

        {/* 单词卡片 */}
        <div className="w-full max-w-md mb-8 relative">
          {/* 气泡提示 */}
          {showBubble && currentWord.seenCount > 0 && (
            <div className="absolute -top-2 -right-2 z-10 animate-bounce">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium whitespace-nowrap">
                这个词你见过 {currentWord.seenCount} 次哦~
                {/* 小三角 */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-rose-500" />
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              {currentWord.word}
            </h2>
            <p className="text-gray-500 text-sm">选择正确的中文意思</p>
          </div>
        </div>

        {/* 选项列表 */}
        <div className="w-full max-w-md space-y-3">
          {currentWord.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option.meaning)}
              disabled={isAnswered}
              className={`w-full bg-white/90 backdrop-blur-sm rounded-2xl py-4 px-6 text-left transition-all shadow-lg ${
                isAnswered 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-white hover:shadow-xl active:scale-95'
              }`}
            >
              <span className="text-lg font-semibold text-gray-900">{option.meaning}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 底部进度条 */}
      <div className="px-6 pb-6">
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-white h-full transition-all duration-300"
            style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
          />
        </div>
        <p className="text-white text-center text-sm mt-2">
          第 {currentWordIndex + 1} / {words.length} 题
        </p>
      </div>
    </div>
  )
}

export default Battle
