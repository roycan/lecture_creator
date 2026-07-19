// Service Worker - Cache First Strategy
// Best for: Static assets that don't change often (CSS, JS, images)
// Perfect for: Philippine context (works during brownouts!)

const CACHE_NAME = 'my-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html'  // Fallback page
];

// INSTALL EVENT - Cache files when SW is first installed
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[SW] All files cached!');
        return self.skipWaiting();  // Activate immediately
      })
      .catch((error) => {
        console.error('[SW] Cache failed:', error);
      })
  );
});

// ACTIVATE EVENT - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated!');
        return self.clients.claim();  // Take control immediately
      })
  );
});

// FETCH EVENT - Serve from cache first, network as fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', event.request.url);
          return cachedResponse;
        }
        
        // Not in cache - fetch from network
        console.log('[SW] Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache the new response for next time
            return caches.open(CACHE_NAME)
              .then((cache) => {
                // Only cache successful responses
                if (networkResponse.status === 200) {
                  cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
              });
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            
            // If requesting an HTML page, show offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// =============================================
// HOW TO USE THIS SERVICE WORKER
// =============================================
// 1. Save this file as 'sw-cache-first.js' in your project root
// 2. Register it in your main HTML file (see below)
// 3. Update ASSETS_TO_CACHE with your actual files
// 4. Update CACHE_NAME when you make changes (increment version)

// =============================================
// REGISTER SERVICE WORKER (in your index.html)
// =============================================
/*
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw-cache-first.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
</script>
*/

// =============================================
// PHILIPPINE CONTEXT BENEFITS
// =============================================
// ✅ Works during brownouts (no internet needed)
// ✅ Saves data costs (₱50-200/month)
// ✅ Instant loading (< 1 second)
// ✅ Works on slow 2G/3G connections
// ✅ Reliable for sari-sari store, barangay apps

// =============================================
// WHEN TO USE CACHE-FIRST
// =============================================
// ✓ Static assets (CSS, JS, images, fonts)
// ✓ App shell (layout that rarely changes)
// ✓ Content that doesn't update frequently
// ✓ Philippine government forms (offline access)
// ✓ Store inventory app (product images, layout)

// =============================================
// WHEN NOT TO USE CACHE-FIRST
// =============================================
// ✗ Real-time data (stock prices, news feeds)
// ✗ User-specific data (profiles, messages)
// ✗ Frequently changing content (social media)
// ✗ API calls that need fresh data

// =============================================
// UPDATING YOUR APP
// =============================================
// When you make changes to your app:
// 1. Update CACHE_NAME (e.g., 'my-app-v1' → 'my-app-v2')
// 2. Update ASSETS_TO_CACHE if you added/removed files
// 3. The activate event will delete old caches automatically
// 4. Users get the update on next visit

// =============================================
// TESTING
// =============================================
// 1. Open Chrome DevTools → Application → Service Workers
// 2. Check "Update on reload" while developing
// 3. Check "Offline" to test offline functionality
// 4. View Cache Storage to see cached files

// =============================================
// TROUBLESHOOTING
// =============================================
// Problem: Changes not showing
// Solution: Unregister SW in DevTools, clear cache, reload

// Problem: SW not installing
// Solution: Check console for errors, must be HTTPS or localhost

// Problem: Files not caching
// Solution: Check ASSETS_TO_CACHE paths are correct
