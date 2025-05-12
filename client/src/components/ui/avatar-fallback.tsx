import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ src, name = '', size = 'md', className = '' }: UserAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={src || ''} alt={name} />
      <AvatarFallback className="bg-royal-blue text-white">
        {name ? getInitials(name) : 'U'}
      </AvatarFallback>
    </Avatar>
  );
}
