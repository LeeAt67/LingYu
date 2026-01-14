import {
  pipeline,
  type TranslationPipeline as TranslationPipelineType,
} from "@xenova/transformers";

/**
 * 翻译 Pipeline 单例类
 * 使用单例模式确保模型只加载一次，避免重复加载的开销
 */
class TranslationPipeline {
  static task = "translation" as const;
  static model = "Xenova/nllb-200-distilled-600M";
  static instance: TranslationPipelineType | null = null;

  static async getInstance(
    progress_callback?: (progress: any) => void
  ): Promise<TranslationPipelineType> {
    if (this.instance === null) {
      console.log("[Worker] 开始初始化翻译模型...");
      this.instance = (await pipeline(this.task, this.model, {
        progress_callback,
      })) as TranslationPipelineType;
      console.log("[Worker] 翻译模型初始化完成");
    }
    return this.instance;
  }
}

let modelReady = false;

// 监听来自主线程的消息
self.addEventListener("message", async (event) => {
  try {
    console.log("[Worker] 收到翻译请求:", event.data);

    // 获取翻译 pipeline，首次调用时会加载模型
    const translator = await TranslationPipeline.getInstance((x: any) => {
      // 添加进度回调以跟踪模型加载
      console.log("[Worker] 模型加载进度:", x);
      self.postMessage(x);
    });

    console.log("[Worker] 模型已准备好，开始翻译...");

    // 仅在首次加载后发送 ready 消息
    if (!modelReady) {
      modelReady = true;
      self.postMessage({
        status: "ready",
      });
    }

    // 执行翻译
    const output = await translator(event.data.text, {
      tgt_lang: event.data.tgt_lang,
      src_lang: event.data.src_lang,
      // 允许部分输出
      callback_function: (x: any) => {
        self.postMessage({
          status: "update",
          output: translator.tokenizer.decode(x[0].output_token_ids, {
            skip_special_tokens: true,
          }),
        });
      },
    } as any);

    console.log("[Worker] 翻译完成:", output);

    // 发送翻译结果到主线程
    self.postMessage({
      status: "complete",
      output: output,
    });
  } catch (error) {
    // 全局错误处理
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("[Translation Worker Error]", error);
    self.postMessage({
      status: "error",
      error: errorMessage,
    });
  }
});

console.log("[Worker] Worker 脚本已加载，等待翻译请求...");
