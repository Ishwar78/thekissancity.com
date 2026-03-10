import { useEffect, useState } from "react";
import { Bug, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PWADebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        userAgent: navigator.userAgent,
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        displayMode: window.matchMedia("(display-mode: standalone)").matches,
        iosStandalone: (window.navigator as any).standalone,
        referrer: document.referrer,
        serviceWorker: 'serviceWorker' in navigator,
        beforeInstallPrompt: 'onbeforeinstallprompt' in window,
        manifest: async () => {
          try {
            const response = await fetch('/manifest.json');
            return await response.json();
          } catch (e) {
            return null;
          }
        }
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-40 bg-yellow-100 border-yellow-300 text-yellow-800"
      >
        <Bug className="h-4 w-4 mr-1" />
        Debug PWA
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-h-96 bg-white border rounded-lg shadow-lg overflow-hidden">
      <div className="bg-yellow-100 p-2 border-b border-yellow-300 flex justify-between items-center">
        <span className="font-semibold text-yellow-800 text-sm">PWA Debug Info</span>
        <Button size="sm" variant="ghost" onClick={() => setIsVisible(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-3 overflow-y-auto max-h-80 text-xs font-mono">
        {Object.entries(debugInfo).map(([key, value]) => (
          <div key={key} className="mb-2">
            <div className="font-bold text-blue-600">{key}:</div>
            <div className="text-gray-700 break-all">
              {typeof value === 'boolean' ? (value ? '✅ true' : '❌ false') : 
               typeof value === 'string' ? value : 
               typeof value === 'function' ? 'function' : 
               JSON.stringify(value, null, 2)}
            </div>
          </div>
        ))}
        
        <div className="mt-3 pt-3 border-t">
          <div className="font-bold text-green-600 mb-2">Quick Tests:</div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => console.log('🔍 Manual debug check', debugInfo)}
            className="text-xs mr-1"
          >
            Log to Console
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="text-xs"
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
};
