/**
 * 通知关闭图标组件(铃铛带斜线)
 */
interface BellOffIconProps {
  className?: string
  size?: number
}

const BellOffIcon = ({ className = '', size = 24 }: BellOffIconProps) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M10.2653 20.9945C10.4409 21.2985 10.6933 21.551 10.9974 21.7265C11.3014 21.902 11.6463 21.9944 11.9973 21.9944C12.3484 21.9944 12.6932 21.902 12.9973 21.7265C13.3013 21.551 13.5538 21.2985 13.7293 20.9945" 
        stroke="currentColor" 
        strokeWidth="1.99948" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M16.9955 16.9956H3.99894C3.80519 16.9956 3.6156 16.9394 3.45321 16.8337C3.29083 16.728 3.16266 16.5774 3.08429 16.4002C3.00591 16.223 2.98071 16.0269 3.01175 15.8356C3.0428 15.6444 3.12874 15.4663 3.25913 15.323C4.58878 13.9524 5.99841 12.4957 5.99841 7.99791C5.99827 7.40787 6.08518 6.82103 6.25635 6.25636" 
        stroke="currentColor" 
        strokeWidth="1.99948" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M1.99948 1.99948L21.9943 21.9942" 
        stroke="currentColor" 
        strokeWidth="1.99948" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M8.66574 3.00921C9.56899 2.40605 10.6191 2.05945 11.7039 2.0064C12.7887 1.95335 13.8676 2.19584 14.8254 2.70799C15.7832 3.22014 16.5839 3.98273 17.1422 4.91438C17.7005 5.84603 17.9953 6.91179 17.9953 7.99791C17.9953 10.6842 18.7651 12.6497 19.7019 14.0463" 
        stroke="currentColor" 
        strokeWidth="1.99948" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default BellOffIcon
