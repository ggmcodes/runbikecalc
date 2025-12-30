// Service Worker for RunBikeCalc PWA
// Enables offline functionality and faster loading

const CACHE_NAME = 'runbikecalc-v1.3.0';
const urlsToCache = [
  '/',
  '/css/style.css',
  '/js/calculator-base.js',
  '/js/charts.js',
  '/js/training-plan-base.js',
  '/js/training-plan-running.js',
  '/js/training-plan-cycling.js',
  '/js/training-plan-triathlon.js',
  '/js/training-plan-hyrox.js',
  '/js/training-plan-export.js',
  '/js/url-params.js',
  '/js/email-gate.js',
  '/running-pace-calculator',
  '/heart-rate-zone-calculator',
  '/vo2-max-calculator',
  '/zone-2-calculator',
  '/treadmill-pace-calculator',
  '/race-time-predictor',
  '/ftp-calculator',
  '/bike-gearing-calculator',
  '/training-load-calculator',
  '/recovery-calculator',
  '/calories-burned-running-calculator',
  '/power-to-weight-ratio-calculator',
  '/running-training-plan-generator',
  '/cycling-training-plan-generator',
  '/triathlon-training-plan-generator',
  '/hyrox-training-plan-generator',
  '/favicon.ico',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Error caching files:', err);
      })
  );
  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Add to cache for dynamic content
          if (event.request.url.startsWith('http')) {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        });
      })
      .catch(() => {
        // Offline fallback for HTML pages
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Background sync for saving calculator results
self.addEventListener('sync', event => {
  if (event.tag === 'sync-calculator-results') {
    event.waitUntil(syncCalculatorResults());
  }
});

// Push notifications for training reminders
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Time for your workout!',
    icon: '/images/icon-192.png',
    badge: '/images/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open Calculator',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('RunBikeCalc Reminder', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function to sync calculator results
async function syncCalculatorResults() {
  // This would sync saved calculator results with a backend
  // For now, just log
  console.log('Syncing calculator results...');
}