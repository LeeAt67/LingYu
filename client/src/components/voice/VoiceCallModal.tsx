/**
 * 语音通话模态框组件
 * 功能: 包装VoiceCallPanel，提供模态框和全屏模式
 *
 * @example
 * ```tsx
 * <VoiceCallModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   userId="user123"
 * />
 * ```
 */
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Maximize2, Minimize2, X } from "lucide-react";
import VoiceCallPanel from "./VoiceCallPanel";

interface VoiceCallModalProps {
  /** 是否打开模态框 */
  open: boolean;
  /** 打开状态变化回调 */
  onOpenChange: (open: boolean) => void;
  /** 用户ID */
  userId: string;
  /** 会话ID（可选） */
  sessionId?: string;
  /** 转录回调 */
  onTranscription?: (role: "user" | "assistant", text: string) => void;
}

const VoiceCallModal = ({
  open,
  onOpenChange,
  userId,
  sessionId,
  onTranscription,
}: VoiceCallModalProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={`fixed z-50 bg-white shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ${
            isFullscreen
              ? "inset-0 rounded-none"
              : "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-4xl h-[85vh] rounded-2xl"
          }`}
        >
          {/* 自定义头部（带全屏切换按钮） */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white z-10 rounded-t-2xl">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              语音通话
            </Dialog.Title>
            <div className="flex items-center gap-2">
              {/* 全屏切换按钮 */}
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={isFullscreen ? "退出全屏" : "全屏"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-gray-600" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {/* 关闭按钮 */}
              <Dialog.Close asChild>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="关闭"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* VoiceCallPanel 内容 */}
          <div className="h-full pt-16">
            <VoiceCallPanel
              userId={userId}
              sessionId={sessionId}
              onClose={handleClose}
              onTranscription={onTranscription}
              className="h-full"
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default VoiceCallModal;
