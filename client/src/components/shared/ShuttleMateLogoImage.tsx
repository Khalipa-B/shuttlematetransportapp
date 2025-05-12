import React from 'react';

interface ShuttleMateLogoImageProps {
  variant?: 'blue' | 'white';
  className?: string;
  height?: number | string;
  width?: number | string;
}

export function ShuttleMateLogoImage({
  variant = 'blue',
  className = '',
  height = 'auto',
  width = 'auto'
}: ShuttleMateLogoImageProps) {
  const src = variant === 'blue' 
    ? '/images/shuttlemate-logo-blue.png' 
    : '/images/shuttlemate-logo.png';
  
  const style = {
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width
  };
  
  return (
    <img 
      src={src} 
      alt="ShuttleMate Logo" 
      className={`object-contain ${className}`}
      style={style}
    />
  );
}

export default ShuttleMateLogoImage;