const CACHE_NAME = 'osm-tile-cache-v1';
const TILE_URL_PATTERN = /^https:\/\/{s}\.basemaps\.cartocdn\.com\/dark_all\/\{z\}\/\{x\}\/\{y\}\{r\}\.png$/;

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    const url = event.request.url;
    if (TILE_URL_PATTERN.test(url)) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache =>
                cache.match(event.request).then(response =>
                    response || fetch(event.request).then(fetchResponse => {
                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;
                    })
                )
            )
        );
    }
});
