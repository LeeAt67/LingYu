/**
 * 聊天详情页 - 全屏AI聊天界面（无底部导航栏）
 */
import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Sparkles, Phone } from "lucide-react";
import ChatInput from "@/components/ChatInput";
import UserIcon from "@/components/icons/UserIcon";
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
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const [useRAG, setUseRAG] = useState(true); // 默认启用RAG检索
  const [isRecording, setIsRecording] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true); // 显示欢迎语
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false); // 语音通话模态框状态
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // 快捷功能按钮 - 根据RAG模式动态调整
  const quickActions =
    useRAG && user?.id
      ? [
          {
            id: "1",
            label: "📚 总结我的学习内容",
            prompt: "请总结一下我最近学习的内容",
          },
          {
            id: "2",
            label: "💡 推荐学习主题",
            prompt: "根据我的学习历史，推荐一些新的学习主题",
          },
          { id: "3", label: "🔍 查找相关知识", prompt: "帮我找出相关的知识点" },
          { id: "4", label: "📝 复习提醒", prompt: "有哪些内容需要复习？" },
        ]
      : [
          { id: "1", label: "深度思考", prompt: "" },
          { id: "2", label: "帮我写作", prompt: "" },
          { id: "3", label: "AI 创作", prompt: "" },
          { id: "4", label: "打电话", prompt: "" },
        ];

  // 处理快捷操作点击
  const handleQuickAction = (action: (typeof quickActions)[0]) => {
    if (action.prompt) {
      handleSendMessage(action.prompt);
    }
  };

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

    // 隐藏欢迎语
    setShowWelcome(false);

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 优先使用RAG检索（如果用户已登录且启用RAG）
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
          // RAG失败时降级到Ollama
        }
      }

      // 使用 Ollama AI
      if (ollamaAvailable) {
        // 使用 Ollama AI 流式回复
        const aiMessageId = (Date.now() + 1).toString();
        const aiMessage: Message = {
          id: aiMessageId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };

        // 先添加空的 AI 消息
        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false); // 开始接收流式数据,取消加载状态

        // 流式接收 AI 回复
        await chatWithOllamaStream(
          { message },
          (chunk: string) => {
            // 每次收到新的文本块,更新消息内容
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

        return; // 流式处理完成,直接返回
      } else {
        // 模拟回复（Ollama 不可用时）
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

  // 处理图片上传
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "文件类型错误",
        description: "请选择图片文件",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "图片大小不能超过5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;

        // 添加图片消息到聊天
        const imageMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: `[图片] ${file.name}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, imageMessage]);

        toast({
          title: "图片已上传",
          description: "图片上传成功，可以继续提问",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("图片处理失败:", error);
      toast({
        title: "处理失败",
        description: "图片处理时出现错误",
        variant: "destructive",
      });
    }

    event.target.value = "";
  };

  // 处理语音输入
  const handleMicClick = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        title: "不支持语音识别",
        description: "您的浏览器不支持语音识别功能，请使用Chrome或Edge浏览器",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        toast({
          title: "开始录音",
          description: "请说话...",
        });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
          toast({
            title: "识别成功",
            description: `识别内容：${transcript}`,
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error("语音识别错误:", event.error);
        setIsRecording(false);

        let errorMessage = "语音识别失败";
        if (event.error === "no-speech") {
          errorMessage = "未检测到语音，请重试";
        } else if (event.error === "network") {
          errorMessage = "网络错误，请检查网络连接";
        } else if (event.error === "not-allowed") {
          errorMessage = "请允许使用麦克风权限";
        }

        toast({
          title: "识别失败",
          description: errorMessage,
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error("启动语音识别失败:", error);
      toast({
        title: "启动失败",
        description: "无法启动语音识别",
        variant: "destructive",
      });
    }
  };

  const handlePlusClick = () => {
    console.log("打开附件选择");
    // TODO: 实现附件上传功能
  };

  // 打开语音通话
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

  // 处理语音转录（将转录内容添加到聊天消息）
  const handleVoiceTranscription = (
    role: "user" | "assistant",
    text: string
  ) => {
    // 可选：将语音转录同步到文本聊天界面
    console.log("语音转录:", role, text);
  };

  // 返回上一页
  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    // 如果有初始问题，等待 Ollama 检查完成后自动发送
    if (state?.question && messages.length === 0 && ollamaAvailable !== null) {
      handleSendMessage(state.question);
    }
  }, [state?.question, chatId, ollamaAvailable]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 顶部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* 返回按钮 */}
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <h1 className="flex-1 text-lg font-semibold text-gray-900">好词</h1>

          {/* RAG模式指示器 */}
          {user?.id && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUseRAG(!useRAG)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  useRAG
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {useRAG ? "RAG检索" : "AI对话"}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 语音通话按钮 */}
          <button
            onClick={handleVoiceCallClick}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
            title="语音通话"
          >
            <Phone className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
          </button>

          {/* 新建聊天按钮 */}
          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        {/* 欢迎语 - 当没有消息时显示 */}
        {messages.length === 0 && showWelcome && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
              <Sparkles className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              你好！我是 HaoCi (好词) 学习平台的智能助手
            </h2>
            <p className="text-gray-500 text-center max-w-md">
              专门帮助你学习语言知识。
            </p>
          </div>
        )}

        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* 头像 */}
              <div className="flex-shrink-0">
                {message.role === "user" ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <UserIcon className="text-white" size={24} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="text-white" size={20} />
                  </div>
                )}
              </div>

              {/* 消息气泡 */}
              <div
                className={`max-w-[70%] rounded-xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-900 border border-gray-200"
                }`}
              >
                <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {/* 加载状态 */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="text-white animate-pulse" size={20} />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
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
                  <span className="text-sm text-gray-500">AI 正在思考...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 底部区域 */}
      <div className="border-t border-gray-200">
        {/* 快捷功能按钮 */}
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              disabled={isLoading}
              className="flex-shrink-0 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* 输入框区域 */}
        <ChatInput
          placeholder={isRecording ? "正在录音..." : "输入你的问题..."}
          onSend={handleSendMessage}
          onCameraClick={handleCameraClick}
          onMicClick={handleMicClick}
          onPlusClick={handlePlusClick}
        />
      </div>

      {/* 隐藏的文件输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 语音通话模态框 */}
      {user?.id && (
        <VoiceCallModal
          open={isVoiceCallOpen}
          onOpenChange={setIsVoiceCallOpen}
          userId={user.id}
          sessionId={chatId}
          onTranscription={handleVoiceTranscription}
        />
      )}
    </div>
  );
};

export default ChatDetailPage;
