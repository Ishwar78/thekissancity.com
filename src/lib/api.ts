const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? "https://thekissancity.com" : "http://localhost:5000");

const IS_DEV = import.meta.env.DEV;

function isLocalhost(url: string) {
  try {
    return url.includes("localhost") || url.includes("127.0.0.1");
  } catch {
    return false;
  }
}

function joinUrl(base: string, p: string) {
  if (!base) return p;
  if (p.startsWith("http")) return p;
  if (!base.endsWith("/") && !p.startsWith("/")) return `${base}/${p}`;
  if (base.endsWith("/") && p.startsWith("/")) return `${base}${p.slice(1)}`;
  return `${base}${p}`;
}

// Cache TTLs in milliseconds
const CACHE_TTL: Record<string, number> = {
  '/api/categories':        5 * 60 * 1000,  // 5 min
  '/api/regions':           5 * 60 * 1000,  // 5 min
  '/api/settings/home':     5 * 60 * 1000,  // 5 min
  '/api/influencer':        5 * 60 * 1000,  // 5 min
  '/api/about-us':         10 * 60 * 1000,  // 10 min
  '/api/product-slider':    2 * 60 * 1000,  // 2 min
  '/api/products':          1 * 60 * 1000,  // 1 min
  '/api/reviews':           2 * 60 * 1000,  // 2 min
};

// Simple in-memory cache
const memCache = new Map<string, { data: any; exp: number }>();

function getCacheTTL(path: string): number {
  for (const [key, ttl] of Object.entries(CACHE_TTL)) {
    if (path.includes(key)) return ttl;
  }
  return 0; // no cache by default
}

export async function api(path: string, options: RequestInit = {}) {
  const isWrite = options.method && options.method !== 'GET';
  
  // Only cache GET requests
  if (!isWrite) {
    const cached = memCache.get(path);
    if (cached && Date.now() < cached.exp) {
      if (IS_DEV) console.log(`📦 [API] Cache hit: ${path}`);
      return cached.data;
    }
  }

  const url = path.startsWith("http") ? path : joinUrl(API_BASE, path);

  if (IS_DEV) {
    console.log(`🌐 [API] ${options.method || 'GET'} ${path}`);
  }

  const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
  
  const headers = options.body instanceof FormData
    ? { ...(options.headers || {}) } as Record<string, string>
    : { "Content-Type": "application/json", ...(options.headers || {}) } as Record<string, string>;
  
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const { headers: _, ...optionsWithoutHeaders } = options;

  try {
    const fetchStart = Date.now();
    const res = await fetch(url, {
      credentials: "include",
      headers,
      // ✅ Allow browser caching for GET requests
      cache: isWrite ? "no-store" : "default",
      ...optionsWithoutHeaders,
    });
    const fetchDuration = Date.now() - fetchStart;

    // Log timing to diagnose slow calls
    console.log(`⏱️ ${fetchDuration}ms — ${path}`);

    const json = await res.json().catch(() => ({}));
    const result = { ok: res.ok, status: res.status, json };

    // Store in memory cache for GET requests
    if (!isWrite && res.ok) {
      const ttl = getCacheTTL(path);
      if (ttl > 0) {
        memCache.set(path, { data: result, exp: Date.now() + ttl });
      }
    }

    return result;
  } catch (error: any) {
    if (IS_DEV) console.error('🌐 [API] Error:', error);
    throw error;
  }
}

// Call this after any mutation to invalidate related cache
export function invalidateCache(pathPrefix: string) {
  for (const key of memCache.keys()) {
    if (key.includes(pathPrefix)) {
      memCache.delete(key);
    }
  }
}