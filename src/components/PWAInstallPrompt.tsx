import { useEffect, useState } from "react";
import { Download, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const isInstalledPWA = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as any).standalone === true ||
  document.referrer.startsWith("android-app://");

const isHTTP = () =>
  window.location.protocol === "http:" &&
  window.location.hostname !== "localhost";

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(
    () => (window as any).__pwaPromptEvent ?? null   // ← pick up early-captured event
  );
  const [showPrompt, setShowPrompt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [installing, setInstalling] = useState(false);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    if (isInstalledPWA()) return;

    // If we already have the early-captured prompt, show immediately
    if ((window as any).__pwaPromptEvent) {
      setShowPrompt(true);
    }

    // Also listen for it in case it fires after mount
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      setShowSuccess(true);
      (window as any).__pwaPromptEvent = null;
      toast.success("The Kissan City installed!", {
        description: "Find it on your home screen",
        duration: 5000,
        icon: <CheckCircle className="h-4 w-4" />,
      });
      setTimeout(() => setShowSuccess(false), 5000);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    // iOS: no beforeinstallprompt, must use manual instructions
    if (isIOS) {
      toast.info("To install on iOS: tap Share → Add to Home Screen", {
        duration: 6000,
      });
      return;
    }

    if (!deferredPrompt) {
      // No prompt = HTTP localhost or Chrome engagement timer not met
      toast.warning(
        window.location.protocol === "http:"
          ? "Run the app over HTTPS to enable real installation"
          : "Open browser menu → Install app",
        { duration: 5000 }
      );
      return;
    }

    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        (window as any).__pwaPromptEvent = null;
        setShowPrompt(false);
        toast.success("Installing The Kissan City...", { duration: 3000 });
      } else {
        toast.info("Installation cancelled", { duration: 2000 });
      }
    } catch (err) {
      console.error("PWA install error:", err);
      toast.error("Installation failed — try from the browser menu");
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    toast.info("You can install later from the browser menu", { duration: 3000 });
  };

  if (isInstalledPWA()) return null;

  if (showSuccess) {
    return (
      <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-top-5">
        <div className="bg-green-500 rounded-lg shadow-lg p-4 flex items-center gap-4">
          <CheckCircle className="h-6 w-6 text-white flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-sm text-white">Successfully Installed!</p>
            <p className="text-xs text-white/80">Find The Kissan City on your home screen</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setShowSuccess(false)}
            className="text-white hover:bg-green-600">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <Download className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm text-foreground">Install The Kissan City App</h3>
          <p className="text-xs text-muted-foreground">Faster access · Works offline</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleInstall} className="text-xs btn-green-gradient"
            disabled={installing}>
            {installing ? (
              <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />Installing...</>
            ) : isIOS ? "How to install" : "Install"}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}
            className="text-muted-foreground hover:bg-accent" disabled={installing}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};