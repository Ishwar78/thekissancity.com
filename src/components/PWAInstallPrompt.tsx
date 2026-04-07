import { useEffect, useState } from "react";
import { Download, X, CheckCircle, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'installed' | 'failed'>('idle');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileInstructions, setShowMobileInstructions] = useState(false);
  const [showDesktopInstructions, setShowDesktopInstructions] = useState(false);

  // Check if app is already installed
  const isInstalledPWA = () => {
    // Android / Desktop Chrome, Edge, Brave
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    // iOS Safari
    if ((window.navigator as any).standalone === true) return true;
    // Trusted Web Activity (Play Store)
    if (document.referrer.startsWith("android-app://")) return true;
    return false;
  };

  useEffect(() => {
    // Detect mobile device
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const mobileCheck = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    setIsMobile(mobileCheck);
    
    console.log("🔍 PWA Debug: Component mounted");
    console.log("🔍 PWA Debug: User Agent:", userAgent);
    console.log("🔍 PWA Debug: Is mobile?", mobileCheck);
    console.log("🔍 PWA Debug: Is installed?", isInstalledPWA());
    console.log("🔍 PWA Debug: Current URL:", window.location.href);
    console.log("🔍 PWA Debug: Is secure context?", window.isSecureContext);
    console.log("🔍 PWA Debug: Protocol:", window.location.protocol);

    // Don't show if already installed
    if (isInstalledPWA()) {
      console.log("❌ PWA Debug: Already installed, skipping install prompt");
      return;
    }

    // Check PWA installability criteria
    const checkInstallability = async () => {
      try {
        // Check if service worker is ready
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          console.log("🔍 PWA Debug: Service worker ready:", !!registration);
        }
        
        // Check manifest
        const manifestResponse = await fetch('/manifest.json');
        const manifest = await manifestResponse.json();
        console.log("🔍 PWA Debug: Manifest loaded:", manifest);
        
        // Show prompt after a delay for better UX
        setTimeout(() => {
          if (!isInstalledPWA()) {
            setShowPrompt(true);
            console.log("📱 PWA Debug: Showing install prompt after delay");
          }
        }, 5000); // Show after 5 seconds
        
      } catch (error) {
        console.error(" PWA Debug: Installability check failed:", error);
      }
    };
    
    checkInstallability();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("🔍 PWA Debug: beforeinstallprompt event fired", e);
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt when event fires
      if (!isInstalledPWA()) {
        setShowPrompt(true);
        console.log("📱 PWA Debug: Showing install prompt (native install available)");
      }
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log("✅ PWA Debug: App installed event fired!");
      setDeferredPrompt(null);
      setShowPrompt(false);
      setInstallStatus('installed');
      setShowSuccessMessage(true);
      
      toast.success("TheKissanCity App installed successfully!", {
        description: "You can now find it on your home screen",
        duration: 5000,
        icon: <CheckCircle className="h-4 w-4" />
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    console.log("🚀 PWA Debug: Install button clicked");
    console.log("🚀 PWA Debug: DeferredPrompt available:", !!deferredPrompt);
    console.log("🚀 PWA Debug: Is mobile:", isMobile);
    console.log("🚀 PWA Debug: User Agent:", navigator.userAgent);
    
    if (deferredPrompt) {
      // Native install available
      setInstallStatus('installing');
      console.log("⏳ PWA Debug: Starting native installation...");
      
      try {
        await deferredPrompt.prompt();
        console.log("⏳ PWA Debug: Waiting for user choice...");
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log("📊 PWA Debug: User choice:", outcome);

        if (outcome === "accepted") {
          console.log("✅ PWA Debug: User accepted installation");
          setDeferredPrompt(null);
          setShowPrompt(false);
          setInstallStatus('installed');
          
          toast.success("Installing TheKissanCity App...", {
            description: "The app will appear on your home screen shortly",
            duration: 3000
          });
        } else {
          console.log("❌ PWA Debug: User cancelled installation");
          setInstallStatus('idle');
          toast.info("Installation cancelled", {
            duration: 2000
          });
        }
      } catch (error) {
        console.error("❌ PWA Debug: Installation error:", error);
        setInstallStatus('failed');
        toast.error("Installation failed", {
          description: "Please try again or contact support",
          duration: 4000
        });
      }
    } else {
      // No native install - show manual instructions
      if (isMobile) {
        setShowMobileInstructions(true);
      } else {
        setShowDesktopInstructions(true);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowMobileInstructions(false);
    setShowDesktopInstructions(false);
    toast.info("Install prompt dismissed", {
      description: "You can install later from the browser menu",
      duration: 3000
    });
  };

  // Don't render if already installed or no prompt
  if ((!showPrompt && !showMobileInstructions && !showDesktopInstructions) || isInstalledPWA()) {
    return null;
  }

  // Mobile instructions modal
  if (showMobileInstructions) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in-0">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Install TheKissanCity App
            </h2>
            
            <div className="text-left mb-6 space-y-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="font-semibold text-blue-800 mb-1">📱 Mobile Install Steps</div>
                <div className="text-sm text-blue-600">
                  {/iphone|ipad|ipod/i.test(navigator.userAgent) ? (
                    <>
                      1. Tap Share button <span className="font-semibold">⎋</span><br/>
                      2. Select "Add to Home Screen"<br/>
                      3. Tap "Add" to install
                    </>
                  ) : (
                    <>
                      1. Tap menu (⋮) in Chrome<br/>
                      2. Select "Add to Home screen"<br/>
                      3. Tap "Add" to install
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setShowMobileInstructions(false)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Got it!
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDismiss}
                className="flex-1"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop instructions modal
  if (showDesktopInstructions) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in-0">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Monitor className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Install TheKissanCity App
            </h2>
            
            <div className="text-left mb-6 space-y-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="font-semibold text-blue-800 mb-1">💻 Desktop Install Steps</div>
                <div className="text-sm text-blue-600">
                  1. Click the install icon <span className="font-semibold">⚡</span> in address bar<br/>
                  2. Click "Install TheKissanCity"<br/>
                  3. App will be available in your applications
                </div>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-3">
                <div className="font-semibold text-amber-800 mb-1">🔍 No install icon?</div>
                <div className="text-sm text-amber-600">
                  Make sure you're using Chrome, Edge, or Firefox<br/>
                  and visit the site over HTTPS for install option
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setShowDesktopInstructions(false)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Got it!
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDismiss}
                className="flex-1"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success message component
  if (showSuccessMessage) {
    return (
      <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-top-5">
        <div className="bg-green-500 rounded-lg shadow-lg p-4 flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1 text-white">Successfully Installed!</h3>
            <p className="text-xs text-white">
              Find TheKissanCity on your home screen for quick access
            </p>
          </div>
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowSuccessMessage(false)}
            className="text-white hover:bg-green-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Main install prompt banner
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-card border-border rounded-lg shadow-lg p-4 flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <Download className="h-6 w-6 text-primary-foreground" />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1 text-foreground">Install TheKissanCity App</h3>
          <p className="text-xs text-muted-foreground">
            Get faster access and offline support
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={handleInstall} 
            className="text-xs btn-green-gradient"
            disabled={installStatus === 'installing'}
          >
            {installStatus === 'installing' ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                Installing...
              </>
            ) : (
              isMobile ? 'Install' : 'Install App'
            )}
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleDismiss} 
            className="text-muted-foreground hover:bg-accent"
            disabled={installStatus === 'installing'}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
