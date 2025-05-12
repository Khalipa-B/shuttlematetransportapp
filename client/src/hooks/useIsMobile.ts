import { useState, useEffect } from 'react';

// Default breakpoint for mobile is 768px
const DEFAULT_BREAKPOINT = 768;

export function useIsMobile(breakpoint = DEFAULT_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    // Set initial value
    setIsMobile(window.innerWidth < breakpoint);
    
    // Handler for window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);
  
  return isMobile;
}

// Check if the app is running in standalone mode (installed as PWA)
export function useIsStandalone() {
  const [isStandalone, setIsStandalone] = useState(false);
  
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    // Check if the app is in standalone mode
    const isInStandaloneMode = () => 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    setIsStandalone(isInStandaloneMode());
    
    // We could also listen for changes, though they're rare
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsStandalone(event.matches);
    };
    
    // Add event listener if supported
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    
    // Fallback for older browsers
    if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleChange);
      return () => (mediaQuery as any).removeListener(handleChange);
    }
  }, []);
  
  return isStandalone;
}

// Detect device type
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    const detectDeviceType = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        return 'mobile';
      } else if (width < 1024) {
        return 'tablet';
      } else {
        return 'desktop';
      }
    };
    
    setDeviceType(detectDeviceType());
    
    const handleResize = () => {
      setDeviceType(detectDeviceType());
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return deviceType;
}