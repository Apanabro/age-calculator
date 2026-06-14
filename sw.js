const CACHE_NAME = 'age-calc-v17';
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
    '/stats.html',
    '/settings.html',
    '/privacy.html',
    '/terms.html',
    '/sitemap.xml',
    '/robots.txt',
    '/age-calculator.html',
    '/how-to-calculate-age.html',
    '/zodiac-sign-calculator.html',
    '/birthday-countdown.html',
    '/date-difference-calculator.html',
    '/birthstone-guide.html',
    '/how-old-am-i.html',
    '/age-in-months-calculator.html',
    '/age-in-weeks-calculator.html',
    '/age-in-days-calculator.html',
    '/age-in-hours-calculator.html',
    '/age-in-minutes-calculator.html',
    '/age-calculator-by-birthdate.html',
    '/find-my-age.html',
    '/exact-age-calculator.html',
    '/what-is-my-age.html',
    '/age-calculator-today.html',
    '/birthday-calculator.html',
    '/best-age-calculator.html'
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
