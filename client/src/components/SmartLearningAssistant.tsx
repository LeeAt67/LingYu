import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Brain, BookOpen, Lightbulb, Search, MessageCircle } from 'lucide-react';

interface RAGResponse {
  success: boolean;
  data: {
    question?: string;
    answer?: string;
    relatedContents?: any[];
    recommendations?: string[];
    suggestedTopics?: string[];
    reviewContents?: any[];
  };
}

interface SmartLearningAssistantProps {
  userId: string;
}

const SmartLearningAssistant: React.FC<SmartLearningAssistantProps> = ({ userId }) => {
  const [question, setQuestion] = useState('');
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);

  // 个性化问答
  const qaQuery = useMutation({
    mutationFn: async (question: string) => {
      const response = await fetch('/api/rag/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, question }),
      });
      return response.json() as Promise<RAGResponse>;
    },
  });

  // 学习建议
  const recommendationsQuery = useQuery({
    queryKey: ['recommendations', userId],
    queryFn: async () => {
      const response = await fetch(`/api/rag/recommendations/${userId}`);
      return response.json() as Promise<RAGResponse>;
    },
  });

  // 知识关联
  const relatedQuery = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await fetch(`/api/rag/related/${contentId}?userId=${userId}`);
      return response.json() as Promise<RAGResponse>;
    },
  });

  const handleAskQuestion = () => {
    if (question.trim()) {
      qaQuery.mutate(question);
    }
  };

  const handleFindRelated = (contentId: string) => {
    setSelectedContentId(contentId);
    relatedQuery.mutate(contentId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            智能学习助手
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="qa" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="qa" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                个性化问答
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                学习建议
              </TabsTrigger>
              <TabsTrigger value="related" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                知识关联
              </TabsTrigger>
            </TabsList>

            {/* 个性化问答 */}
            <TabsContent value="qa" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="问我任何关于你学习内容的问题..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                />
                <Button 
                  onClick={handleAskQuestion}
                  disabled={qaQuery.isPending || !question.trim()}
                >
                  {qaQuery.isPending ? '思考中...' : '提问'}
                </Button>
              </div>

              {qaQuery.data?.success && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      问题: {qaQuery.data.data.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {qaQuery.data.data.answer}
                    </p>
                  </CardContent>
                </Card>
              )}

              {qaQuery.isError && (
                <div className="text-red-500 text-sm">
                  抱歉，处理您的问题时出现了错误。
                </div>
              )}

              {/* 示例问题 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">示例问题:</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "我之前学过的关于过去时的语法规则是什么？",
                    "总结一下我学过的单词",
                    "我在语法方面有哪些薄弱环节？"
                  ].map((example, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setQuestion(example)}
                    >
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* 学习建议 */}
            <TabsContent value="recommendations" className="space-y-4">
              {recommendationsQuery.isLoading && (
                <div className="text-center py-4">加载学习建议中...</div>
              )}

              {recommendationsQuery.data?.success && (
                <div className="space-y-4">
                  {/* 个性化建议 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">📋 个性化建议</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {recommendationsQuery.data.data.recommendations?.map((rec, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* 建议学习主题 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">🎯 建议学习主题</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {recommendationsQuery.data.data.suggestedTopics?.map((topic, index) => (
                          <Badge key={index} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 需要复习的内容 */}
                  {recommendationsQuery.data.data.reviewContents && 
                   recommendationsQuery.data.data.reviewContents.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">🔄 需要复习的内容</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {recommendationsQuery.data.data.reviewContents.map((content: any) => (
                            <div key={content.id} className="p-2 border rounded-lg">
                              <h5 className="font-medium text-sm">{content.title}</h5>
                              <p className="text-xs text-gray-600 mt-1">
                                {content.content.substring(0, 100)}...
                              </p>
                              <div className="flex gap-2 mt-2">
                                {content.tags.map((tag: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* 知识关联 */}
            <TabsContent value="related" className="space-y-4">
              <div className="text-sm text-gray-600">
                选择一个学习内容来查看相关的知识点
              </div>

              {/* 这里可以添加内容选择器 */}
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <Search className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  从内容列表中选择一个项目来查看相关内容
                </p>
              </div>

              {relatedQuery.data?.success && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">🔗 相关内容</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {relatedQuery.data.data.relatedContents?.map((content: any) => (
                        <div key={content.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-sm">{content.title}</h5>
                            <Badge variant="outline" className="text-xs">
                              相似度: {(content.similarity * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            {content.content.substring(0, 150)}...
                          </p>
                          <div className="flex gap-1 mt-2">
                            {content.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartLearningAssistant;
