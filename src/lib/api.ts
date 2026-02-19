const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

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
  const url = path.startsWith("http") ? path : joinUrl(API_BASE, path);

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
      const relRes = await fetch(relUrl, {
        credentials: "include",
        headers: relHeaders,
        cache: "no-store",
        ...optionsWithoutHeaders,
      });
      const relJson = await relRes.json().catch(() => ({}));
      if (relRes.ok) return { ok: true, status: relRes.status, json: relJson };
      return { ok: relRes.ok, status: relRes.status, json: relJson };
    } catch (relErr) {
      // Re-throwing the error to propagate it.
      throw relErr;
    }
  }

  try {
    const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
    const headers = options.body instanceof FormData
      ? { ...(options.headers || {}) } as Record<string,string>
      : { "Content-Type": "application/json", ...(options.headers || {}) } as Record<string,string>;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const { headers: _, ...optionsWithoutHeaders } = options;
    const res = await fetch(url, {
      credentials: "include",
      headers,
      cache: "no-store",
      ...optionsWithoutHeaders,
    });

    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, json };
  } catch (error: any) {
    // Re-throwing the error to propagate it.
    throw error;
  }
}
