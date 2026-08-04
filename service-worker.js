/* ==========================================================================
   Service Worker — permite que la app funcione sin internet después
   de haberla abierto una vez.

   IMPORTANTE: cada vez que se actualice index.html, styles.css o script.js
   y se quiera que los usuarios reciban la versión nueva, hay que cambiar
   el número de CACHE_NAME (por ejemplo de "v1" a "v2"). Si no se cambia,
   el teléfono puede seguir usando los archivos viejos guardados.
   ========================================================================== */

const CACHE_NAME = "eval-pv-v1.2";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Al instalar: descarga y guarda los archivos principales
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// Al activarse: borra cachés de versiones anteriores
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Al pedir un archivo: primero intenta la red (para tener lo más nuevo),
// y si no hay internet, usa lo guardado en caché.
self.addEventListener("fetch", (event) => {
  if(event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Solo guarda respuestas válidas de nuestro propio sitio
          if(event.request.url.startsWith(self.location.origin)){
            cache.put(event.request, copy);
          }
        });
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if(cached) return cached;
          // Si piden una página y no hay nada guardado, muestra el inicio
          if(event.request.mode === "navigate"){
            return caches.match("./index.html");
          }
        })
      )
  );
});
