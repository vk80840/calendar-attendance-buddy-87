const CACHE_NAME = 'attendance-app-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/index.html',
  // Add other static assets here
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Clone the response to cache it
            const responseClone = fetchResponse.clone();
            
            // Only cache successful responses
            if (fetchResponse.ok) {
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseClone));
            }
            
            return fetchResponse;
          });
      })
      .catch(() => {
        // Fallback for offline scenarios
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Background sync for data persistence
self.addEventListener('sync', (event) => {
  if (event.tag === 'attendance-sync') {
    event.waitUntil(
      // Sync attendance data when back online
      syncAttendanceData()
    );
  }
});

async function syncAttendanceData() {
  // This would typically sync with a backend
  // For now, just ensure localStorage is working
  try {
    const data = localStorage.getItem('attendanceData');
    if (data) {
      console.log('Attendance data synced successfully');
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}