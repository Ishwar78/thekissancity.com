import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

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
    // 🔥 DEBUG: Check if beforeinstallprompt fires
    window.addEventListener("beforeinstallprompt", (e) => {
      console.log("🔥 beforeinstallprompt FIRED - Install is possible!", e);
      console.log("🔥 beforeinstallprompt FIRED - Install is possible!", e);
    });

    window.addEventListener("appinstalled", () => {
      console.log("✅ appinstalled - App was installed!");
      console.log("✅ appinstalled - App was installed!");
    });

    // ❌ Do NOT show prompt inside installed app
    if (isInstalledPWA()) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true); // show ONLY when install is possible
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  // ❌ Never render inside installed app
  if (!showPrompt || isInstalledPWA()) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <Download className="h-6 w-6 text-primary-foreground" />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1">Install uni10 App</h3>
          <p className="text-xs text-muted-foreground">
            Get faster access and offline support
          </p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={handleInstall} className="text-xs">
            Install
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};