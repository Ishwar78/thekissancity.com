// TheKissanCity PWA Service Worker
const CACHE_NAME = 'thekissancity-v1';
const STATIC_CACHE = 'thekissancity-static-v1';
const DYNAMIC_CACHE = 'thekissancity-dynamic-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-72.png',
  '/icon-96.png',
  '/icon-128.png',
  '/icon-144.png',
  '/icon-152.png',
  '/icon-192.png',
  '/icon-384.png',
  '/icon-512.png',
  '/logo.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('PWA: Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('PWA: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('PWA: Service Worker installed successfully');
        // Trigger install prompt
        self.skipWaiting();
      })
      .catch(error => {
        console.error('PWA: Failed to cache static assets:', error);
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
  
  // Handle different request types
  if (url.origin === self.location.origin) {
    // Static assets - cache first strategy
    if (STATIC_ASSETS.includes(url.pathname) || url.pathname === '/') {
      event.respondWith(
        caches.match(request)
          .then(response => {
            if (response) {
              console.log('PWA: Serving from cache:', url.pathname);
              return response;
            }
            
            // If not in cache, fetch from network
            return fetch(request)
              .then(response => {
                // Cache successful responses
                if (response.ok) {
                  const responseClone = response.clone();
                  caches.open(STATIC_CACHE)
                    .then(cache => cache.put(request, responseClone));
                }
                return response;
              });
          })
      );
      return;
    }
    
    // Dynamic content - network first strategy
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            // Serve from cache if network fails
            return fetch(request)
              .then(networkResponse => {
                // Update cache with fresh content
                if (networkResponse.ok) {
                  const networkClone = networkResponse.clone();
                  caches.open(DYNAMIC_CACHE)
                    .then(cache => cache.put(request, networkClone));
                }
                return networkResponse;
              })
              .catch(() => {
                console.log('PWA: Network failed, serving from cache:', url.pathname);
                return response;
              });
          }
          
          // Not in cache, fetch from network
          return fetch(request)
            .then(response => {
              // Cache successful responses
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE)
                  .then(cache => cache.put(request, responseClone));
              }
              return response;
            });
        })
    );
  } else {
    // External requests - pass through
    event.respondWith(fetch(request));
  }
});

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
    badge: '/icon-96.png',
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

// Periodic cache cleanup
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
                  return Promise.all(
                    requests.map(request => {
                      return cache.match(request).then(response => {
                        if (response) {
                          const responseClone = response.clone();
                          return cache.put(request, responseClone);
                        }
                      });
                    })
                  );
                })
            })
          );
        })
      );
  }
});

console.log('PWA: Service Worker loaded successfully');
