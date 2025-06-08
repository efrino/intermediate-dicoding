// const CACHE_NAME = 'story-app-v1';
// const urlsToCache = [
//     '/',
//     '/index.html',
//     '/offline.html',          // <== wajib ada
//     '/manifest.json',
//     '/favicon.ico',
//     '/icons/icon-192.png',
//     '/icons/icon-512.png',
//     '/index.js',
//     '/responsive.css',
//     '/main.css',            // pastikan sesuai file CSS di offline.html
//     '/images/404.svg',
//     '/images/page-404.jpg',
// ];

// self.addEventListener('install', event => {
//     event.waitUntil(
//         caches.open(CACHE_NAME).then(cache => {
//             console.log('Caching app shell and assets');
//             return cache.addAll(urlsToCache);
//         })
//     );
// });

// self.addEventListener('activate', event => {
//     event.waitUntil(
//         caches.keys().then(keyList =>
//             Promise.all(
//                 keyList.map(key => {
//                     if (key !== CACHE_NAME) {
//                         console.log('Deleting old cache:', key);
//                         return caches.delete(key);
//                     }
//                 })
//             )
//         )
//     );
// });

// self.addEventListener('fetch', event => {
//     event.respondWith(
//         caches.match(event.request).then(response => {
//             return response || fetch(event.request).catch(err => {
//                 if (event.request.mode === 'navigate') {
//                     return caches.match('/offline.html');
//                 }
//                 // Return a generic fallback response untuk selain navigasi
//                 return new Response('Offline', {
//                     status: 503,
//                     statusText: 'Service Unavailable',
//                     headers: { 'Content-Type': 'text/plain' }
//                 });
//             });
//         })
//     );
// });


// // Push notification handler tetap sama
// self.addEventListener('push', event => {
//     let data = {
//         title: 'Dicoding Story',
//         options: {
//             body: 'Ada notifikasi baru!',
//             icon: '/favicon.ico',
//             badge: '/icons/icon-192.png'
//         }

//     };

//     if (event.data) {
//         data = event.data.json();
//     }

//     event.waitUntil(
//         self.registration.showNotification(data.title, data.options)
//     );
// });
// self.addEventListener('notificationclick', event => {
//     event.notification.close();
//     event.waitUntil(
//         clients.matchAll({ type: 'window' }).then(clientList => {
//             if (clientList.length > 0) {
//                 return clientList[0].focus();
//             }
//             return clients.openWindow('/');
//         })
//     );
// });
/* eslint-disable no-restricted-globals */
/* global self, caches, clients */

const CACHE_NAME = 'story-app-v1';
const OFFLINE_PAGE = '/offline.html';

// Injected by Workbox
self.__WB_MANIFEST; // Jangan hapus, ini akan diganti otomatis saat build

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching offline page');
            return cache.addAll([
                OFFLINE_PAGE
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) =>
            Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', key);
                        return caches.delete(key);
                    }
                })
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(OFFLINE_PAGE);
            })
        );
    }
    // Untuk non-navigation (JS/CSS/img), fallback ke cache-first oleh Workbox
    // Tidak perlu override di sini, biarkan Workbox menangani sisanya
});

// Push notification handler
self.addEventListener('push', (event) => {
    let data = {
        title: 'Dicoding Story',
        options: {
            body: 'Ada notifikasi baru!',
            icon: '/favicon.ico',
            badge: '/icons/icon-192.png',
        },
    };

    if (event.data) {
        data = event.data.json();
    }

    event.waitUntil(
        self.registration.showNotification(data.title, data.options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return clients.openWindow('/');
        })
    );
});
