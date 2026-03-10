import { useEffect, useState } from "react";
import { CheckCircle, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PostInstallExperience = () => {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if this is the first time opening installed app
    const urlParams = new URLSearchParams(window.location.search);
    const isInstalled = urlParams.get('installed') === 'true';
    const hasSeenWelcome = localStorage.getItem('kissancity-welcome-seen') === 'true';
    
    // Check if running as installed PWA
    const isPWA = window.matchMedia("(display-mode: standalone)").matches || 
                  (window.navigator as any).standalone === true ||
                  document.referrer.startsWith("android-app://");

    if (isInstalled && !hasSeenWelcome && isPWA) {
      setShowWelcome(true);
      localStorage.setItem('kissancity-welcome-seen', 'true');
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleDismiss = () => {
    setShowWelcome(false);
  };

  if (!showWelcome) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in-0">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-10">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          {/* Sparkles decoration */}
          <div className="relative mb-4">
            <Sparkles className="absolute -top-2 -left-2 h-4 w-4 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute -top-1 -right-2 h-3 w-3 text-yellow-400 animate-pulse delay-75" />
            <Sparkles className="absolute -bottom-1 left-4 h-3 w-3 text-yellow-400 animate-pulse delay-150" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Kissan City!
          </h2>
          
          <p className="text-gray-600 mb-6">
            The app is now installed on your device. Enjoy faster access to fresh, farm-quality products!
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="font-semibold text-green-800 mb-1">🚀 Fast Access</div>
              <div className="text-green-600">Quick loading & offline support</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="font-semibold text-blue-800 mb-1">📱 Native Feel</div>
              <div className="text-blue-600">Designed for your device</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleDismiss}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Start Shopping
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
};
