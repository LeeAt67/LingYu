/**
 * 对战相关 API 接口
 */
import { apiClient } from './client'

export interface BattleRecord {
  id: string
  userId: string
  opponentId?: string
  wordCount: number
  userScore: number
  opponentScore: number
  isWin?: boolean
  duration?: number
  status: 'MATCHING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

export interface BattleWord {
  id: string
  word: string
  options: {
    type?: string
    meaning: string
  }[]
  seenCount: number
}

export interface BattleStats {
  totalBattles: number
  wins: number
  losses: number
  winRate: number
  totalScore: number
}

/**
 * 开始对战
 */
export const startBattle = async (wordCount: number): Promise<BattleRecord | null> => {
  try {
    const response = await apiClient.post('/battle/start', { wordCount })
    return response.data.data
  } catch (error) {
    console.error('开始对战失败:', error)
    return null
  }
}

/**
 * 获取对战单词列表
 */
export const getBattleWords = async (battleId: string): Promise<{
  battleId: string
  words: BattleWord[]
  wordCount: number
} | null> => {
  try {
    const response = await apiClient.get(`/battle/${battleId}/words`)
    return response.data.data
  } catch (error) {
    console.error('获取对战单词失败:', error)
    return null
  }
}

/**
 * 提交对战答案
 */
export const submitBattleAnswer = async (
  battleId: string,
  data: {
    wordId: string
    isCorrect: boolean
    timeSpent: number
  }
): Promise<boolean> => {
  try {
    const response = await apiClient.post(`/battle/${battleId}/answer`, data)
    return response.data.success
  } catch (error) {
    console.error('提交对战答案失败:', error)
    return false
  }
}

/**
 * 完成对战
 */
export const completeBattle = async (battleId: string): Promise<BattleRecord | null> => {
  try {
    const response = await apiClient.post(`/battle/${battleId}/complete`)
    return response.data.data
  } catch (error) {
    console.error('完成对战失败:', error)
    return null
  }
}

/**
 * 获取对战历史
 */
export const getBattleHistory = async (params: {
  page?: number
  limit?: number
}): Promise<{
  battles: BattleRecord[]
  total: number
}> => {
  try {
    const response = await apiClient.get('/battle/history', { params })
    return {
      battles: response.data.data.battles,
      total: response.data.data.pagination.total,
    }
  } catch (error) {
    console.error('获取对战历史失败:', error)
    return {
      battles: [],
      total: 0,
    }
  }
}

/**
 * 获取对战统计
 */
export const getBattleStats = async (): Promise<BattleStats> => {
  try {
    const response = await apiClient.get('/battle/stats')
    return response.data.data
  } catch (error) {
    console.error('获取对战统计失败:', error)
    return {
      totalBattles: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalScore: 0,
    }
  }
}
