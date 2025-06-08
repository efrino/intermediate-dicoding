// workbox-generate-sw.mjs
import { injectManifest } from 'workbox-build';

const buildSW = async () => {
    const { count, size, warnings } = await injectManifest({
        swSrc: 'public/service-worker.js',
        swDest: 'dist/service-worker.js',
        globDirectory: 'dist',
        globPatterns: [
            '**/*.{html,js,css,png,jpg,svg,json,ico}'
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
    });

    warnings.forEach(console.warn);
    console.log(`✅ Injected ${count} files, total ${Math.round(size / 1024)} KB into service-worker.js`);
};

buildSW();
