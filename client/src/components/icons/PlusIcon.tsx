/**
 * 加号图标组件
 */
interface PlusIconProps {
  className?: string
  size?: number
}

const PlusIcon = ({ className = '', size = 20 }: PlusIconProps) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 20 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M4.16638 9.99933H15.8323" 
        stroke="currentColor" 
        strokeWidth="1.66656" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M9.99933 4.16638V15.8323" 
        stroke="currentColor" 
        strokeWidth="1.66656" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default PlusIcon
