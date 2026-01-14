/**
 * 聊天详情页 - Web 桌面端 AI 对话界面
 */
import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Sparkles, Send, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import VoiceCallModal from "@/components/voice/VoiceCallModal";
import { chatWithOllamaStream, checkOllamaHealth } from "@/api/ollama";
import { ragPersonalizedQA } from "@/api/rag";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/hooks/use-toast";

interface LocationState {
  question?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const ChatDetailPage = () => {
  const { chatId } = useParams();
  const location = useLocation();
  const state = location.state as LocationState;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const [useRAG, setUseRAG] = useState(true);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);

  // 检查 Ollama 服务状态
  useEffect(() => {
    const checkOllama = async () => {
      const isAvailable = await checkOllamaHealth();
      setOllamaAvailable(isAvailable);
      if (!isAvailable) {
        toast({
          title: "提示",
          description: "Ollama 服务未启动，将使用模拟回复",
          variant: "default",
        });
      }
    };
    checkOllama();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 处理发送消息
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (useRAG && user?.id) {
        try {
          const ragAnswer = await ragPersonalizedQA({
            userId: user.id,
            question: message,
          });

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: ragAnswer,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, aiMessage]);
          setIsLoading(false);
          return;
        } catch (ragError) {
          console.warn("RAG检索失败，降级使用Ollama:", ragError);
        }
      }

      if (ollamaAvailable) {
        const aiMessageId = (Date.now() + 1).toString();
        const aiMessage: Message = {
          id: aiMessageId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);

        await chatWithOllamaStream(
          { message },
          (chunk: string) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            );
          },
          (error: Error) => {
            console.error("流式回复错误:", error);
            toast({
              title: "错误",
              description: error.message,
              variant: "destructive",
            });
          }
        );
        return;
      } else {
        setTimeout(() => {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "抱歉，AI 服务暂时不可用。请确保 Ollama 服务已启动或登录以使用RAG检索功能。",
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, aiMessage]);
          setIsLoading(false);
        }, 1000);
        return;
      }
    } catch (error) {
      console.error("AI 回复失败:", error);
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "AI 回复失败",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "抱歉，我遇到了一些问题，请稍后再试。",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const handleVoiceCallClick = () => {
    if (!user?.id) {
      toast({
        title: "请先登录",
        description: "语音通话功能需要登录后使用",
        variant: "destructive",
      });
      return;
    }
    setIsVoiceCallOpen(true);
  };

  useEffect(() => {
    if (state?.question && messages.length === 0 && ollamaAvailable !== null) {
      handleSendMessage(state.question);
    }
  }, [state?.question, chatId, ollamaAvailable]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* 顶部栏 */}
      <div className="border-b border-gray-200 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-black">AI 对话</h2>
            {user?.id && (
              <button
                onClick={() => setUseRAG(!useRAG)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  useRAG
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {useRAG ? "RAG 检索" : "普通对话"}
              </button>
            )}
          </div>
          <Button
            onClick={handleVoiceCallClick}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Phone className="w-4 h-4" />
            语音通话
          </Button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-4xl mx-auto px-8 py-6 h-full">
          {/* 欢迎语 */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-6">
                <Sparkles className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-semibold text-black mb-2">
                你好！我是 AI 助手
              </h2>
              <p className="text-gray-600 text-center max-w-md">
                我可以帮助你解答问题、提供建议或进行对话。
              </p>
            </div>
          )}

          {/* 消息列表 */}
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black flex items-center justify-center">
                    <Sparkles className="text-white" size={16} />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-black"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* 加载状态 */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black flex items-center justify-center">
                  <Sparkles className="text-white animate-pulse" size={16} />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* 底部输入区域 */}
      <div className="border-t border-gray-200 bg-white flex-shrink-0">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <div className="flex gap-3 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息... (Enter 发送)"
              rows={1}
              className="flex-1 resize-none min-h-[44px] max-h-[120px] border-gray-200"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="bg-black hover:bg-gray-800 text-white px-6"
              size="lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 语音通话模态框 */}
      {user?.id && (
        <VoiceCallModal
          open={isVoiceCallOpen}
          onOpenChange={setIsVoiceCallOpen}
          userId={user.id}
          sessionId={chatId}
          onTranscription={(role, text) => console.log("语音转录:", role, text)}
        />
      )}
    </div>
  );
};

export default ChatDetailPage;
