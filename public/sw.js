const CACHE_NAME = 'scandriver-partner-v1'
const ASSETS_TO_CACHE = [
  '/driver-app',
  // '/logo-sd.png',
  '/placeholder-user.jpg',
  '/driver-manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  // Only intercept requests for driver-app or standard static assets cached above
  if (url.pathname.startsWith('/driver-app') || ASSETS_TO_CACHE.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(event.request)
          .then((response) => {
            // Valid response?
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            // Only cache GET requests
            if (event.request.method === 'GET') {
              const responseToCache = response.clone()
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache)
              })
            }
            return response
          })
          .catch(() => {
            // Offline fallback to the driver-app main page
            return caches.match('/driver-app')
          })
      })
    )
  }
})
