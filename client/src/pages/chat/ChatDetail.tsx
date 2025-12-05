/**
 * 聊天详情页
 */
import { useParams } from 'react-router-dom'

const ChatDetailPage = () => {
  const { chatId } = useParams()
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">聊天详情</h1>
      <p className="text-text-secondary">聊天ID: {chatId}</p>
    </div>
  )
}

export default ChatDetailPage
