import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function AppInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
    
    if (isAppInstalled) {
      return; // App is already installed
    }
    
    // Show banner only if user hasn't dismissed it before
    const hasUserDismissedBanner = localStorage.getItem('appInstallBannerDismissed');
    if (hasUserDismissedBanner) {
      return;
    }
    
    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show our custom install banner
      setShowBanner(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleClose = () => {
    setShowBanner(false);
    // Remember that user has dismissed the banner
    localStorage.setItem('appInstallBannerDismissed', 'true');
  };
  
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the browser's install prompt
    await deferredPrompt.prompt();
    
    // Wait for user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    // User accepted the prompt
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    // Reset the deferredPrompt variable
    setDeferredPrompt(null);
    setShowBanner(false);
  };
  
  if (!showBanner) return null;
  
  return (
    <div className="app-install-banner safe-area-inset-bottom">
      <div className="flex items-center">
        <div className="mr-2">
          <Download className="h-6 w-6" />
        </div>
        <div>
          <p className="font-semibold">Install ShuttleMate</p>
          <p className="text-sm">Add to your home screen for the best experience</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/20 text-white hover:bg-white/30 border-white/30"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="sm"
          className="bg-white text-primary hover:bg-white/90" 
          onClick={handleInstall}
        >
          Install
        </Button>
      </div>
    </div>
  );
}