/* Asset-scoped fallback service worker.
 * If the root '/sw.js' cannot be registered due to hosting constraints,
 * this worker provides caching for '/assets/*' so the UI assets remain available.
 * Note: It cannot control navigations outside '/assets/'.
 */

const VERSION = 'hf-assets-v1'
const CACHE_NAME = `hf-assets-cache-${VERSION}`

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (!url.pathname.startsWith('/assets/')) return
  event.respondWith(staleWhileRevalidate(req))
})

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(req)
  const network = fetch(req)
    .then(resp => {
      if (resp && resp.status === 200) {
        cache.put(req, resp.clone()).catch(() => void 0)
      }
      return resp
    })
    .catch(() => undefined)
  return cached || network || new Response('', { status: 504 })
}
