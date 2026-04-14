// TheKissanCity PWA Service Worker
const CACHE_NAME = 'thekissancity-v3';
const STATIC_CACHE = 'thekissancity-static-v3';
const DYNAMIC_CACHE = 'thekissancity-dynamic-v3';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest-icon-192.maskable.png',
  '/manifest-icon-512.maskable.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('PWA: Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('PWA: Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => {
          // Strip query parameters for consistent caching
          const urlObj = new URL(url, self.location.origin);
          urlObj.search = '';
          return urlObj.toString();
        }));
      })
      .then(() => {
        console.log('PWA: Service Worker installed successfully');
        // Trigger install prompt
        self.skipWaiting();
      })
      .catch(error => {
        console.error('PWA: Failed to cache static assets:', error);
        // Don't fail installation if caching fails
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('PWA: Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
            .map(cacheName => {
              console.log('PWA: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('PWA: Service Worker activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Optimize API requests: Strip cache-busting timestamp (_t) before processing
  let cleanUrl = request.url;
  if (url.searchParams.has('_t')) {
    const cleanParams = new URLSearchParams(url.search);
    cleanParams.delete('_t');
    const paramsStr = cleanParams.toString();
    cleanUrl = `${url.origin}${url.pathname}${paramsStr ? '?' + paramsStr : ''}`;
  }
  
  // Handle different request types
  if (url.origin === self.location.origin) {
    // Static assets - cache first strategy
    if (STATIC_ASSETS.includes(url.pathname) || url.pathname === '/') {
      event.respondWith(
        caches.match(cleanUrl, { ignoreSearch: true })
          .then(response => {
            if (response) {
              return response;
            }
            
            return fetch(request)
              .then(networkResponse => {
                if (networkResponse.ok) {
                  const responseClone = networkResponse.clone();
                  caches.open(STATIC_CACHE)
                    .then(cache => {
                      return cache.match(cleanUrl, { ignoreSearch: true })
                        .then(existing => {
                          if (!existing) {
                            return cache.put(cleanUrl, responseClone)
                              .catch(err => console.log('Static cache put error (non-critical):', err));
                          }
                        });
                    })
                    .catch(err => console.log('Static cache operation error (non-critical):', err));
                }
                return networkResponse;
              });
          })
      );
      return;
    }
    
    // Dynamic content - network first strategy
    event.respondWith(
      caches.match(cleanUrl, { ignoreSearch: true })
        .then(response => {
          const fetchAndCache = () => {
            return fetch(request)
              .then(networkResponse => {
                if (networkResponse.ok) {
                  // Only cache non-media files to avoid storage bloat
                  const isMedia = url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|mp4|webm|ogg|wav|mp3)$/i);
                  const isApi = url.pathname.startsWith('/api');
                  
                  if (!isMedia) {
                    const networkClone = networkResponse.clone();
                    caches.open(DYNAMIC_CACHE)
                      .then(cache => {
                        // Check if already cached to avoid "Entry already exists" error
                        return cache.match(cleanUrl, { ignoreSearch: true })
                          .then(existing => {
                            if (!existing) {
                              return cache.put(cleanUrl, networkClone)
                                .catch(err => console.log('Cache put error (non-critical):', err));
                            }
                          })
                          .then(() => limitCacheSize(DYNAMIC_CACHE, 50));
                      })
                      .catch(err => console.log('Cache operation error (non-critical):', err));
                  }
                }
                return networkResponse;
              })
              .catch(err => {
                console.log('Fetch error:', err);
                throw err;
              });
          };

          if (response) {
            // Serve from cache if network fails, but still attempt to update in background
            return fetchAndCache().catch(() => response);
          }
          
          return fetchAndCache();
        })
    );
  } else {
    // External requests (Cloudinary, etc.) - pass through without caching
    event.respondWith(fetch(request));
  }
});

// Helper function to limit cache size (iterative to avoid stack overflow)
async function limitCacheSize(name, maxItems) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  while (keys.length > maxItems) {
    await cache.delete(keys[0]);
    keys.shift(); // Remove the first key we just deleted
  }
}

// Handle background sync for offline functionality
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('PWA: Background sync triggered');
    event.waitUntil(
      // Handle any queued actions when back online
      Promise.resolve()
    );
  }
});

// Handle push notifications
self.addEventListener('push', event => {
  console.log('PWA: Push notification received');
  
  const options = {
    body: event.data.text(),
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('TheKissanCity', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('PWA: Notification clicked');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Handle messages from main thread
self.addEventListener('message', event => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'TRIGGER_INSTALL':
      console.log('PWA: Install trigger received');
      // Trigger install prompt if available
      if ('beforeinstallprompt' in self) {
        // This would be handled by the main thread
        console.log('PWA: Install prompt available in main thread');
      }
      break;
      
    case 'SKIP_WAITING':
      console.log('PWA: Skipping waiting');
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: '1.0.0' });
      break;
      
    default:
      console.log('PWA: Unknown message type:', type);
  }
});

// Periodic cache cleanup - simplified version
self.addEventListener('message', event => {
  if (event.data.type === 'CACHE_CLEANUP') {
    console.log('PWA: Performing cache cleanup');
    
    event.waitUntil(
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              return caches.open(cacheName)
                .then(cache => cache.keys())
                .then(requests => {
                  // Remove old entries if cache is too large
                  if (requests.length > 50) {
                    const toDelete = requests.slice(0, requests.length - 50);
                    return Promise.all(toDelete.map(req => cache.delete(req)));
                  }
                })
            })
          );
        })
    );
  }
});

console.log('PWA: Service Worker loaded successfully');
