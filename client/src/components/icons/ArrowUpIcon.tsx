interface ArrowUpIconProps {
    className?: string;
    size?: number;
}

const ArrowUpIcon = ({ className = '', size = 24 }: ArrowUpIconProps) => {
    return (
        <svg  
            height={size}
            width={size}
            className={className} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <path d="m5 12 7-7 7 7" />
            <path d="M12 19V5" />
        </svg>
    );
};

export default ArrowUpIcon;