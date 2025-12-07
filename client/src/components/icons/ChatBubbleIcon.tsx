/**
 * 聊天气泡图标组件
 */
interface ChatBubbleIconProps {
  className?: string
  size?: number
}

const ChatBubbleIcon = ({ className = '', size = 22 }: ChatBubbleIconProps) => {
  return (
    <svg 
      width={size} 
      height={size * 21 / 22} 
      viewBox="0 0 22 21" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M20.9945 14.9961C20.9945 15.5264 20.7838 16.0349 20.4089 16.4099C20.0339 16.7849 19.5253 16.9956 18.995 16.9956H5.82646C5.29621 16.9957 4.78772 17.2064 4.41283 17.5814L2.21141 19.7828C2.11214 19.8821 1.98567 19.9497 1.84799 19.977C1.71031 20.0044 1.56761 19.9904 1.43792 19.9367C1.30823 19.8829 1.19738 19.792 1.11938 19.6753C1.04138 19.5585 0.999743 19.4213 0.999725 19.281V2.99922C0.999725 2.46892 1.21038 1.96035 1.58536 1.58537C1.96033 1.2104 2.46891 0.999739 2.9992 0.999739H18.995C19.5253 0.999739 20.0339 1.2104 20.4089 1.58537C20.7838 1.96035 20.9945 2.46892 20.9945 2.99922V14.9961Z" 
        stroke="currentColor" 
        strokeWidth="1.99948" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default ChatBubbleIcon
