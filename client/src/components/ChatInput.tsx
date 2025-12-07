/**
 * 聊天输入框组件
 * 功能: 文字输入、语音输入、附件上传
 * 
 * @example
 * ```tsx
 * <ChatInput
 *   placeholder="发消息..."
 *   onSend={(msg) => console.log(msg)}
 *   onCameraClick={() => console.log('打开相机')}
 * />
 * ```
 */
import { useState, useRef, useEffect, useCallback, KeyboardEvent, ChangeEvent, memo } from 'react'
import CameraIcon from '@/components/icons/CameraIcon'
import MicrophoneIcon from '@/components/icons/MicrophoneIcon'
import PlusIcon from '@/components/icons/PlusIcon'
import ArrowUpIcon from '@/components/icons/ArrowUpIcon'

interface ChatInputProps {
    /** 输入框占位符文本 */
    placeholder?: string
    /** 发送消息回调 */
    onSend?: (message: string) => void
    /** 相机按钮点击回调 */
    onCameraClick?: () => void
    /** 麦克风按钮点击回调 */
    onMicClick?: () => void
    /** 加号按钮点击回调 */
    onPlusClick?: () => void
    /** 是否禁用 */
    disabled?: boolean
    /** 自定义类名 */
    className?: string
}

const ChatInput = ({
    placeholder = '发消息或者按住说话...',
    onSend,
    onCameraClick,
    onMicClick,
    onPlusClick,
    disabled = false,
    className = ''
}: ChatInputProps) => {

    const [inputValue, setInputValue] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    // 处理输入变化
    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }, [])

    // 处理发送消息
    const handleSend = useCallback(() => {
        if (inputValue.trim() && onSend) {
            onSend(inputValue.trim())
            setInputValue('') // 清空输入框
        }
    }, [inputValue, onSend])

    // 处理回车发送
    const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }, [handleSend])

    // 当从无内容切换到有内容时,保持输入框焦点
    useEffect(() => {
        const hasContent = inputValue.length > 0
        if (hasContent && inputRef.current && document.activeElement !== inputRef.current) {
            // 使用 requestAnimationFrame 确保 DOM 更新后再聚焦
            requestAnimationFrame(() => {
                inputRef.current?.focus()
            })
        }
    }, [inputValue.length > 0])

    // 组件挂载时自动聚焦
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [])

    // 输入框的通用属性
    const inputProps = {
        ref: inputRef,
        type: 'text' as const,
        value: inputValue,
        onChange: handleInputChange,
        onKeyPress: handleKeyPress,
        placeholder,
        disabled,
        className: 'flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed',
        'aria-label': '输入消息'
    }

    const hasContent = inputValue.length > 0
    
    return (
        <div className={`bg-white px-4 py-2 ${className}`}>
            <div className="flex items-center gap-2 max-w-3xl mx-auto h-11">
                <div className="flex-1 bg-gray-100 rounded-full px-4 h-full flex items-center">
                    {/* 左侧按钮 - 有内容时隐藏 */}
                    {!hasContent && (
                        <button
                            onClick={onCameraClick}
                            disabled={disabled}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="拍照或选择图片"
                        >
                            <CameraIcon size={20} className="text-gray-500" />
                        </button>
                    )}

                    {/* 输入框 */}
                    <input {...inputProps} />

                    {/* 右侧按钮 - 根据内容切换 */}
                    {hasContent ? (
                        <button
                            onClick={handleSend}
                            disabled={disabled}
                            className="w-10 h-10 flex items-center justify-center bg-transparent rounded-full text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="发送消息"
                        >
                            <ArrowUpIcon size={20} className="text-gray-600" />
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={onMicClick}
                                disabled={disabled}
                                className="w-10 h-10 flex items-center justify-center bg-transparent rounded-full text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="语音输入"
                            >
                                <MicrophoneIcon size={20} className="text-gray-600" />
                            </button>

                            <button
                                onClick={onPlusClick}
                                disabled={disabled}
                                className="w-10 h-10 flex items-center justify-center bg-transparent rounded-full text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="添加附件"
                            >
                                <PlusIcon size={20} className="text-gray-600" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// 使用 memo 优化,避免父组件重新渲染时不必要的更新
export default memo(ChatInput)
