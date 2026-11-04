/* SmartStock service worker — caches the app files so it opens offline after the first visit (HTTPS hosting only).
   NOTE: cache-first. When you change any file, bump VERSION so devices pick up the update. */
const VERSION = 'smartstock-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'app.css', 'app.js', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then((hit) => hit || fetch(r).catch(() => (r.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
