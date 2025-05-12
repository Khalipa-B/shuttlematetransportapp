import { useState, useEffect } from 'react';
import { AlertCircle, WifiOff, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
      return () => clearTimeout(timer);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline && !showReconnected) {
    return null;
  }
  
  return (
    <div 
      className={cn(
        "fixed top-0 left-0 w-full p-2 text-white text-sm font-medium z-50 flex items-center justify-center safe-area-inset-top",
        isOnline ? "bg-green-600" : "bg-destructive"
      )}
    >
      {isOnline ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          <span>Connected again</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 mr-2" />
          <span>You're offline. Some features may be limited.</span>
        </>
      )}
    </div>
  );
}