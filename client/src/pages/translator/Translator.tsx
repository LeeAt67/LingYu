import { useEffect, useRef, useState } from "react";
import { LanguageSelector } from "./LanguageSelector";
import { ProgressBar } from "./ProgressBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { WorkerMessage, ProgressItem } from "./types";

/**
 * 翻译器主页面组件
 * 提供浏览器端机器学习翻译功能，支持 200+ 种语言
 */
export const Translator = () => {
  // 组件状态
  const [ready, setReady] = useState<boolean | null>(null);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [input, setInput] = useState<string>("I love walking my dog.");
  const [output, setOutput] = useState<string>("");
  const [sourceLanguage, setSourceLanguage] = useState<string>("eng_Latn");
  const [targetLanguage, setTargetLanguage] = useState<string>("zho_Hans");
  const [error, setError] = useState<string | null>(null);

  // Worker 引用
  const worker = useRef<Worker | null>(null);

  // Toast hook
  const { toast } = useToast();

  // Worker 初始化和清理
  useEffect(() => {
    if (!worker.current) {
      console.log("[Translator] 创建 Worker 实例...");
      // 创建 Worker 实例
      worker.current = new Worker(
        new URL("../../workers/translationWorker.ts", import.meta.url),
        {
          type: "module",
        }
      );
      console.log("[Translator] Worker 实例已创建");
    }

    // Worker 消息处理函数
    const onMessageReceived = (e: MessageEvent<WorkerMessage>) => {
      console.log("[Translator] 收到 Worker 消息:", e.data);
      handleWorkerMessage(e.data);
    };

    // Worker 错误处理
    const onError = (error: ErrorEvent) => {
      console.error("[Translator] Worker 错误:", error);
      handleError(new Error(error.message || "Worker 发生错误"));
    };

    // 添加事件监听器
    worker.current.addEventListener("message", onMessageReceived);
    worker.current.addEventListener("error", onError);

    // 清理函数：组件卸载时移除事件监听器
    return () => {
      if (worker.current) {
        worker.current.removeEventListener("message", onMessageReceived);
        worker.current.removeEventListener("error", onError);
      }
    };
  }, []);

  // Worker 消息处理函数
  const handleWorkerMessage = (message: WorkerMessage) => {
    switch (message.status) {
      case "initiate":
        // 模型文件开始加载：添加新的进度项
        setReady(false);
        setProgressItems((prev) => [
          ...prev,
          {
            file: message.file,
            progress: 0,
            status: "initiate",
          },
        ]);
        break;

      case "progress":
        // 模型文件加载进度：更新进度项
        setProgressItems((prev) =>
          prev.map((item) => {
            if (item.file === message.file) {
              return { ...item, progress: message.progress };
            }
            return item;
          })
        );
        break;

      case "done":
        // 模型文件加载完成：移除进度项
        setProgressItems((prev) =>
          prev.filter((item) => item.file !== message.file)
        );
        break;

      case "ready":
        // Pipeline 准备就绪：Worker 可以接受翻译请求
        setReady(true);
        break;

      case "update":
        // 翻译更新：更新输出文本
        setOutput(message.output);
        break;

      case "complete":
        // 翻译完成：重新启用翻译按钮
        setDisabled(false);
        break;

      case "error":
        // 错误处理：显示错误消息并重新启用按钮
        handleError(new Error(message.error));
        setDisabled(false);
        break;
    }
  };

  // 错误处理函数
  const handleError = (error: Error) => {
    console.error("[Translator Error]", error);
    setError(error.message);

    // 使用 toast 显示错误消息
    toast({
      variant: "destructive",
      title: "翻译错误",
      description: error.message,
    });
  };

  // 翻译功能
  const handleTranslate = () => {
    console.log("[Translator] handleTranslate 被调用");
    console.log(
      "[Translator] Worker 状态:",
      worker.current ? "存在" : "不存在"
    );
    console.log("[Translator] 输入文本:", input);
    console.log("[Translator] Ready 状态:", ready);

    if (!worker.current || !input.trim()) {
      console.log("[Translator] 翻译被阻止 - Worker 或输入为空");
      return;
    }

    // 清除之前的错误
    setError(null);
    // 禁用翻译按钮
    setDisabled(true);
    // 清空输出
    setOutput("");

    console.log("[Translator] 发送翻译请求到 Worker");
    // 向 Worker 发送翻译请求
    worker.current.postMessage({
      text: input,
      src_lang: sourceLanguage,
      tgt_lang: targetLanguage,
    });
  };

  // 输入处理
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // 语言选择处理
  const handleSourceLanguageChange = (value: string) => {
    setSourceLanguage(value);
  };

  const handleTargetLanguageChange = (value: string) => {
    setTargetLanguage(value);
  };

  // 错误恢复
  const handleRetry = () => {
    // 清除错误状态
    setError(null);
    // 如果需要，可以重新初始化 Worker
    // 这里我们只是清除错误，让用户可以重新尝试翻译
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* 顶部栏 */}
      <div className="border-b border-gray-200 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-8 py-3">
          <h2 className="text-lg font-semibold text-black">AI 翻译器</h2>
        </div>
      </div>

      {/* 主内容 */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <div className="w-full max-w-6xl h-full flex flex-col">
          {/* 主卡片 */}
          <Card className="flex-1 p-6 border-gray-200 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              {/* 语言选择器 */}
              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                <LanguageSelector
                  type="source"
                  value={sourceLanguage}
                  onChange={handleSourceLanguageChange}
                  disabled={disabled}
                />
                <LanguageSelector
                  type="target"
                  value={targetLanguage}
                  onChange={handleTargetLanguageChange}
                  disabled={disabled}
                />
              </div>

              {/* 文本输入区域 */}
              <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
                <div className="flex flex-col gap-2 min-h-0">
                  <label className="text-sm font-medium text-black flex-shrink-0">
                    源文本
                  </label>
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="输入要翻译的文本..."
                    disabled={disabled}
                    className="resize-none border-gray-200 flex-1 min-h-0"
                  />
                </div>
                <div className="flex flex-col gap-2 min-h-0">
                  <label className="text-sm font-medium text-black flex-shrink-0">
                    翻译结果
                  </label>
                  <Textarea
                    value={output}
                    readOnly
                    placeholder="翻译结果将显示在这里..."
                    className="resize-none bg-gray-50 border-gray-200 flex-1 min-h-0"
                  />
                </div>
              </div>

              {/* 进度条或错误提示 */}
              {ready === false && (
                <div className="flex-shrink-0 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 text-center mb-2">
                    正在加载模型...（首次加载需要一些时间）
                  </p>
                  <div className="space-y-2 max-h-20 overflow-y-auto">
                    {progressItems.map((item) => (
                      <ProgressBar
                        key={item.file}
                        fileName={item.file}
                        progress={item.progress}
                      />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="flex-shrink-0 p-3 bg-red-50 rounded-lg border border-red-200 flex items-center justify-between">
                  <p className="text-xs text-red-600">{error}</p>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    清除
                  </Button>
                </div>
              )}

              {/* 翻译按钮 */}
              <div className="flex justify-center flex-shrink-0">
                <Button
                  onClick={handleTranslate}
                  disabled={disabled || !ready}
                  size="lg"
                  className="px-12 bg-black hover:bg-gray-800 text-white"
                >
                  {disabled ? "翻译中..." : "翻译"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
