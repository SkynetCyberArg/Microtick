const CACHE_NAME = 'mikrotik-manual-v1';
const urlsToCache = [
  './',
  './index.html',
  './bootstrap.min.css',
  './bootstrap.bundle.min.js',
  './mikrotik-styles-new.css',
  './mikrotik-script-new.js',
  './html2pdf.bundle.min.js',
  './mikrotik-diagram-intro.svg',
  './mikrotik-pcc-diagram.svg',
  './mikrotik-ecmp-diagram.svg',
  './mikrotik-failover-diagram.svg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Fira+Code&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});