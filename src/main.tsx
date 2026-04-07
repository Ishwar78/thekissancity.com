import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { CouponRefreshProvider } from "./hooks/useCouponRefresh.tsx";

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register';

// Polyfills for older browsers
import "core-js/stable";
import "regenerator-runtime/runtime";

// Workaround for the "ResizeObserver loop completed with undelivered notifications"
// Some browsers throw this error intermittently; swallow known ResizeObserver errors
// to avoid noisy logs or uncaught exceptions that crash the app.
if (typeof window !== "undefined" && (window as any).ResizeObserver) {
  const RO = (window as any).ResizeObserver as typeof ResizeObserver;
  const originalObserve = RO.prototype.observe;

  RO.prototype.observe = function (this: ResizeObserver, ...args: any[]) {
    try {
      return originalObserve.apply(this, args);
    } catch (e: any) {
      // Ignore the specific ResizeObserver loop errors which are non-actionable
      if (e instanceof Error && /ResizeObserver loop (limit exceeded|completed)/i.test(e.message)) {
        // swallow
        return;
      }
      throw e;
    }
  };
}

// Register Service Worker with PWA update handling
// Enable PWA in development for testing
const isDevelopment = import.meta.env.DEV;
const isPWAEnabled = true; // Always enable PWA for testing

let updateSW: any = null;

if (isPWAEnabled) {
  updateSW = registerSW({
    onOfflineReady() {
      console.log('📱 App ready to work offline');
      // Show offline ready notification
      window.dispatchEvent(new CustomEvent('pwa-offline-ready'));
    },
    onNeedRefresh() {
      console.log('🔄 New content available, please refresh');
      // Show update prompt
      window.dispatchEvent(new CustomEvent('pwa-need-refresh'));
    },
    onRegisteredSW(swScriptUrl, registration) {
      console.log('✅ Service Worker registered at:', swScriptUrl);
      
      // Disable automatic update checks during development to prevent reloads
      // Uncomment the following for production
      /*
      if (registration) {
        setInterval(() => {
          console.log('🔍 Checking for app updates...');
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
      }
      */
    },
    onRegisterError(error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  });
}

// Development helper for PWA testing
if (isDevelopment) {
  (window as any).disablePWA = () => {
    localStorage.setItem('enable-pwa', 'false');
    console.log('🔄 PWA disabled. Reload the page to deactivate service worker.');
    window.location.reload();
  };
  
  console.log('💡 PWA is enabled in development. Run disablePWA() in console to disable.');
}

createRoot(document.getElementById("root")!).render(
  <CouponRefreshProvider>
    <App />
  </CouponRefreshProvider>
);
