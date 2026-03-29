const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? "https://kissancity-1.onrender.com" : "http://localhost:5000");

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

 

export async function api(path: string, options: RequestInit = {}) {
  // Add cache-busting timestamp for GET requests only
  const url = path.startsWith("http") ? path : joinUrl(API_BASE, path);
  
  // Only add timestamp for GET requests to avoid caching issues
  const finalUrl = path.startsWith("http") ? url : (
    (options.method === 'GET' || !options.method) 
      ? (url.includes('?') ? `${url}&_t=${Date.now()}` : `${url}?_t=${Date.now()}`)
      : url
  );

  console.log('🌐 [API] Request:', {
    path,
    method: options.method || 'GET',
    finalUrl,
    API_BASE,
    isProduction: import.meta.env.PROD
  });
  
  // Log the full request details for debugging
  console.log('🌐 [API] Full request details:', {
    url: finalUrl,
    options: {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body
    }
  });

  if (
    API_BASE &&
    isLocalhost(API_BASE) &&
    !location.hostname.includes("localhost") &&
    !location.hostname.includes("127.0.0.1")
  ) {
    const relUrl = path.startsWith("http")
      ? path
      : (path.startsWith("/api") ? path : `/api${path.startsWith("/") ? path : `/${path}`}`);

    try {
      const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
      const relHeaders = options.body instanceof FormData
        ? { ...(options.headers || {}) } as Record<string,string>
        : { "Content-Type": "application/json", ...(options.headers || {}) } as Record<string,string>;
      if (token) relHeaders['Authorization'] = `Bearer ${token}`;

      const { headers: _, ...optionsWithoutHeaders } = options;
      const res = await fetch(relUrl, {
        credentials: "include",
        headers: relHeaders,
        cache: "no-store",
        ...optionsWithoutHeaders,
      });

      const json = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, json };
    } catch (relErr) {
      // Re-throwing the error to propagate it.
      throw relErr;
    }
  }

  console.log('🌐 [API] Using absolute URL path');
  
  try {
    const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
    const headers = options.body instanceof FormData
      ? { ...(options.headers || {}) } as Record<string,string>
      : { "Content-Type": "application/json", ...(options.headers || {}) } as Record<string,string>;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log('🌐 [API] Headers being sent:', headers);

    const { headers: _, ...optionsWithoutHeaders } = options;
    const res = await fetch(finalUrl, {
      credentials: "include",
      headers,
      cache: "no-store",
      ...optionsWithoutHeaders,
    });

    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, json };
  } catch (error: any) {
    console.error('🌐 [API] Absolute request error:', error);
    // Re-throwing error to propagate it.
    throw error;
  }
}
