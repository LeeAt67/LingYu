/**
 * Ollama 服务
 * 本地运行大语言模型，提供智能对话功能
 */
import axios from 'axios'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OllamaGenerateRequest {
  model: string
  prompt: string
  stream?: boolean
  options?: {
    temperature?: number
    top_p?: number
    top_k?: number
    num_predict?: number
  }
}

interface OllamaGenerateResponse {
  model: string
  created_at: string
  response: string
  done: boolean
}

export class OllamaService {
  private baseURL: string
  private defaultModel: string

  constructor() {
    // Ollama 默认运行在 11434 端口
    this.baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    this.defaultModel = process.env.OLLAMA_MODEL || 'qwen2.5:0.5b'
  }

  /**
   * 检查 Ollama 服务是否可用
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 3000
      })
      return response.status === 200
    } catch (error) {
      console.error('Ollama 服务不可用:', error)
      return false
    }
  }

  /**
   * 获取已安装的模型列表
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`)
      return response.data.models?.map((m: any) => m.name) || []
    } catch (error) {
      console.error('获取模型列表失败:', error)
      return []
    }
  }

  /**
   * 聊天对话（非流式）
   */
  async chat(
    message: string,
    context: string[] = [],
    history: ChatMessage[] = []
  ): Promise<string> {
    try {
      const prompt = this.buildPrompt(message, context, history)

      const response = await axios.post<OllamaGenerateResponse>(
        `${this.baseURL}/api/generate`,
        {
          model: this.defaultModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 512,
          }
        } as OllamaGenerateRequest,
        {
          timeout: 60000, // 60秒超时
        }
      )

      return response.data.response
    } catch (error) {
      console.error('Ollama 聊天失败:', error)
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Ollama 服务未启动，请先运行 Ollama')
        }
        if (error.response?.status === 404) {
          throw new Error(`模型 ${this.defaultModel} 未安装，请运行: ollama pull ${this.defaultModel}`)
        }
      }
      
      throw new Error('AI 服务暂时不可用，请稍后重试')
    }
  }

  /**
   * 聊天对话（流式输出）
   */
  async *chatStream(
    message: string,
    context: string[] = [],
    history: ChatMessage[] = []
  ): AsyncGenerator<string> {
    try {
      const prompt = this.buildPrompt(message, context, history)

      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        {
          model: this.defaultModel,
          prompt: prompt,
          stream: true,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 512,
          }
        } as OllamaGenerateRequest,
        {
          responseType: 'stream',
          timeout: 60000,
        }
      )

      // 处理流式响应
      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n').filter((line: string) => line.trim())
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line) as OllamaGenerateResponse
            if (data.response) {
              yield data.response
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    } catch (error) {
      console.error('Ollama 流式聊天失败:', error)
      throw new Error('AI 服务暂时不可用')
    }
  }

  /**
   * 构建提示词
   */
  private buildPrompt(
    message: string,
    context: string[],
    history: ChatMessage[]
  ): string {
    let prompt = `你是 HaoCi (好词) 学习平台的智能助手，专门帮助用户学习和理解语言知识。

重要身份设定：
- 你的名字是"好词助手"
- 你是 HaoCi 应用的专属 AI 助手
- 当用户问"你是谁"时，回答："我是 HaoCi (好词) 学习平台的智能助手，专门帮助你学习语言知识。"
- 不要提及你是由阿里云、通义千问或其他公司训练的
- 专注于提供语言学习方面的帮助

请用简洁、清晰、友好的中文回答问题。

`

    // 添加用户学习内容作为上下文
    if (context.length > 0) {
      prompt += '用户的学习内容：\n'
      context.slice(0, 5).forEach((item, index) => {
        prompt += `${index + 1}. ${item}\n`
      })
      prompt += '\n'
    }

    // 添加历史对话（最近5轮）
    if (history.length > 0) {
      prompt += '对话历史：\n'
      history.slice(-10).forEach((msg) => {
        const role = msg.role === 'user' ? '用户' : '助手'
        prompt += `${role}：${msg.content}\n`
      })
      prompt += '\n'
    }

    // 添加当前问题
    prompt += `用户：${message}\n助手：`

    return prompt
  }

  /**
   * 获取推荐的学习问题
   */
  async generateRecommendations(userContents: string[]): Promise<string[]> {
    try {
      const prompt = `你是 WellCi (好词) 学习平台的智能助手。基于以下学习内容，生成4个有针对性的学习问题：

学习内容：
${userContents.slice(0, 5).join('\n')}

要求：
1. 问题要具体、实用
2. 涵盖不同的学习方面（词汇、语法、应用等）
3. 每个问题一行
4. 只输出问题，不要编号
5. 问题要友好、有启发性

问题：`

      const response = await axios.post<OllamaGenerateResponse>(
        `${this.baseURL}/api/generate`,
        {
          model: this.defaultModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.8,
            num_predict: 200,
          }
        } as OllamaGenerateRequest
      )

      // 解析生成的问题
      const questions = response.data.response
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0 && q.includes('?'))
        .slice(0, 4)

      return questions.length > 0 ? questions : [
        '如何快速记住这些单词？',
        '这些语法规则在实际对话中如何应用？',
        '有什么好的学习方法推荐吗？',
        '如何提高语言表达能力？'
      ]
    } catch (error) {
      console.error('生成推荐问题失败:', error)
      return [
        '如何快速记住这些单词？',
        '这些语法规则在实际对话中如何应用？',
        '有什么好的学习方法推荐吗？',
        '如何提高语言表达能力？'
      ]
    }
  }
}

// 导出单例
export const ollamaService = new OllamaService()
