/**
 * 内容详情页
 */
import { useParams } from 'react-router-dom'

const ContentDetailPage = () => {
  const { contentId } = useParams()
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">内容详情</h1>
      <p className="text-text-secondary">内容ID: {contentId}</p>
    </div>
  )
}

export default ContentDetailPage
