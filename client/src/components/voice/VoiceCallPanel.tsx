/**
 * 语音通话面板组件
 * 功能: 实时语音通话、音频可视化、转录显示
 *
 * @example
 * ```tsx
 * <VoiceCallPanel
 *   userId="user123"
 *   onClose={() => console.log('关闭')}
 * />
 * ```
 */
import { useEffect, memo } from "react";
import { useVoiceCallStore } from "@/stores/useVoiceCallStore";
import AudioVisualizer from "./AudioVisualizer";
import ControlBar from "./ControlBar";
import SubtitlePanel from "./SubtitlePanel";

interface VoiceCallPanelProps {
  /** 用户ID */
  userId: string;
  /** 会话ID（可选） */
  sessionId?: string;
  /** 关闭回调 */
  onClose?: () => void;
  /** 转录回调 */
  onTranscription?: (role: "user" | "assistant", text: string) => void;
  /** 自定义类名 */
  className?: string;
}

const VoiceCallPanel = ({
  userId,
  sessionId,
  onClose,
  onTranscription,
  className = "",
}: VoiceCallPanelProps) => {
  const {
    status,
    isMuted,
    isAISpeaking,
    messages,
    error,
    audioStreamer,
    pcmPlayer,
    startCall,
    endCall,
    toggleMute,
  } = useVoiceCallStore();

  // 监听转录消息变化，触发回调
  useEffect(() => {
    if (messages.length > 0 && onTranscription) {
      const lastMessage = messages[messages.length - 1];
      onTranscription(lastMessage.role, lastMessage.content);
    }
  }, [messages, onTranscription]);

  // 处理开始通话
  const handleStart = async () => {
    try {
      await startCall(userId, sessionId);
    } catch (err) {
      console.error("启动通话失败:", err);
    }
  };

  // 处理结束通话
  const handleEnd = () => {
    endCall();
    onClose?.();
  };

  // 获取 AnalyserNode 用于可视化
  const inputAnalyser = audioStreamer?.["ctx"]?.createAnalyser?.() || null;
  const outputAnalyser = pcmPlayer?.analyser || null;

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">语音通话</h2>
        <button
          onClick={handleEnd}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="关闭"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 音频可视化区域 */}
        <div className="flex-shrink-0 px-6 py-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* 输入音频可视化 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  你的声音
                </span>
                {isMuted && (
                  <span className="text-xs text-red-500 font-medium">
                    已静音
                  </span>
                )}
              </div>
              <AudioVisualizer
                analyser={inputAnalyser}
                type="input"
                isActive={status === "connected" && !isMuted}
              />
            </div>

            {/* 输出音频可视化 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  AI 回复
                </span>
                {isAISpeaking && (
                  <span className="text-xs text-blue-500 font-medium">
                    正在说话...
                  </span>
                )}
              </div>
              <AudioVisualizer
                analyser={outputAnalyser}
                type="output"
                isActive={isAISpeaking}
              />
            </div>
          </div>
        </div>

        {/* 转录显示区域 */}
        <div className="flex-1 overflow-hidden">
          <SubtitlePanel
            messages={messages}
            isLoading={status === "connecting"}
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* 控制条 */}
        <div className="flex-shrink-0">
          <ControlBar
            status={status}
            isMuted={isMuted}
            onStart={handleStart}
            onMute={toggleMute}
            onUnmute={toggleMute}
            onEnd={handleEnd}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(VoiceCallPanel);
