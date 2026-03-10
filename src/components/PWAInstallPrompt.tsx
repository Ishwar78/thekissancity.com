import { useEffect, useState } from "react";
import { Download, X, CheckCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'installed' | 'failed'>('idle');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileInstructions, setMobileInstructions] = useState(false);

  // ✅ Reliable PWA detection (ONLY correct signals)
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
    console.log("🔍 PWA Debug: Display mode:", window.matchMedia("(display-mode: standalone)").matches);
    console.log("🔍 PWA Debug: iOS standalone:", (window.navigator as any).standalone);
    console.log("🔍 PWA Debug: Referrer:", document.referrer);
    
    // Check PWA installability criteria
    const checkInstallability = async () => {
      try {
        // Check if service worker is ready
        const registration = await navigator.serviceWorker.ready;
        console.log("🔍 PWA Debug: Service worker ready:", !!registration);
        
        // Check manifest
        const manifestResponse = await fetch('/app-manifest.json');
        const manifest = await manifestResponse.json();
        console.log("🔍 PWA Debug: Manifest loaded:", manifest);
        console.log("🔍 PWA Debug: Manifest icons:", manifest.icons);
        
        // Check if icons are accessible
        for (const icon of manifest.icons) {
          const iconResponse = await fetch(icon.src, { method: 'HEAD' });
          console.log(`🔍 PWA Debug: Icon ${icon.src} accessible:`, iconResponse.ok);
        }
        
        // Check if site meets criteria manually
        console.log("🔍 PWA Debug: Installability check:");
        console.log("  - Service worker:", !!registration);
        console.log("  - Manifest exists:", !!manifest);
        console.log("  - HTTPS/localhost:", window.isSecureContext || window.location.hostname === 'localhost');
        console.log("  - Not already installed:", !isInstalledPWA());
        
      } catch (error) {
        console.error("❌ PWA Debug: Installability check failed:", error);
      }
    };
    
    checkInstallability();
    
    // 🔥 DEBUG: Check if beforeinstallprompt fires
    window.addEventListener("beforeinstallprompt", (e) => {
      console.log("🔥 beforeinstallprompt FIRED - Install is possible!", e);
      console.log("🔥 beforeinstallprompt details:", {
        platforms: (e as any).platforms,
        userChoice: !!(e as any).userChoice,
        prompt: !!(e as any).prompt
      });
    });

    window.addEventListener("appinstalled", () => {
      console.log("✅ appinstalled - App was installed!");
      console.log("✅ appinstalled details:", {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // ❌ Do NOT show prompt inside installed app
    if (isInstalledPWA()) {
      console.log("❌ PWA Debug: Already installed, skipping install prompt");
      return;
    }

    console.log("🔍 PWA Debug: Setting up install prompt listeners");

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("🔍 PWA Debug: handleBeforeInstallPrompt called", e);
      console.log("🔍 PWA Debug: Event details:", {
        type: e.type,
        bubbles: e.bubbles,
        cancelable: e.cancelable,
        timeStamp: e.timeStamp
      });
      
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Log prompt capabilities
      const promptEvent = e as any;
      console.log("🔍 PWA Debug: Prompt capabilities:", {
        hasPlatforms: !!promptEvent.platforms,
        platforms: promptEvent.platforms,
        hasUserChoice: !!promptEvent.userChoice,
        hasPrompt: !!promptEvent.prompt
      });
      
      // Check mobile directly inside handler (fix stale closure)
      const ua = navigator.userAgent;
      const mobile = /android|iphone|ipad/i.test(ua);
      console.log("📱 PWA Debug: Mobile check inside handler:", mobile, ua);
      
      // Show install prompt for both mobile and desktop (fix Bug 2)
      console.log("� PWA Debug: Showing install prompt (works on both mobile and desktop)");
      setShowPrompt(true);
      
      console.log("🔍 PWA Debug: Install prompt should show now");
    };

    const handleAppInstalled = () => {
      console.log("✅ PWA Debug: App installed event fired!");
      console.log("✅ PWA Debug: Installation successful - checking display mode:", window.matchMedia("(display-mode: standalone)").matches);
      console.log("✅ PWA Debug: iOS standalone check:", (window.navigator as any).standalone);
      console.log("✅ PWA Debug: Current URL after install:", window.location.href);
      
      setDeferredPrompt(null);
      setShowPrompt(false);
      setInstallStatus('installed');
      setShowSuccessMessage(true);
      
      // Force a re-check after a delay
      setTimeout(() => {
        console.log("🔍 PWA Debug: Post-install check - Display mode:", window.matchMedia("(display-mode: standalone)").matches);
        console.log("🔍 PWA Debug: Post-install check - iOS standalone:", (window.navigator as any).standalone);
      }, 1000);
      
      toast.success("Kissan City App installed successfully!", {
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
    
    if (!deferredPrompt) {
      // For mobile, show browser-specific instructions
      if (isMobile) {
        console.log("📱 PWA Debug: Showing mobile instructions");
        setMobileInstructions(true);
        return;
      }
      console.log("❌ PWA Debug: No deferred prompt available");
      return;
    }

    setInstallStatus('installing');
    console.log("⏳ PWA Debug: Starting installation process...");
    
    try {
      console.log("📱 PWA Debug: Prompting user for installation...");
      deferredPrompt.prompt();
      
      console.log("⏳ PWA Debug: Waiting for user choice...");
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log("📊 PWA Debug: User choice:", outcome);
      console.log("📊 PWA Debug: User choice details:", { outcome, accepted: outcome === "accepted" });

      if (outcome === "accepted") {
        console.log("✅ PWA Debug: User accepted installation");
        setDeferredPrompt(null);
        setShowPrompt(false);
        setMobileInstructions(false);
        setInstallStatus('installed');
        
        // Check if appinstalled event fires
        setTimeout(() => {
          console.log("🔍 PWA Debug: Checking if appinstalled event fired (5s timeout)");
          console.log("🔍 PWA Debug: Current display mode:", window.matchMedia("(display-mode: standalone)").matches);
        }, 5000);
        
        // Show immediate feedback
        toast.success("Installing Kissan City App...", {
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
      console.error("❌ PWA Debug: Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setInstallStatus('failed');
      toast.error("Installation failed", {
        description: "Please try again or contact support",
        duration: 4000
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setMobileInstructions(false);
    toast.info("Install prompt dismissed", {
      description: "You can install later from the browser menu",
      duration: 3000
    });
  };

  // ❌ Never render inside installed app
  console.log("🔍 PWA Debug: Render check - showPrompt:", showPrompt, "isInstalled:", isInstalledPWA());
  if ((!showPrompt && !mobileInstructions) || isInstalledPWA()) return null;

  // Mobile instructions modal
  if (mobileInstructions && isMobile) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in-0">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Install Kissan City App
            </h2>
            
            <div className="text-left mb-6 space-y-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="font-semibold text-blue-800 mb-1">
                  {/android/i.test(navigator.userAgent) ? '🤖 Android (Chrome)' : '🍎 iPhone (Safari)'}
                </div>
                <div className="text-sm text-blue-600">
                  {/android/i.test(navigator.userAgent) 
                    ? 'Tap the menu (⋮) in Chrome, then "Add to Home screen"'
                    : 'Tap the Share (⎋) button, then "Add to Home Screen"'}
                </div>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-3">
                <div className="font-semibold text-amber-800 mb-1">💡 Pro Tip</div>
                <div className="text-sm text-amber-600">
                  Look for the app icon on your home screen after installation
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setMobileInstructions(false)}
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
        <div className="bg-green-50 border-green-200 rounded-lg shadow-lg p-4 flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1 text-green-800">Successfully Installed!</h3>
            <p className="text-xs text-green-600">
              Find Kissan City on your home screen for quick access
            </p>
          </div>
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowSuccessMessage(false)}
            className="text-green-600 hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-card border-border rounded-lg shadow-lg p-4 flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <Download className="h-6 w-6 text-primary-foreground" />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1 text-foreground">Install Kissan City App</h3>
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
              isMobile ? 'Show Instructions' : 'Install'
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