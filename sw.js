const CACHE_NAME = 'age-calc-v12';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/icon.svg',
    '/manifest.json',
    '/auth.css',
    '/login.html',
    '/signup.html',
    '/dashboard.html',
    '/privacy.html',
    '/terms.html',
    '/sitemap.xml',
    '/robots.txt',
    '/how-to-calculate-age.html',
    '/zodiac-sign-calculator.html',
    '/birthday-countdown.html',
    '/date-difference-calculator.html',
    '/birthstone-guide.html'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
});
