import {
    precacheAndRoute
} from 'workbox-precaching';
import {
    registerRoute
} from 'workbox-routing';
import {
    CacheableResponsePlugin
} from 'workbox-cacheable-response';
import {
    NetworkFirst,
    CacheFirst,
    StaleWhileRevalidate
} from 'workbox-strategies';

const manifest = self.__WB_MANIFEST;

precacheAndRoute(manifest);

registerRoute(
    ({
        url
    }) => {
        return url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com';
    },
    new CacheFirst({
        cacheName: 'google-fonts',
    }),
);

registerRoute(
    ({
        url
    }) => {
        return url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome');
    },
    new CacheFirst({
        cacheName: 'fontawesome',
    }),
);

registerRoute(
    ({
        url
    }) => {
        return url.origin === 'https://ui-avatars.com';
    },
    new CacheFirst({
        cacheName: 'avatars-api',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    }),
);

registerRoute(
    ({
        url
    }) => url.origin.includes('tile.openstreetmap.org'),
    new CacheFirst({
        cacheName: 'osm-tiles',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    }),
);

registerRoute(
    ({
        url
    }) =>
    url.origin === 'https://story-api.dicoding.dev' &&
    url.pathname.startsWith('/v1/stories'),
    new NetworkFirst({
        cacheName: 'story-api',
        plugins: [new CacheableResponsePlugin({
            statuses: [0, 200]
        })],
    })
);

registerRoute(
    ({
        request,
        url
    }) =>
    url.origin === 'https://story-api.dicoding.dev' &&
    request.destination === 'image',
    new StaleWhileRevalidate({
        cacheName: 'story-images',
        plugins: [new CacheableResponsePlugin({
            statuses: [0, 200]
        })],
    })
);

self.addEventListener('push', (event) => {
    console.log('Service worker pushing...');

    async function chainPromise() {
        const data = await event.data.json();
        await self.registration.showNotification(data.title, {
            body: data.options.body,
        });
    }

    event.waitUntil(chainPromise());
});