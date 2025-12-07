/**
 * 麦克风图标组件
 */
interface MicrophoneIconProps {
  className?: string
  size?: number
}

const MicrophoneIcon = ({ className = '', size = 20 }: MicrophoneIconProps) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 20 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_11_169)">
        <path 
          d="M9.99933 15.8323V18.3321" 
          stroke="currentColor" 
          strokeWidth="1.66656" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M15.8323 8.33276V9.99932C15.8323 11.5463 15.2177 13.0299 14.1238 14.1238C13.03 15.2177 11.5463 15.8323 9.99933 15.8323C8.45234 15.8323 6.9687 15.2177 5.87481 14.1238C4.78092 13.0299 4.16638 11.5463 4.16638 9.99932V8.33276" 
          stroke="currentColor" 
          strokeWidth="1.66656" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M12.4992 4.1664C12.4992 2.78578 11.38 1.66656 9.99935 1.66656C8.61873 1.66656 7.49951 2.78578 7.49951 4.1664V9.99935C7.49951 11.38 8.61873 12.4992 9.99935 12.4992C11.38 12.4992 12.4992 11.38 12.4992 9.99935V4.1664Z" 
          stroke="currentColor" 
          strokeWidth="1.66656" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_11_169">
          <rect width="19.9987" height="19.9987" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  )
}

export default MicrophoneIcon
