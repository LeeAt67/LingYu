/**
 * 转录显示面板组件
 * 功能: 显示语音转录文本、支持 Markdown 渲染
 *
 * @example
 * ```tsx
 * <SubtitlePanel
 *   messages={messages}
 *   isLoading={false}
 * />
 * ```
 */
import { useEffect, useRef, memo } from "react";
import ReactMarkdown from "react-markdown";
import type { TranscriptMessage } from "@/stores/useVoiceCallStore";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface SubtitlePanelProps {
  /** 转录消息列表 */
  messages: TranscriptMessage[];
  /** 是否加载中 */
  isLoading: boolean;
  /** 自定义类名 */
  className?: string;
}

const SubtitlePanel = ({
  messages,
  isLoading,
  className = "",
}: SubtitlePanelProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className={`h-full overflow-y-auto px-6 py-4 ${className}`}
    >
      <div className="max-w-2xl mx-auto space-y-4">
        {/* 空状态 */}
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-300 mb-4"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-gray-500 text-sm">
              开始通话后，对话内容将显示在这里
            </p>
          </div>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-3 text-sm text-gray-500">正在连接...</span>
          </div>
        )}

        {/* 消息列表 */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {/* 角色标签 */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-medium ${
                    message.role === "user" ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {message.role === "user" ? "你" : "AI"}
                </span>
                <span
                  className={`text-xs ${
                    message.role === "user" ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* 消息内容 */}
              <div
                className={`text-sm leading-relaxed ${
                  message.role === "user" ? "text-white" : "text-gray-900"
                }`}
              >
                <ReactMarkdown
                  components={{
                    // 自定义 Markdown 渲染样式
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                    code: ({ children }) => (
                      <code
                        className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                          message.role === "user"
                            ? "bg-blue-600 text-blue-50"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {children}
                      </code>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 my-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 my-2">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li className="ml-2">{children}</li>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {/* 滚动锚点 */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default memo(SubtitlePanel);
