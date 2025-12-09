/**
 * 单词相关 API 接口
 */
import { apiClient } from './client'

export interface Word {
  id: string
  word: string
  phonetic?: string
  meaning: string
  type?: string
  level?: string
}

export interface WordOption {
  type?: string
  meaning: string
  isCorrect?: boolean
}

export interface WordWithOptions extends Word {
  options: WordOption[]
  seenCount?: number
  correctCount?: number
}

export interface WordStatsResponse {
  success: boolean
  data: {
    totalWords: number
    studiedWords: number
    practiceCount: number
  }
}

/**
 * 获取随机单词
 */
export const getRandomWord = async (): Promise<{ word: string; meaning: string }> => {
  try {
    const response = await apiClient.get('/words/random')
    return response.data.data
  } catch (error) {
    console.error('获取随机单词失败:', error)
    // 返回默认单词
    return { word: 'Edge', meaning: '边缘；优势' }
  }
}

/**
 * 获取单词列表
 */
export const getWords = async (params: {
  level?: string
  page?: number
  limit?: number
}): Promise<WordWithOptions[]> => {
  try {
    const response = await apiClient.get('/words', { params })
    return response.data.data.words
  } catch (error) {
    console.error('获取单词列表失败:', error)
    return []
  }
}

/**
 * 获取单词详情
 */
export const getWordById = async (id: string): Promise<WordWithOptions | null> => {
  try {
    const response = await apiClient.get(`/words/${id}`)
    return response.data.data
  } catch (error) {
    console.error('获取单词详情失败:', error)
    return null
  }
}

/**
 * 获取用户单词学习统计
 */
export const getUserWordStats = async (): Promise<{
  totalWords: number
  studiedWords: number
  practiceCount: number
}> => {
  try {
    const response = await apiClient.get<WordStatsResponse>('/words/user/stats')
    return response.data.data
  } catch (error) {
    console.error('获取用户单词统计失败:', error)
    return {
      totalWords: 0,
      studiedWords: 0,
      practiceCount: 0,
    }
  }
}

/**
 * 记录单词被查看
 */
export const markWordAsSeen = async (wordId: string): Promise<void> => {
  try {
    await apiClient.post(`/words/${wordId}/seen`)
  } catch (error) {
    console.error('记录单词查看失败:', error)
  }
}
