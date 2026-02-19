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
    console.log("🔍 PWA Debug: Component mounted");
    console.log("🔍 PWA Debug: Is installed?", isInstalledPWA());
    
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
    if (isInstalledPWA()) {
      console.log("❌ PWA Debug: Already installed, skipping install prompt");
      return;
    }

    console.log("🔍 PWA Debug: Setting up install prompt listeners");

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("🔍 PWA Debug: handleBeforeInstallPrompt called", e);
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true); // show ONLY when install is possible
      console.log("🔍 PWA Debug: Install prompt should show now");
    };

    const handleAppInstalled = () => {
      console.log("✅ PWA Debug: App installed event");
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
  console.log("🔍 PWA Debug: Render check - showPrompt:", showPrompt, "isInstalled:", isInstalledPWA());
  if (!showPrompt || isInstalledPWA()) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-black border border-gray-700 rounded-lg shadow-lg p-4 flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
          <Download className="h-6 w-6 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1 text-white">Install Kissan City App</h3>
          <p className="text-xs text-gray-300">
            Get faster access and offline support
          </p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={handleInstall} className="text-xs bg-white text-black hover:bg-gray-200">
            Install
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss} className="text-white hover:bg-gray-800">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};