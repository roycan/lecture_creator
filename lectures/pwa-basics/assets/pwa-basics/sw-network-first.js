// Service Worker - Network First Strategy
// Best for: Dynamic content that changes frequently (news, prices, user data)
// Use when: Fresh data is priority, but offline fallback is still needed

const CACHE_NAME = 'my-app-network-first-v1';
const TIMEOUT = 3000;  // 3 seconds (adjust for Philippine 2G/3G speeds)
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/offline.html'
];

// INSTALL EVENT - Cache essential files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential files');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
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
      .then(() => self.clients.claim())
  );
});

// FETCH EVENT - Try network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Race between fetch and timeout
    Promise.race([
      fetch(event.request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), TIMEOUT)
      )
    ])
      .then((networkResponse) => {
        // Got response from network - cache it!
        console.log('[SW] Got fresh data from network:', event.request.url);
        
        return caches.open(CACHE_NAME)
          .then((cache) => {
            // Cache the response for offline use
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
      })
      .catch((error) => {
        // Network failed or timed out - try cache
        console.log('[SW] Network failed, trying cache:', event.request.url);
        
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Serving stale data from cache');
              return cachedResponse;
            }
            
            // No cache either - show offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            // For other resources, just fail
            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// =============================================
// HOW TO USE THIS SERVICE WORKER
// =============================================
// 1. Save this file as 'sw-network-first.js' in your project root
// 2. Register it in your main HTML file (see below)
// 3. Update TIMEOUT for Philippine internet speeds
//    - 2G: 5000ms (5 seconds)
//    - 3G: 3000ms (3 seconds)
//    - 4G: 1000ms (1 second)
// 4. Update CACHE_NAME when you make changes

// =============================================
// REGISTER SERVICE WORKER (in your index.html)
// =============================================
/*
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw-network-first.js')
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
// PHILIPPINE CONTEXT CONSIDERATIONS
// =============================================
// Network speeds:
// - 2G: 50-100 Kbps (rural areas)
// - 3G: 1-3 Mbps (most common)
// - 4G: 5-20 Mbps (cities)
//
// Timeout recommendations:
// - 5 seconds for 2G users (patient, expect slow)
// - 3 seconds for 3G users (balanced)
// - 1 second for 4G users (fast, but can fallback)
//
// Data costs:
// - Fresh data = ₱1-5 per request
// - Cached data = ₱0 (free!)
// - Balance: Try network (fresh), fallback to cache (saves money)

// =============================================
// WHEN TO USE NETWORK-FIRST
// =============================================
// ✓ News feeds (latest articles)
// ✓ Price checkers (current prices)
// ✓ Weather apps (current conditions)
// ✓ Social media (recent posts)
// ✓ Stock market data
// ✓ User profiles (might have updated)

// =============================================
// WHEN NOT TO USE NETWORK-FIRST
// =============================================
// ✗ Static assets (CSS, JS, images)
// ✗ Rarely changing content (government forms)
// ✗ Large files (download once, cache forever)
// ✗ Apps that must work offline-first

// =============================================
// EXAMPLE USE CASES
// =============================================

// 1. PRICE CHECKER APP
// Try to get latest prices from API
// If network fails, show last known prices
// Better to show old price than nothing!

// 2. BARANGAY ANNOUNCEMENTS
// Fetch latest announcements from server
// If brownout, show previously cached announcements
// Residents still see important info

// 3. STUDENT GRADES PORTAL
// Get latest grades from server
// If no internet, show last retrieved grades
// Students can still view their progress

// =============================================
// DATA COST COMPARISON
// =============================================
// Without Service Worker:
// - 10 page loads = 10 API calls = ₱50
// - Brownout = no access at all
//
// With Network-First SW:
// - 10 page loads when online = 10 API calls = ₱50
// - Brownout = cached data, ₱0, still works!
//
// Best for: Users who need fresh data when possible
// But still want to work during brownouts

// =============================================
// UPDATING YOUR APP
// =============================================
// When you make changes:
// 1. Update CACHE_NAME version
// 2. Old cache automatically deleted on activate
// 3. Fresh data fetched on next visit
// 4. Cache updated with new responses

// =============================================
// TESTING
// =============================================
// Online behavior:
// 1. Open DevTools → Network tab
// 2. See network requests go through
// 3. Check Application → Cache Storage
// 4. Verify responses are being cached

// Offline behavior:
// 1. Check "Offline" in DevTools
// 2. Reload page
// 3. Should serve cached version
// 4. Check console for "[SW] Serving stale data"

// Slow connection:
// 1. DevTools → Network → Throttling
// 2. Select "Slow 3G" or "2G"
// 3. Observe timeout behavior
// 4. Adjust TIMEOUT constant as needed

// =============================================
// TROUBLESHOOTING
// =============================================
// Problem: Always getting cached data
// Solution: Timeout might be too short, increase it

// Problem: Timeout too slow on fast connections
// Solution: Reduce TIMEOUT, or use network speed detection

// Problem: Not caching responses
// Solution: Check network response status (must be 200)

// Problem: Cache growing too large
// Solution: Add cache size limit, delete old entries
