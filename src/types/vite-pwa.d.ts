// Vite PWA virtual module type declarations

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onOfflineReady?: () => void;
    onNeedRefresh?: () => void;
    onRegisteredSW?: (swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: any) => void;
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

declare module 'virtual:pwa-info' {
  export interface PWAInfo {
    name?: string;
    shortName?: string;
    description?: string;
    themeColor?: string;
    backgroundColor?: string;
    display?: string;
    icons?: Array<{
      src: string;
      sizes: string;
      type: string;
    }>;
  }

  export const pwaInfo: PWAInfo;
  export const pwaInjectStyle: string;
  export const pwaInjectManifest: string;
  export const pwaAssets: Record<string, string>;
}
