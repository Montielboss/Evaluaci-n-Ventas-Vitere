/* ==========================================================================
   Service Worker — permite que la app funcione sin internet después
   de haberla abierto una vez.

   IMPORTANTE: cada vez que se actualice index.html, styles.css o script.js
   y se quiera que los usuarios reciban la versión nueva, hay que cambiar
   el número de CACHE_NAME (por ejemplo de "v1" a "v2"). Si no se cambia,
   el teléfono puede seguir usando los archivos viejos guardados.
   ========================================================================== */

const CACHE_NAME = "eval-pv-v2.3";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./panel.html",
  "./panel.js"
];

// Al instalar: descarga y guarda los archivos principales.
// Se guardan uno por uno (en vez de todos o nada) para que, si uno falla
// por una conexión de datos móviles inestable, los demás sí queden guardados
// y la próxima vez se intente de nuevo con el que faltó.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("No se pudo guardar en caché:", url, err);
          })
        )
      )
    )
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

// Al pedir un archivo:
// - Para la página principal y los archivos base de la app (HTML, CSS, JS,
//   imágenes): responde DE INMEDIATO con lo que ya está guardado, sin
//   esperar al internet. Así no se queda pegado "cargando" si la señal
//   está lenta o inestable. Si sí hay internet, de paso trae la versión
//   más nueva en segundo plano para la próxima vez que se abra.
// - Para todo lo demás (por ejemplo las consultas a Firestore): intenta
//   primero por internet, ya que ahí sí se necesita la información más
//   reciente, y usa lo guardado solo si no hay conexión.
self.addEventListener("fetch", (event) => {
  if(event.request.method !== "GET") return;

  const isNavigation = event.request.mode === "navigate";
  const sameOrigin = event.request.url.startsWith(self.location.origin);
  const isShellAsset = sameOrigin && ["script", "style", "manifest", "image"].includes(event.request.destination);

  if(isNavigation || isShellAsset){
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return response;
          })
          .catch(() => null);
        return cached || networkFetch.then((res) => res || (isNavigation ? caches.match("./index.html") : undefined));
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        if(sameOrigin){
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
