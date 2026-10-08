/**
 * BiB 2.0 — Service Worker for PWA Offline Support
 * Relative scope caching compatible with GitHub Pages
 */

const CACHE_NAME = "bib-v2-cache-v2";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/tokens.css",
  "./css/base.css",
  "./css/browser.css",
  "./css/pages.css",
  "./css/components.css",
  "./css/animations.css",
  "./css/themes.css",
  "./css/responsive.css",
  "./js/utils.js",
  "./js/storage.js",
  "./js/indexeddb.js",
  "./js/notifications.js",
  "./js/themes.js",
  "./js/fullscreen.js",
  "./js/share.js",
  "./js/downloads.js",
  "./js/history.js",
  "./js/bookmarks.js",
  "./js/search.js",
  "./js/settings.js",
  "./js/keyboard.js",
  "./js/context-menu.js",
  "./js/games.js",
  "./js/developer-tools.js",
  "./js/renderer.js",
  "./js/tabs.js",
  "./js/navigation.js",
  "./js/browser.js",
  "./js/app.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first strategy with cache fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, cloned);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
      })
  );
});
