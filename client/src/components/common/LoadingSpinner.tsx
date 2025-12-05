/**
 * 加载动画组件
 */
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]} ${className}`} />
    </div>
  )
}

export default LoadingSpinner
