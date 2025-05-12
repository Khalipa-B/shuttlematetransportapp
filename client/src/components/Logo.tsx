import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className, 
  size = 'medium', 
  withText = true 
}) => {
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-16'
  };

  return (
    <div className={cn("flex items-center", className)}>
      {/* Create ShuttleMate logo as SVG for better quality */}
      <div className={cn("bg-white rounded-full p-1", sizeClasses[size])}>
        <svg 
          viewBox="0 0 100 100" 
          className={cn("h-full w-auto")}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="45" fill="#0047AB" />
          <circle cx="50" cy="50" r="38" fill="white" />
          <circle cx="50" cy="50" r="32" fill="#0047AB" />
          <rect x="32" y="38" width="36" height="24" rx="4" fill="white" />
          <rect x="30" y="50" width="40" height="4" fill="white" />
          <rect x="32" y="58" width="8" height="6" rx="2" fill="white" />
          <rect x="60" y="58" width="8" height="6" rx="2" fill="white" />
          <circle cx="36" cy="66" r="4" fill="white" />
          <circle cx="64" cy="66" r="4" fill="white" />
          <path d="M50 20 L56 30 H44 Z" fill="white" />
        </svg>
      </div>
      
      {withText && (
        <div className="ml-2 flex flex-col">
          <span className="text-royal-blue font-bold text-xl">ShuttleMate</span>
          <span className="text-gray-600 text-xs">Safe. Smart. Connected</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
