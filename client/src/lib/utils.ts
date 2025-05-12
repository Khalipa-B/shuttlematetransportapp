import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a time to a readable string
 */
export function formatTime(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a datetime to a readable string
 */
export function formatDateTime(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(d)} at ${formatTime(d)}`;
}

/**
 * Returns a relative time string like "2 minutes ago"
 */
export function timeAgo(date: Date | string): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (secondsAgo < 60) return 'just now';
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} minute${Math.floor(secondsAgo / 60) === 1 ? '' : 's'} ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hour${Math.floor(secondsAgo / 3600) === 1 ? '' : 's'} ago`;
  if (secondsAgo < 2592000) return `${Math.floor(secondsAgo / 86400)} day${Math.floor(secondsAgo / 86400) === 1 ? '' : 's'} ago`;
  
  return formatDate(d);
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = window.setTimeout(later, wait);
  };
}

/**
 * Truncates a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Formats a student grade to a readable string
 */
export function formatGrade(grade: number): string {
  if (grade === 0) return 'Kindergarten';
  if (grade > 0 && grade <= 12) return `Grade ${grade}`;
  return 'N/A';
}

/**
 * Gets initials from a full name
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ').filter(part => part.length > 0);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Calculate time remaining until a specified time/date in minutes
 */
export function getTimeRemainingInMinutes(targetTime: Date | string): number {
  const target = typeof targetTime === 'string' ? new Date(targetTime) : targetTime;
  const now = new Date();
  
  // Calculate difference in milliseconds
  const diffMs = target.getTime() - now.getTime();
  
  // Convert to minutes
  return Math.round(diffMs / 60000);
}

/**
 * Format the remaining time in a human-readable format
 */
export function formatTimeRemaining(minutes: number): string {
  if (minutes < 0) return 'Arrived';
  if (minutes === 0) return 'Now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'}`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) return `${hours} hour${hours === 1 ? '' : 's'}`;
  return `${hours} hr ${mins} min`;
}

/**
 * Get color class based on status
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'on board':
    case 'boarded':
    case 'on bus':
    case 'completed':
    case 'resolved':
    case 'in transit':
      return 'text-green-600 bg-green-100';
    case 'delayed':
    case 'absent':
    case 'pending':
    case 'warning':
      return 'text-amber-600 bg-amber-100';
    case 'critical':
    case 'emergency':
    case 'danger':
    case 'inactive':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Generate a random hex color based on a string
 */
export function stringToColor(str: string): string {
  if (!str) return '#0047AB'; // Default to royal blue
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
}
