// Service Worker for ScanDriver Partner PWA & Firebase Cloud Messaging (FCM)
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// 1. Initialize Firebase inside Service Worker using config passed via registration query params (from env)
const urlParams = new URLSearchParams(self.location.search);

const firebaseConfig = {
  apiKey: urlParams.get('apiKey'),
  authDomain: urlParams.get('authDomain'),
  projectId: urlParams.get('projectId'),
  storageBucket: urlParams.get('storageBucket'),
  messagingSenderId: urlParams.get('messagingSenderId'),
  appId: urlParams.get('appId'),
};

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  // 2. Handle background push notifications (when PWA is closed, minimized, or screen locked)
  messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const title = payload.notification?.title || payload.data?.title || '🚨 New Booking Available!';
  const body = payload.notification?.body || payload.data?.body || 'A new ride is waiting for you. Tap to view and accept.';
  const defaultUrl = self.location.hostname.includes('localhost')
    ? self.location.origin + '/driver-app'
    : 'https://partner.scandriver.in/';
  const clickAction = payload.data?.click_action || payload.notification?.click_action || defaultUrl;
  const bookingId = payload.data?.bookingId || '';

  const options = {
    body,
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    vibrate: [300, 100, 300, 100, 300],
    tag: 'booking-alert',
    renotify: true,
    requireInteraction: true,
    data: {
      url: clickAction,
      bookingId: bookingId,
    },
    actions: [
      { action: 'open', title: 'Open Booking' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  return self.registration.showNotification(title, options);
  });
}

// 3. Handle Notification Click event: Exclusively focus/open partner.scandriver.in PWA
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const partnerUrl = self.location.hostname.includes('localhost')
    ? self.location.origin + '/driver-app'
    : 'https://partner.scandriver.in/';

  const targetUrl = event.notification.data?.url || partnerUrl;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. If driver app / PWA is already open in background, bring it directly to foreground
      for (const client of windowClients) {
        const clientUrl = client.url || '';
        if (
          clientUrl.includes('partner.scandriver.in') ||
          clientUrl.includes('/driver-app') ||
          clientUrl.startsWith(self.location.origin)
        ) {
          return client.focus().then(() => {
            if (client.postMessage) {
              client.postMessage({
                type: 'FCM_NOTIFICATION_CLICK',
                bookingId: event.notification.data?.bookingId,
              });
            }
          });
        }
      }

      // 2. If PWA is not currently open, launch partner.scandriver.in
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 4. Basic PWA Lifecycle & Safe Navigation Fallback
const CACHE_NAME = 'scandriver-partner-v2';
const ASSETS_TO_CACHE = [
  '/driver-manifest.json',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/placeholder-user.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Purging old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ONLY intercept full-page navigation requests for offline fallback.
// Never intercept JavaScript, CSS, or internal Next.js chunks!
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/driver-app') || caches.match('/');
      })
    );
  }
});
