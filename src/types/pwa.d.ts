// PWA TypeScript Type Definitions

declare global {
  interface Window {
    // Service Worker Registration
    serviceWorker?: {
      ready: Promise<ServiceWorkerRegistration>;
      register: (scriptURL: string, options?: RegistrationOptions) => Promise<ServiceWorkerRegistration>;
      controller: ServiceWorker | null;
    };

    // Before Install Prompt Event
    beforeinstallprompt?: {
      addEventListener: (type: 'beforeinstallprompt', listener: (event: BeforeInstallPromptEvent) => void) => void;
      removeEventListener: (type: 'beforeinstallprompt', listener: (event: BeforeInstallPromptEvent) => void) => void;
    };

    // App Installed Event
    appinstalled?: {
      addEventListener: (type: 'appinstalled', listener: (event: Event) => void) => void;
      removeEventListener: (type: 'appinstalled', listener: (event: Event) => void) => void;
    };

    // PWA Custom Events
    addEventListener: (type: 'pwa-need-refresh' | 'pwa-offline-ready', listener: (event: CustomEvent) => void) => void;
    removeEventListener: (type: 'pwa-need-refresh' | 'pwa-offline-ready', listener: (event: CustomEvent) => void) => void;
    dispatchEvent: (event: CustomEvent) => boolean;
  }

  interface Navigator {
    // Standalone mode detection (iOS)
    standalone?: boolean;
    
    // Web Share API
    share?: (data: ShareData) => Promise<void>;
    canShare?: (data: ShareData) => boolean;
    
    // Wake Lock API
    wakeLock?: {
      request: (type: WakeLockType) => Promise<WakeLockSentinel>;
    };
    
    // Screen Orientation API
    lockOrientation?: (orientation: OrientationLockType) => Promise<boolean>;
    unlockOrientation?: () => void;
  }

  interface ScreenOrientation {
    lock: (orientation: OrientationLockType) => Promise<void>;
    unlock: () => void;
    type: OrientationType;
    angle: number;
  }

  interface Screen {
    orientation?: ScreenOrientation;
  }

  // Media Query for PWA detection
  interface MediaQueryList {
    matches: boolean;
    media: string;
    onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;
    addListener: (listener: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null) => void;
    removeListener: (listener: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null) => void;
    addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
    removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
    dispatchEvent: (event: Event) => boolean;
  }

  interface MediaQueryListEvent extends Event {
    matches: boolean;
    media: string;
  }
}

// Before Install Prompt Event Interface
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Service Worker Registration Options
interface RegistrationOptions {
  scope?: string;
  type?: 'classic' | 'module';
  updateViaCache?: 'none' | 'all' | 'imports';
}

// Share Data Interface
interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

// Wake Lock Types
type WakeLockType = 'screen';

interface WakeLockSentinel extends EventTarget {
  readonly released: boolean;
  readonly type: WakeLockType;
  release(): Promise<void>;
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
  removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
  dispatchEvent: (event: Event) => boolean;
}

// Screen Orientation Types
type OrientationLockType = 
  | 'any'
  | 'natural'
  | 'landscape'
  | 'portrait'
  | 'portrait-primary'
  | 'portrait-secondary'
  | 'landscape-primary'
  | 'landscape-secondary';

type OrientationType = 
  | 'portrait-primary'
  | 'portrait-secondary'
  | 'landscape-primary'
  | 'landscape-secondary';

// PWA Manifest Interface
interface WebAppManifest {
  name?: string;
  short_name?: string;
  description?: string;
  start_url?: string;
  display?: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  orientation?: 'any' | 'natural' | 'landscape' | 'portrait';
  theme_color?: string;
  background_color?: string;
  scope?: string;
  lang?: string;
  dir?: 'ltr' | 'rtl';
  categories?: string[];
  icons?: ManifestImageResource[];
  shortcuts?: ManifestShortcut[];
  screenshots?: ManifestScreenshot[];
  related_applications?: ManifestRelatedApplication[];
  prefer_related_applications?: boolean;
  id?: string;
}

interface ManifestImageResource {
  src: string;
  sizes?: string;
  type?: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
  platform?: string;
}

interface ManifestShortcut {
  name: string;
  short_name?: string;
  description?: string;
  url: string;
  icons?: ManifestImageResource[];
}

interface ManifestScreenshot {
  src: string;
  sizes?: string;
  type?: string;
  form_factor?: 'wide' | 'narrow';
  label?: string;
}

interface ManifestRelatedApplication {
  platform: string;
  url?: string;
  id?: string;
  min_version?: string;
}

// PWA Install Status
type PWAInstallStatus = 'idle' | 'installing' | 'installed' | 'failed' | 'unsupported';

// PWA Install Context Interface
interface PWAInstallContext {
  deferredPrompt: BeforeInstallPromptEvent | null;
  installStatus: PWAInstallStatus;
  isInstalled: boolean;
  isSupported: boolean;
  isMobile: boolean;
  showInstallPrompt: () => Promise<boolean>;
  dismissInstallPrompt: () => void;
}

// PWA Update Context Interface
interface PWAUpdateContext {
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => void;
}

// Export types for use in components
export type {
  BeforeInstallPromptEvent,
  WebAppManifest,
  PWAInstallStatus,
  PWAInstallContext,
  PWAUpdateContext,
  ManifestImageResource,
  ManifestShortcut,
  ManifestScreenshot,
  ShareData,
  WakeLockSentinel,
  RegistrationOptions
};

export {};
