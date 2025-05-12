import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', withText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-16',
  };

  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        className={`${sizeClasses[size]} text-royal-blue`} 
        viewBox="0 0 100 100" 
        fill="currentColor"
      >
        <circle cx="50" cy="50" r="48" fill="currentColor" />
        <path d="M30 38H70V62H30V38ZM70 38C75 38 80 38 80 42V58C80 62 75 62 70 62M30 38C25 38 20 38 20 42V58C20 62 25 62 30 62M30 70H70M33 38C33 35 35 32 38 32H62C65 32 67 35 67 38M50 62V70M70 50H80M20 50H30" 
          stroke="white" 
          strokeWidth="4" 
          fill="none" 
          strokeLinecap="round" 
        />
        <circle cx="32" cy="50" r="5" fill="white" />
        <circle cx="68" cy="50" r="5" fill="white" />
      </svg>
      
      {withText && (
        <div className="ml-2 flex flex-col">
          <span className={`font-bold ${size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg'} text-royal-blue`}>
            ShuttleMate
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-gray-600">Safe. Smart. Connected</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
