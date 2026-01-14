/**
 * 翻译器类型定义文件
 */

/**
 * 进度项接口
 * 用于追踪模型文件加载进度
 */
export interface ProgressItem {
  file: string;
  progress: number;
  status: "initiate" | "progress" | "done";
}

/**
 * 翻译器状态接口
 * 管理翻译组件的所有状态
 */
export interface TranslatorState {
  ready: boolean | null;
  disabled: boolean;
  progressItems: ProgressItem[];
  input: string;
  output: string;
  sourceLanguage: string;
  targetLanguage: string;
  error: string | null;
}

/**
 * Worker 消息类型
 * 定义 Worker 和主线程之间的通信消息格式
 */
export type WorkerMessage =
  | ModelInitiateMessage
  | ModelProgressMessage
  | ModelDoneMessage
  | ModelReadyMessage
  | TranslationUpdateMessage
  | TranslationCompleteMessage
  | ErrorMessage;

export interface ModelInitiateMessage {
  status: "initiate";
  file: string;
}

export interface ModelProgressMessage {
  status: "progress";
  file: string;
  progress: number;
}

export interface ModelDoneMessage {
  status: "done";
  file: string;
}

export interface ModelReadyMessage {
  status: "ready";
}

export interface TranslationUpdateMessage {
  status: "update";
  output: string;
}

export interface TranslationCompleteMessage {
  status: "complete";
  output: any;
}

export interface ErrorMessage {
  status: "error";
  error: string;
}
