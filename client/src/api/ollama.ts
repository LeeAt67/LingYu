/**
 * Ollama API 接口
 */
import { apiClient } from './client'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  message: string
  context?: string[]
  history?: ChatMessage[]
}

export interface ChatResponse {
  success: boolean
  data: {
    response: string
    timestamp: string
  }
}

/**
 * 检查 Ollama 服务状态
 */
export const checkOllamaHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/ollama/health')
    return response.data.success
  } catch (error) {
    console.error('检查 Ollama 状态失败:', error)
    return false
  }
}

/**
 * 获取已安装的模型列表
 */
export const getOllamaModels = async (): Promise<string[]> => {
  try {
    const response = await apiClient.get('/ollama/models')
    return response.data.data || []
  } catch (error) {
    console.error('获取模型列表失败:', error)
    return []
  }
}

/**
 * 与 AI 对话
 */
export const chatWithOllama = async (request: ChatRequest): Promise<string> => {
  try {
    const response = await apiClient.post<ChatResponse>('/ollama/chat', request)
    return response.data.data.response
  } catch (error: any) {
    console.error('Ollama 聊天失败:', error)
    throw new Error(error.response?.data?.message || 'AI 服务暂时不可用')
  }
}

/**
 * 与 AI 对话（流式输出）
 */
export const chatWithOllamaStream = async (
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  onError?: (error: Error) => void
): Promise<void> => {
  try {
    const response = await fetch('http://localhost:5000/api/ollama/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error('流式请求失败')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('无法读取响应流')
    }

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break

      const text = decoder.decode(value)
      const lines = text.split('\n').filter(line => line.trim().startsWith('data:'))

      for (const line of lines) {
        try {
          const data = JSON.parse(line.replace('data:', '').trim())
          
          if (data.error) {
            throw new Error(data.error)
          }
          
          if (data.chunk) {
            onChunk(data.chunk)
          }
          
          if (data.done) {
            return
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  } catch (error) {
    console.error('流式聊天失败:', error)
    if (onError) {
      onError(error instanceof Error ? error : new Error('流式聊天失败'))
    }
    throw error
  }
}

/**
 * 生成学习推荐问题
 */
export const getOllamaRecommendations = async (contents: string[]): Promise<string[]> => {
  try {
    const response = await apiClient.post('/ollama/recommendations', { contents })
    return response.data.data || []
  } catch (error) {
    console.error('生成推荐问题失败:', error)
    return []
  }
}
