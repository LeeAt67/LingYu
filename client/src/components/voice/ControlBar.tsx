/**
 * 语音通话控制条组件
 * 功能: 开始/结束通话、静音控制、状态显示
 *
 * @example
 * ```tsx
 * <ControlBar
 *   status="connected"
 *   isMuted={false}
 *   onStart={() => {}}
 *   onMute={() => {}}
 *   onEnd={() => {}}
 * />
 * ```
 */
import { memo } from "react";
import { Button } from "@/components/ui/button";
import MicrophoneIcon from "@/components/icons/MicrophoneIcon";
import TelephoneIcon from "@/components/icons/TelephoneIcon";
import type { VoiceCallStatus } from "@/stores/useVoiceCallStore";

interface ControlBarProps {
  /** 通话状态 */
  status: VoiceCallStatus;
  /** 是否静音 */
  isMuted: boolean;
  /** 开始通话回调 */
  onStart: () => void;
  /** 静音回调 */
  onMute: () => void;
  /** 取消静音回调 */
  onUnmute: () => void;
  /** 结束通话回调 */
  onEnd: () => void;
  /** 自定义类名 */
  className?: string;
}

const ControlBar = ({
  status,
  isMuted,
  onStart,
  onMute,
  onUnmute,
  onEnd,
  className = "",
}: ControlBarProps) => {
  // 状态指示器
  const StatusIndicator = () => {
    if (status === "idle") {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span>未连接</span>
        </div>
      );
    }

    if (status === "connecting") {
      return (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>连接中...</span>
        </div>
      );
    }

    if (status === "connected") {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>已连接</span>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>连接失败</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`px-6 py-4 bg-white border-t border-gray-200 ${className}`}>
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* 状态指示器 */}
        <StatusIndicator />

        {/* 控制按钮 */}
        <div className="flex items-center gap-3">
          {status === "idle" || status === "error" ? (
            // 开始通话按钮
            <Button
              onClick={onStart}
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white rounded-full px-8"
            >
              <TelephoneIcon size={20} className="mr-2" />
              开始通话
            </Button>
          ) : (
            <>
              {/* 静音/取消静音按钮 */}
              <Button
                onClick={isMuted ? onUnmute : onMute}
                variant={isMuted ? "destructive" : "outline"}
                size="icon"
                className="rounded-full w-12 h-12"
                aria-label={isMuted ? "取消静音" : "静音"}
              >
                {isMuted ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="1" y1="1" x2="19" y2="19" />
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                    <line x1="10" y1="19" x2="10" y2="23" />
                  </svg>
                ) : (
                  <MicrophoneIcon size={20} />
                )}
              </Button>

              {/* 结束通话按钮 */}
              <Button
                onClick={onEnd}
                variant="destructive"
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 2.59 3.4z" />
                  <line x1="23" y1="1" x2="1" y2="23" />
                </svg>
                结束通话
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ControlBar);
