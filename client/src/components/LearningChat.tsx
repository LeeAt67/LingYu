import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Send, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useMutation } from '@tanstack/react-query'
import { chatApi } from '@/api/chat'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface LearningChatProps {
  userId: string
}

export default function LearningChat({ userId }: LearningChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const chatMutation = useMutation({
    mutationFn: (message: string) => chatApi.sendMessage(userId, message),
    onSuccess: (response) => {
      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: response.message,
        createdAt: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMessage])
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || chatMutation.isPending) return

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    chatMutation.mutate(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg font-medium mb-2">👋 你好！我是你的语言学习助手</p>
            <p className="text-sm">
              我会基于你的个人知识库来回答问题，帮助你更好地学习语言。
            </p>
            <p className="text-sm mt-4">试着问我一些问题吧！</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </Card>
            </div>
          ))
        )}
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <Card className="max-w-[80%] p-4 bg-muted">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>正在思考...</span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* 输入框 */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="询问你的学习问题..."
            disabled={chatMutation.isPending}
            className="flex-1"
          />
          <Button type="submit" disabled={chatMutation.isPending || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
