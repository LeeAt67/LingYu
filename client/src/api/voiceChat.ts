import { apiClient } from './client';

export interface VoiceSession {
  id: string;
  userId: string;
  chatId?: string;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  model: string;
}

export interface VoiceMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: string;
}

export interface VoiceSessionDetail extends VoiceSession {
  messages: VoiceMessage[];
}

export const voiceChatApi = {
  /**
   * 创建语音会话
   */
  createSession: async (chatId?: string, model?: string): Promise<VoiceSession> => {
    const response = await apiClient.post('/voice-chat/sessions', {
      chatId,
      model,
    });
    return response.data.data;
  },

  /**
   * 保存转录文本
   */
  saveTranscription: async (
    sessionId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<{ messageId: string }> => {
    const response = await apiClient.post('/voice-chat/transcription', {
      sessionId,
      role,
      content,
    });
    return response.data.data;
  },

  /**
   * 获取语音会话详情
   */
  getSession: async (sessionId: string): Promise<VoiceSessionDetail> => {
    const response = await apiClient.get(`/voice-chat/session/${sessionId}`);
    return response.data.data;
  },

  /**
   * 获取用户语音历史
   */
  getHistory: async (userId: string): Promise<VoiceSession[]> => {
    const response = await apiClient.get(`/voice-chat/history/${userId}`);
    return response.data.data;
  },

  /**
   * 结束语音会话
   */
  endSession: async (sessionId: string): Promise<VoiceSession> => {
    const response = await apiClient.put(`/voice-chat/session/${sessionId}/end`);
    return response.data.data;
  },
};
