/**
 * RAG (Retrieval-Augmented Generation) 服务
 * 使用 LangChain 实现基于向量嵌入的语义搜索
 */
import { PrismaClient } from '@prisma/client';
import { OpenAIEmbeddings } from '@langchain/openai';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { Document } from '@langchain/core/documents';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ContentWithEmbedding {
  id: string;
  title: string;
  content: string;
  type: string;
  tags: string[];
  createdAt: Date;
}

export class RAGService {
  private openai: OpenAI | null = null;
  private embeddings: OpenAIEmbeddings | OllamaEmbeddings;
  private vectorStoreCache: Map<string, HNSWLib> = new Map();
  private vectorStoreDir: string;
  private useOllama: boolean;

  constructor() {
    this.vectorStoreDir = path.join(process.cwd(), 'data', 'vectorstores');
    
    // 确保向量存储目录存在
    if (!fs.existsSync(this.vectorStoreDir)) {
      fs.mkdirSync(this.vectorStoreDir, { recursive: true });
    }

    // 根据配置选择嵌入模型
    this.useOllama = process.env.USE_OLLAMA_EMBEDDINGS === 'true';
    
    if (this.useOllama) {
      // 使用 Ollama 本地嵌入模型
      this.embeddings = new OllamaEmbeddings({
        model: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      });
      console.log('使用 Ollama 嵌入模型');
    } else {
      // 使用 OpenAI 嵌入模型
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY 环境变量未配置');
      }
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: apiKey,
        modelName: 'text-embedding-3-small',
      });
      console.log('使用 OpenAI 嵌入模型');
    }
  }

  /**
   * 获取或创建 OpenAI 客户端实例
   */
  private getOpenAIClient(): OpenAI {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY 环境变量未配置');
      }
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  /**
   * 获取用户的向量存储路径
   */
  private getUserVectorStorePath(userId: string): string {
    return path.join(this.vectorStoreDir, `user_${userId}`);
  }

  /**
   * 为用户的学习内容创建或更新向量存储
   */
  async buildVectorStore(userId: string): Promise<void> {
    try {
      console.log(`开始为用户 ${userId} 构建向量存储...`);

      // 获取用户的所有学习内容
      const userContents = await prisma.content.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (userContents.length === 0) {
        console.log(`用户 ${userId} 没有学习内容`);
        return;
      }

      // 转换为 LangChain 文档格式
      const documents = userContents.map(content => new Document({
        pageContent: `标题: ${content.title}\n内容: ${content.content}`,
        metadata: {
          id: content.id,
          title: content.title,
          type: content.type,
          tags: content.tags,
          createdAt: content.createdAt.toISOString(),
        },
      }));

      // 创建向量存储
      const vectorStore = await HNSWLib.fromDocuments(documents, this.embeddings);

      // 保存到磁盘
      const storePath = this.getUserVectorStorePath(userId);
      await vectorStore.save(storePath);

      // 缓存到内存
      this.vectorStoreCache.set(userId, vectorStore);

      console.log(`用户 ${userId} 的向量存储构建完成，共 ${documents.length} 个文档`);
    } catch (error) {
      console.error('构建向量存储失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的向量存储
   */
  private async getVectorStore(userId: string): Promise<HNSWLib | null> {
    try {
      // 先检查缓存
      if (this.vectorStoreCache.has(userId)) {
        return this.vectorStoreCache.get(userId)!;
      }

      // 尝试从磁盘加载
      const storePath = this.getUserVectorStorePath(userId);
      if (fs.existsSync(storePath)) {
        const vectorStore = await HNSWLib.load(storePath, this.embeddings);
        this.vectorStoreCache.set(userId, vectorStore);
        return vectorStore;
      }

      // 如果不存在，构建新的
      await this.buildVectorStore(userId);
      return this.vectorStoreCache.get(userId) || null;
    } catch (error) {
      console.error('获取向量存储失败:', error);
      return null;
    }
  }

  /**
   * 添加新内容到向量存储
   */
  async addContentToVectorStore(userId: string, contentId: string): Promise<void> {
    try {
      const content = await prisma.content.findUnique({
        where: { id: contentId },
      });

      if (!content || content.userId !== userId) {
        throw new Error('内容不存在或无权访问');
      }

      const document = new Document({
        pageContent: `标题: ${content.title}\n内容: ${content.content}`,
        metadata: {
          id: content.id,
          title: content.title,
          type: content.type,
          tags: content.tags,
          createdAt: content.createdAt.toISOString(),
        },
      });

      let vectorStore = await this.getVectorStore(userId);
      
      if (!vectorStore) {
        // 如果向量存储不存在，创建新的
        await this.buildVectorStore(userId);
        return;
      }

      // 添加文档
      await vectorStore.addDocuments([document]);

      // 保存到磁盘
      const storePath = this.getUserVectorStorePath(userId);
      await vectorStore.save(storePath);

      console.log(`内容 ${contentId} 已添加到用户 ${userId} 的向量存储`);
    } catch (error) {
      console.error('添加内容到向量存储失败:', error);
      throw error;
    }
  }

  /**
   * 语义搜索：使用向量相似度查找相关内容
   */
  async semanticSearch(userId: string, query: string, k: number = 5): Promise<ContentWithEmbedding[]> {
    try {
      const vectorStore = await this.getVectorStore(userId);

      if (!vectorStore) {
        return [];
      }

      // 执行相似度搜索
      const results = await vectorStore.similaritySearchWithScore(query, k);

      // 转换结果格式
      return results.map(([doc, score]) => ({
        id: doc.metadata.id,
        title: doc.metadata.title,
        content: doc.pageContent,
        type: doc.metadata.type,
        tags: doc.metadata.tags,
        createdAt: new Date(doc.metadata.createdAt),
        similarity: score,
      })) as any;
    } catch (error) {
      console.error('语义搜索失败:', error);
      return [];
    }
  }

  /**
   * 个性化问答：基于语义搜索的智能问答
   */
  async personalizedQA(userId: string, question: string): Promise<string> {
    try {
      // 1. 使用语义搜索找到相关内容
      const relevantContents = await this.semanticSearch(userId, question, 5);

      if (relevantContents.length === 0) {
        return "你还没有添加任何学习内容，请先添加一些学习材料后再提问。";
      }

      // 2. 构建上下文
      const context = relevantContents
        .map(content => `标题: ${content.title}\n内容: ${content.content}`)
        .join('\n\n---\n\n');

      // 3. 调用 OpenAI 生成回答
      const openaiClient = this.getOpenAIClient();
      const response = await openaiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `你是一个个人学习助手。请基于用户的学习内容回答问题。

用户的相关学习内容（按相关度排序）：
${context}

请用中文回答，并且：
1. 优先使用用户已学习的内容
2. 引用具体的学习材料
3. 如果内容不足，可以适当补充相关知识
4. 回答要简洁明了，便于理解`
          },
          {
            role: "user",
            content: question
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || "抱歉，我无法生成回答。";
    } catch (error) {
      console.error('个性化问答错误:', error);
      return "抱歉，处理您的问题时出现了错误。";
    }
  }

  /**
   * 知识关联：基于语义相似度查找相关内容
   */
  async findRelatedContents(userId: string, contentId: string, limit: number = 5): Promise<any[]> {
    try {
      // 获取目标内容
      const targetContent = await prisma.content.findUnique({
        where: { id: contentId },
      });

      if (!targetContent || targetContent.userId !== userId) {
        return [];
      }

      // 使用内容作为查询进行语义搜索
      const query = `${targetContent.title} ${targetContent.content}`;
      const results = await this.semanticSearch(userId, query, limit + 1);

      // 过滤掉自己
      return results.filter(content => content.id !== contentId).slice(0, limit);
    } catch (error) {
      console.error('知识关联错误:', error);
      return [];
    }
  }

  /**
   * 学习建议：基于向量分析生成个性化建议
   */
  async generateLearningRecommendations(userId: string): Promise<{
    recommendations: string[];
    suggestedTopics: string[];
    reviewContents: any[];
  }> {
    try {
      // 获取用户的学习内容
      const userContents = await prisma.content.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (userContents.length === 0) {
        return {
          recommendations: ["开始添加一些学习内容，比如单词、语法规则或例句"],
          suggestedTopics: ["基础语法", "常用词汇", "日常对话"],
          reviewContents: [],
        };
      }

      // 找出需要复习的内容（7天前的内容）
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const reviewContents = userContents
        .filter(content => content.createdAt < sevenDaysAgo)
        .slice(0, 5);

      // 分析内容类型和标签
      const contentTypes = this.analyzeContentTypes(userContents);
      const commonTags = this.extractCommonTags(userContents);

      // 生成建议
      const recommendations = this.generateRecommendations(userContents.length, contentTypes, commonTags);
      const suggestedTopics = this.suggestNewTopics(commonTags, contentTypes);

      return {
        recommendations,
        suggestedTopics,
        reviewContents,
      };
    } catch (error) {
      console.error('学习建议错误:', error);
      return {
        recommendations: ["继续保持学习的好习惯！"],
        suggestedTopics: [],
        reviewContents: [],
      };
    }
  }

  /**
   * 清除用户的向量存储缓存
   */
  clearVectorStoreCache(userId: string): void {
    this.vectorStoreCache.delete(userId);
  }

  // 私有辅助方法
  private analyzeContentTypes(contents: any[]): Record<string, number> {
    const types: Record<string, number> = {};
    contents.forEach(content => {
      types[content.type] = (types[content.type] || 0) + 1;
    });
    return types;
  }

  private extractCommonTags(contents: any[]): string[] {
    const tagCount: Record<string, number> = {};
    contents.forEach(content => {
      content.tags.forEach((tag: string) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
  }

  private generateRecommendations(
    contentCount: number,
    contentTypes: Record<string, number>,
    commonTags: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (contentCount < 10) {
      recommendations.push("建议继续添加更多学习内容，丰富你的知识库");
    }

    if (contentTypes.TEXT && !contentTypes.AUDIO) {
      recommendations.push("考虑添加一些音频内容来提高听力技能");
    }

    if (commonTags.includes('语法') && !commonTags.includes('练习')) {
      recommendations.push("建议添加一些语法练习题来巩固理论知识");
    }

    if (recommendations.length === 0) {
      recommendations.push("保持良好的学习习惯，继续加油！");
    }

    return recommendations;
  }

  private suggestNewTopics(commonTags: string[], contentTypes: Record<string, number>): string[] {
    const suggestions: string[] = [];

    if (commonTags.includes('语法')) {
      suggestions.push('高级语法结构', '语法练习');
    }
    if (commonTags.includes('词汇')) {
      suggestions.push('同义词辨析', '词汇搭配');
    }
    if (commonTags.includes('口语')) {
      suggestions.push('发音练习', '日常对话');
    }

    if (contentTypes.TEXT && Object.keys(contentTypes).length === 1) {
      suggestions.push('听力材料', '视频学习');
    }

    if (suggestions.length === 0) {
      suggestions.push('阅读理解', '写作练习', '听力训练');
    }

    return suggestions.slice(0, 5);
  }
}

export const ragService = new RAGService();
