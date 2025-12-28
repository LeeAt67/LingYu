import { create } from 'zustand';
import { RealtimeWsClient } from '../rtc/RealtimeWsClient';
import { AudioStreamer } from '../rtc/AudioStreamer';
import { Pcm24Player } from '../rtc/PcmPlayer';
import { voiceChatApi } from '../api/voiceChat';

export interface TranscriptMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type VoiceCallStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface VoiceCallState {
  // State
  status: VoiceCallStatus;
  isMuted: boolean;
  isAISpeaking: boolean;
  messages: TranscriptMessage[];
  error: string | null;

  // Audio instances
  wsClient: RealtimeWsClient | null;
  audioStreamer: AudioStreamer | null;
  pcmPlayer: Pcm24Player | null;

  // Current session info
  userId: string | null;
  sessionId: string | null;
  voiceSessionId: string | null; // 语音会话ID（用于保存到数据库）

  // Actions
  startCall: (userId: string, sessionId?: string) => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  handleInterrupt: () => void;
  addMessage: (role: 'user' | 'assistant', content: string, saveToDb?: boolean) => void;
  setStatus: (status: VoiceCallStatus) => void;
  setError: (error: string | null) => void;
  setAISpeaking: (speaking: boolean) => void;
}

export const useVoiceCallStore = create<VoiceCallState>((set, get) => ({
  // Initial state
  status: 'idle',
  isMuted: false,
  isAISpeaking: false,
  messages: [],
  error: null,
  wsClient: null,
  audioStreamer: null,
  pcmPlayer: null,
  userId: null,
  sessionId: null,
  voiceSessionId: null,

  // Actions
  startCall: async (userId: string, sessionId?: string) => {
    const state = get();
    
    // 如果已经在通话中，先结束当前通话
    if (state.status !== 'idle') {
      state.endCall();
    }

    try {
      set({ 
        status: 'connecting', 
        error: null, 
        userId, 
        sessionId: sessionId || `session_${Date.now()}`,
        messages: []
      });

      // 创建语音会话（保存到数据库）
      let voiceSessionId: string | null = null;
      try {
        const voiceSession = await voiceChatApi.createSession(sessionId);
        voiceSessionId = voiceSession.id;
        set({ voiceSessionId });
        console.log('✅ 语音会话已创建:', voiceSessionId);
      } catch (err) {
        console.error('创建语音会话失败:', err);
        // 不阻塞通话，继续执行
      }

      // 请求麦克风权限
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err: any) {
        console.error('麦克风权限错误:', err);
        let errorMessage = '无法访问麦克风';
        if (err.name === 'NotAllowedError') {
          errorMessage = '请允许使用麦克风以进行语音通话';
        } else if (err.name === 'NotFoundError') {
          errorMessage = '未检测到麦克风设备';
        }
        set({ status: 'error', error: errorMessage });
        return;
      }

      // 创建 PcmPlayer 实例
      const pcmPlayer = new Pcm24Player();
      pcmPlayer.setSampleRateHz(24000);

      // 创建 WebSocket 客户端
      const wsClient = new RealtimeWsClient({
        onOpen: () => {
          console.log('✅ WebSocket 连接已建立');
          set({ status: 'connected' });
        },
        onClose: (code, reason) => {
          console.log('❌ WebSocket 连接已关闭', code, reason);
          const currentState = get();
          if (currentState.status !== 'idle') {
            set({ status: 'error', error: '连接已断开' });
          }
        },
        onError: (err) => {
          console.error('WebSocket 错误:', err);
          set({ status: 'error', error: 'WebSocket 连接失败' });
        },
        onMessage: (data) => {
          const currentState = get();
          if (!data || typeof data !== 'object') return;

          // 处理音频响应
          if (data.type === 'response.audio.delta' && data.delta) {
            currentState.setAISpeaking(true);
            pcmPlayer.playBase64Pcm24(data.delta).catch((err) => {
              console.error('音频播放失败:', err);
            });
          }

          // 处理音频响应完成
          if (data.type === 'response.audio.done') {
            currentState.setAISpeaking(false);
          }

          // 处理文本转录
          if (data.type === 'response.audio_transcript.delta' && data.delta) {
            // 累积转录文本
            const lastMessage = currentState.messages[currentState.messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              // 更新最后一条消息
              set({
                messages: [
                  ...currentState.messages.slice(0, -1),
                  {
                    ...lastMessage,
                    content: lastMessage.content + data.delta,
                  },
                ],
              });
            } else {
              // 创建新消息
              currentState.addMessage('assistant', data.delta);
            }
          }

          // 处理用户输入转录
          if (data.type === 'conversation.item.input_audio_transcription.completed' && data.transcript) {
            currentState.addMessage('user', data.transcript);
          }

          // 处理错误
          if (data.type === 'error') {
            console.error('AI 模型错误:', data.error);
            set({ error: data.error?.message || 'AI 服务错误' });
          }
        },
      });

      // 连接 WebSocket
      const model = 'qwen3-omni-flash-realtime';
      const voice = 'default';
      wsClient.connect(model, voice);

      // 创建 AudioStreamer 实例
      const audioStreamer = new AudioStreamer({
        sampleRateOut: 16000,
        appendMs: 200,
        mode: 'vad',
        enableClientVAD: true, // 启用客户端 VAD 用于打断
        sendJson: (payload) => {
          wsClient.sendJson(payload);
        },
        onUserSpeaking: () => {
          // 用户开始说话，触发打断
          const currentState = get();
          if (currentState.isAISpeaking) {
            console.log('🛑 检测到用户说话，打断 AI');
            currentState.handleInterrupt();
          }
        },
        onError: (err) => {
          console.error('AudioStreamer 错误:', err);
        },
      });

      // 开始音频捕获
      await audioStreamer.start(stream);

      set({ 
        wsClient, 
        audioStreamer, 
        pcmPlayer,
      });

    } catch (err: any) {
      console.error('启动通话失败:', err);
      set({ 
        status: 'error', 
        error: err.message || '启动通话失败' 
      });
    }
  },

  endCall: () => {
    const state = get();

    // 结束语音会话（保存到数据库）
    if (state.voiceSessionId) {
      voiceChatApi.endSession(state.voiceSessionId)
        .then(() => {
          console.log('✅ 语音会话已结束');
        })
        .catch((err) => {
          console.error('结束语音会话失败:', err);
        });
    }

    // 停止音频捕获
    if (state.audioStreamer) {
      state.audioStreamer.stop().catch(console.error);
    }

    // 关闭 WebSocket
    if (state.wsClient) {
      state.wsClient.close();
    }

    // 停止音频播放
    if (state.pcmPlayer) {
      state.pcmPlayer.stopAll();
    }

    // 重置状态
    set({
      status: 'idle',
      isMuted: false,
      isAISpeaking: false,
      error: null,
      wsClient: null,
      audioStreamer: null,
      pcmPlayer: null,
      userId: null,
      sessionId: null,
      voiceSessionId: null,
    });
  },

  toggleMute: () => {
    const state = get();
    const newMutedState = !state.isMuted;

    if (state.audioStreamer) {
      if (newMutedState) {
        // 静音：停止音频捕获
        state.audioStreamer.stop().catch(console.error);
      } else {
        // 取消静音：重新开始音频捕获
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            if (state.audioStreamer) {
              state.audioStreamer.start(stream).catch(console.error);
            }
          })
          .catch((err) => {
            console.error('恢复音频捕获失败:', err);
            set({ error: '无法恢复麦克风' });
          });
      }
    }

    set({ isMuted: newMutedState });
  },

  handleInterrupt: () => {
    const state = get();

    // 立即停止 AI 音频播放
    if (state.pcmPlayer) {
      state.pcmPlayer.stopAll();
    }

    // 发送打断信号到后端
    if (state.wsClient) {
      state.wsClient.sendJson({
        type: 'response.cancel',
        event_id: `event_${Date.now()}`,
      });
    }

    set({ isAISpeaking: false });
  },

  addMessage: (role: 'user' | 'assistant', content: string, saveToDb: boolean = true) => {
    const state = get();
    const newMessage: TranscriptMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      role,
      content,
      timestamp: Date.now(),
    };
    set({ messages: [...state.messages, newMessage] });

    // 自动保存到数据库
    if (saveToDb && state.voiceSessionId) {
      voiceChatApi.saveTranscription(state.voiceSessionId, role, content)
        .then(() => {
          console.log('✅ 转录已保存:', role, content.substring(0, 50));
        })
        .catch((err) => {
          console.error('保存转录失败:', err);
          // 不影响用户体验，静默失败
        });
    }
  },

  setStatus: (status: VoiceCallStatus) => {
    set({ status });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setAISpeaking: (speaking: boolean) => {
    set({ isAISpeaking: speaking });
  },
}));
