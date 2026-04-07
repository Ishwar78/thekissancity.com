import { useEffect, useState } from "react";
import { Download, X, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PWAUpdatePromptProps {
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
}

export const PWAUpdatePrompt: React.FC<PWAUpdatePromptProps> = ({
  onNeedRefresh,
  onOfflineReady,
}) => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [showOfflineReady, setShowOfflineReady] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateAccepted, setUpdateAccepted] = useState(false);

  useEffect(() => {
    // Listen for custom events from Vite PWA
    const handleNeedRefresh = () => {
      console.log("🔄 PWA Update: New content available, showing update prompt");
      setShowUpdatePrompt(true);
      onNeedRefresh?.();
    };

    const handleOfflineReady = () => {
      console.log("📱 PWA Update: App ready to work offline");
      setShowOfflineReady(true);
      onOfflineReady?.();
      
      // Auto-hide offline ready message after 3 seconds
      setTimeout(() => {
        setShowOfflineReady(false);
      }, 3000);
    };

    // Register event listeners
    window.addEventListener('pwa-need-refresh', handleNeedRefresh);
    window.addEventListener('pwa-offline-ready', handleOfflineReady);

    return () => {
      window.removeEventListener('pwa-need-refresh', handleNeedRefresh);
      window.removeEventListener('pwa-offline-ready', handleOfflineReady);
    };
  }, [onNeedRefresh, onOfflineReady]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateAccepted(true);
    
    console.log("🔄 PWA Update: User accepted update, reloading page");
    
    // Show loading state briefly for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reload the page to get the new version
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
    toast.info("Update postponed", {
      description: "You'll be prompted again later",
      duration: 2000
    });
  };

  const handleOfflineReadyDismiss = () => {
    setShowOfflineReady(false);
  };

  // Offline ready notification
  if (showOfflineReady) {
    return (
      <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-top-5">
        <div className="bg-green-500 text-white rounded-lg shadow-lg p-4 flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">Ready for Offline Use!</h3>
            <p className="text-xs">
              TheKissanCity now works without internet connection
            </p>
          </div>
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleOfflineReadyDismiss}
            className="text-white hover:bg-green-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Update prompt
  if (showUpdatePrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
        <div className="bg-card border-border rounded-lg shadow-lg p-4 flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            {isUpdating ? (
              <RefreshCw className="h-6 w-6 text-white animate-spin" />
            ) : (
              <Download className="h-6 w-6 text-white" />
            )}
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1 text-foreground">
              {isUpdating ? 'Updating...' : 'Update Available'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isUpdating 
                ? 'Installing the latest version of TheKissanCity'
                : 'A new version of TheKissanCity is available'
              }
            </p>
          </div>

          <div className="flex gap-2">
            {!updateAccepted && (
              <>
                <Button 
                  size="sm" 
                  onClick={handleUpdate}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleDismiss}
                  className="text-muted-foreground hover:bg-accent"
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Hook for manual PWA update control
export const usePWAUpdate = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    const handleNeedRefresh = () => setNeedRefresh(true);
    const handleOfflineReady = () => setOfflineReady(true);

    window.addEventListener('pwa-need-refresh', handleNeedRefresh);
    window.addEventListener('pwa-offline-ready', handleOfflineReady);

    return () => {
      window.removeEventListener('pwa-need-refresh', handleNeedRefresh);
      window.removeEventListener('pwa-offline-ready', handleOfflineReady);
    };
  }, []);

  const updateServiceWorker = () => {
    setNeedRefresh(false);
    window.location.reload();
  };

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker,
  };
};
