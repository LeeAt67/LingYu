/**
 * 练习相关 API 接口
 */
import { apiClient } from './client'
import { WordWithOptions } from './words'

export interface PracticeWord extends WordWithOptions {
  practiceCount: number
  correctCount: number
}

export interface PracticeWordsResponse {
  success: boolean
  data: {
    words: PracticeWord[]
    total: number
  }
}

export interface PracticeRecord {
  id: string
  wordId: string
  isCorrect: boolean
  timeSpent: number
  createdAt: string
  word: {
    word: string
    meaning: string
  }
}

export interface PracticeStats {
  totalPractice: number
  correctCount: number
  todayPractice: number
  accuracy: number
}

/**
 * 获取练习单词列表
 */
export const getPracticeWords = async (params: {
  count?: number
  level?: string
}): Promise<PracticeWord[]> => {
  try {
    const response = await apiClient.get<PracticeWordsResponse>('/practice/words', { params })
    return response.data.data.words
  } catch (error) {
    console.error('获取练习单词失败:', error)
    return []
  }
}

/**
 * 提交练习答案
 */
export const submitPracticeAnswer = async (data: {
  wordId: string
  isCorrect: boolean
  timeSpent: number
}): Promise<boolean> => {
  try {
    const response = await apiClient.post('/practice/submit', data)
    return response.data.success
  } catch (error) {
    console.error('提交练习答案失败:', error)
    return false
  }
}

/**
 * 获取练习历史
 */
export const getPracticeHistory = async (params: {
  page?: number
  limit?: number
}): Promise<{
  records: PracticeRecord[]
  total: number
}> => {
  try {
    const response = await apiClient.get('/practice/history', { params })
    return {
      records: response.data.data.records,
      total: response.data.data.pagination.total,
    }
  } catch (error) {
    console.error('获取练习历史失败:', error)
    return {
      records: [],
      total: 0,
    }
  }
}

/**
 * 获取练习统计
 */
export const getPracticeStats = async (): Promise<PracticeStats> => {
  try {
    const response = await apiClient.get('/practice/stats')
    return response.data.data
  } catch (error) {
    console.error('获取练习统计失败:', error)
    return {
      totalPractice: 0,
      correctCount: 0,
      todayPractice: 0,
      accuracy: 0,
    }
  }
}
