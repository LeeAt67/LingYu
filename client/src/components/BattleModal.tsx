/**
 * Battle对战词汇量选择弹窗
 */
import { X } from 'lucide-react'

interface BattleModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectWordCount: (count: number) => void
}

const BattleModal = ({ isOpen, onClose, onSelectWordCount }: BattleModalProps) => {
  if (!isOpen) return null

  const wordCountOptions = [30, 50, 100, 200]

  const handleSelect = (count: number) => {
    onSelectWordCount(count)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-3xl p-6 w-[90%] max-w-md shadow-2xl">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* 标题 */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">选择对战词汇量</h2>
        <p className="text-gray-500 text-sm text-center mb-6">选择本局对战的单词数量</p>

        {/* 选项列表 */}
        <div className="space-y-3">
          {wordCountOptions.map((count) => (
            <button
              key={count}
              onClick={() => handleSelect(count)}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-2xl py-4 px-6 text-lg font-semibold transition-all active:scale-95 shadow-lg hover:shadow-xl"
            >
              {count} 词
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BattleModal
