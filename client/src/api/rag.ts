/**
 * RAG 检索 API 接口
 */
import { apiClient } from './client'

export interface RAGQARequest {
  userId: string
  question: string
}

export interface RAGQAResponse {
  success: boolean
  data: {
    question: string
    answer: string
    timestamp: string
  }
  message?: string
}

export interface RelatedContent {
  id: string
  title: string
  content: string
  type: string
  tags: string[]
  similarity: number
  createdAt: string
}

export interface RelatedContentsResponse {
  success: boolean
  data: {
    contentId: string
    relatedContents: RelatedContent[]
    count: number
  }
  message?: string
}

export interface LearningRecommendation {
  recommendations: string[]
  suggestedTopics: string[]
  reviewContents: any[]
}

export interface RecommendationsResponse {
  success: boolean
  data: LearningRecommendation & {
    userId: string
    generatedAt: string
  }
  message?: string
}

export interface SearchRequest {
  userId: string
  query: string
  type?: string
}

export interface SearchResponse {
  success: boolean
  data: {
    query: string
    type?: string
    result: string
    timestamp: string
  }
  message?: string
}

/**
 * 个性化问答 - 基于用户学习内容回答问题
 */
export const ragPersonalizedQA = async (request: RAGQARequest): Promise<string> => {
  try {
    const response = await apiClient.post<RAGQAResponse>('/rag/qa', request)
    if (response.data.success) {
      return response.data.data.answer
    }
    throw new Error(response.data.message || 'RAG问答失败')
  } catch (error: any) {
    console.error('RAG个性化问答失败:', error)
    throw new Error(error.response?.data?.message || 'RAG服务暂时不可用')
  }
}

/**
 * 查找相关内容 - 知识关联
 */
export const ragFindRelatedContents = async (
  contentId: string,
  userId: string,
  limit: number = 5
): Promise<RelatedContent[]> => {
  try {
    const response = await apiClient.get<RelatedContentsResponse>(
      `/rag/related/${contentId}`,
      {
        params: { userId, limit }
      }
    )
    if (response.data.success) {
      return response.data.data.relatedContents
    }
    return []
  } catch (error) {
    console.error('查找相关内容失败:', error)
    return []
  }
}

/**
 * 获取学习建议
 */
export const ragGetRecommendations = async (userId: string): Promise<LearningRecommendation> => {
  try {
    const response = await apiClient.get<RecommendationsResponse>(
      `/rag/recommendations/${userId}`
    )
    if (response.data.success) {
      return {
        recommendations: response.data.data.recommendations,
        suggestedTopics: response.data.data.suggestedTopics,
        reviewContents: response.data.data.reviewContents
      }
    }
    return {
      recommendations: [],
      suggestedTopics: [],
      reviewContents: []
    }
  } catch (error) {
    console.error('获取学习建议失败:', error)
    return {
      recommendations: [],
      suggestedTopics: [],
      reviewContents: []
    }
  }
}

/**
 * 智能搜索 - 在用户内容中搜索
 */
export const ragSearch = async (request: SearchRequest): Promise<string> => {
  try {
    const response = await apiClient.post<SearchResponse>('/rag/search', request)
    if (response.data.success) {
      return response.data.data.result
    }
    throw new Error(response.data.message || '搜索失败')
  } catch (error: any) {
    console.error('RAG智能搜索失败:', error)
    throw new Error(error.response?.data?.message || '搜索服务暂时不可用')
  }
}
