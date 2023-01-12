const cacheName = "SailScore-v1";
const appShellFiles = [
  "./android-icon-48x48.png",
  "./android-icon-512x512.png",
  "./android-icon-512x512.svg",
  "./app.webmanifest",
  "./favicon.ico",
  "./index.html",
  "./data/py-list.json",
  "./assets/css/style.css",
  "./assets/img/cancel-black.svg",
  "./assets/img/cancel.svg",
  "./assets/img/menu.svg",
  "./assets/js/app.js"
];

self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
  const contentToCache = appShellFiles;
   e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log("[Service Worker] Caching all: app shell and content");
      await cache.addAll(contentToCache);
    })()
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (r) {
        return r;
      }
      const response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })()
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === cacheName) {
            return;
          }
          return caches.delete(key);
        })
      );
    })
  );
});