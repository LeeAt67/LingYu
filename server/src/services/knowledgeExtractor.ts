/**
 * 知识提取服务
 * 从对话中自动提取知识点并存入向量库
 */
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { ragService } from "./ragService";

const prisma = new PrismaClient();

interface ExtractedKnowledge {
  title: string;
  content: string;
  tags: string[];
  confidence: number; // 0-1，知识点的可信度
}

export class KnowledgeExtractor {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY 环境变量未配置");
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * 从对话中提取知识点
   */
  async extractFromConversation(
    userId: string,
    userMessage: string,
    assistantMessage: string
  ): Promise<ExtractedKnowledge[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `你是一个知识提取专家。从用户和AI助手的对话中提取有价值的学习知识点。

提取规则：
1. 只提取明确的知识点（单词、语法、概念等）
2. 每个知识点包含：标题、内容、标签
3. 标签从以下选择：词汇、语法、口语、写作、阅读、听力、文化、其他
4. 如果对话中没有明确的学习知识，返回空数组

返回JSON格式：
[
  {
    "title": "知识点标题",
    "content": "详细内容说明",
    "tags": ["词汇", "语法"],
    "confidence": 0.9
  }
]`,
          },
          {
            role: "user",
            content: `用户问：${userMessage}\n\nAI答：${assistantMessage}\n\n请提取其中的学习知识点。`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = response.choices[0]?.message?.content;
      if (!result) return [];

      const parsed = JSON.parse(result);

      // 处理可能的不同返回格式
      const knowledgeArray =
        parsed.knowledge || parsed.knowledgePoints || parsed.items || [];

      return knowledgeArray.filter(
        (k: ExtractedKnowledge) => k.confidence >= 0.7 // 只保留高置信度的知识点
      );
    } catch (error) {
      console.error("知识提取失败:", error);
      return [];
    }
  }

  /**
   * 保存提取的知识点到数据库和向量库
   */
  async saveKnowledge(
    userId: string,
    knowledge: ExtractedKnowledge[]
  ): Promise<string[]> {
    const savedIds: string[] = [];

    for (const item of knowledge) {
      try {
        // 1. 检查是否已存在相似内容（避免重复）
        const existing = await this.checkDuplicate(userId, item.title);
        if (existing) {
          console.log(`知识点已存在，跳过: ${item.title}`);
          continue;
        }

        // 2. 保存到数据库
        const content = await prisma.content.create({
          data: {
            userId,
            title: item.title,
            content: item.content,
            type: "TEXT",
            tags: item.tags,
          },
        });

        // 3. 添加到向量库
        await ragService.addContentToVectorStore(userId, content.id);

        savedIds.push(content.id);
        console.log(`自动保存知识点: ${item.title}`);
      } catch (error) {
        console.error(`保存知识点失败: ${item.title}`, error);
      }
    }

    return savedIds;
  }

  /**
   * 检查是否存在重复内容
   */
  private async checkDuplicate(
    userId: string,
    title: string
  ): Promise<boolean> {
    const existing = await prisma.content.findFirst({
      where: {
        userId,
        title: {
          equals: title,
          mode: "insensitive",
        },
      },
    });
    return !!existing;
  }

  /**
   * 从聊天会话中批量提取知识
   */
  async extractFromSession(userId: string, sessionId: string): Promise<number> {
    try {
      // 获取会话的所有消息
      const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
      });

      let totalExtracted = 0;

      // 成对处理用户和助手的消息
      for (let i = 0; i < messages.length - 1; i++) {
        const userMsg = messages[i];
        const assistantMsg = messages[i + 1];

        if (userMsg.role === "user" && assistantMsg.role === "assistant") {
          const knowledge = await this.extractFromConversation(
            userId,
            userMsg.content,
            assistantMsg.content
          );

          if (knowledge.length > 0) {
            const savedIds = await this.saveKnowledge(userId, knowledge);
            totalExtracted += savedIds.length;
          }
        }
      }

      return totalExtracted;
    } catch (error) {
      console.error("从会话提取知识失败:", error);
      return 0;
    }
  }

  /**
   * 智能判断是否应该提取知识
   */
  shouldExtract(userMessage: string, assistantMessage: string): boolean {
    // 简单启发式规则
    const learningKeywords = [
      "是什么",
      "怎么",
      "如何",
      "什么意思",
      "解释",
      "教我",
      "学习",
      "记忆",
      "翻译",
    ];

    const hasLearningIntent = learningKeywords.some((keyword) =>
      userMessage.includes(keyword)
    );

    const hasSubstantialAnswer = assistantMessage.length > 50;

    return hasLearningIntent && hasSubstantialAnswer;
  }
}

export const knowledgeExtractor = new KnowledgeExtractor();
