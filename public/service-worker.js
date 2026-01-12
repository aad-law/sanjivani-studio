/* eslint-disable no-restricted-globals */

// Service Worker for Image Caching
const CACHE_NAME = 'sanjivani-image-cache-v1';

// Assets to always cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Cache Cloudinary Images for 1 year
    if (url.hostname.includes('cloudinary.com')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached response immediately
                    return cachedResponse;
                }

                return fetch(event.request).then((response) => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
                        return response;
                    }

                    // Clone the response because it's a stream and can only be consumed once
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return response;
                });
            })
        );
        return;
    }

    // Network-first for everything else
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
