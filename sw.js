const CACHE_NAME = "music-app-v1";

// файлы, которые кешируем сразу
const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/manifest.json",
  "/icon.png"
];

// 📦 INSTALL — кешируем всё
self.addEventListener("install", (event) => {
  console.log("Service Worker: Install");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );

  self.skipWaiting();
});


// 🔄 ACTIVATE — удаляем старый кеш
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activate");

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Удаляем старый кеш:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});


// 🌐 FETCH — стратегия Cache First
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {

      // если есть в кеше — отдаём
      if (response) {
        return response;
      }

      // иначе грузим из сети
      return fetch(event.request)
        .then((res) => {
          return caches.open(CACHE_NAME).then((cache) => {

            // кешируем новые файлы
            cache.put(event.request, res.clone());

            return res;
          });
        })
        .catch(() => {
          // оффлайн fallback
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });

    })
  );
});