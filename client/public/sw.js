/* Lightweight PWA service worker for HackerFolio (no server changes required).
 * - Precaches the app shell (index.html) and core static assets.
 * - Runtime cache: stale-while-revalidate for assets, network-first for HTML with cache fallback.
 * - Scope: root ('/'), so it can handle navigations when served from '/sw.js'.
 */

const VERSION = 'hf-v1';
const CACHE_NAME = `hf-cache-${VERSION}`;
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/favicon.svg',
  '/site.webmanifest',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return; // only cache GET

  const url = new URL(req.url);
  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // Static assets: stale-while-revalidate
  if (
    url.pathname.startsWith('/assets/') ||
    /\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|woff2?|ttf|eot|css|js)$/.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // HTML navigations: network-first with cache fallback
  if (req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then(resp => {
          const copy = resp.clone();
          event.waitUntil(
            caches
              .open(CACHE_NAME)
              .then(cache => cache.put(url.pathname === '/' ? '/' : req, copy))
              .catch(() => void 0)
          );
          return resp;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match(url.pathname)) || (await cache.match('/')) || (await cache.match('/index.html'));
        })
    );
    return;
  }
});

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then(resp => {
      if (resp && resp.status === 200) {
        cache.put(req, resp.clone()).catch(() => void 0);
      }
      return resp;
    })
    .catch(() => undefined);
  return cached || network || new Response('', { status: 504 });
}

