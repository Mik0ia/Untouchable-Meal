// Service worker : rend le jeu installable comme une application.
// Stratégie "réseau d'abord" : on charge toujours la version en ligne, et on ne
// se sert de la copie locale que si le réseau ne répond pas. Les mises à jour
// du jeu arrivent donc normalement.

const CACHE = "untouchable-meal";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const req = e.request;
  // Seulement les fichiers du jeu (Firebase, Google, polices passent directement).
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((rep) => {
        if (rep.ok) {
          const copie = rep.clone();
          caches.open(CACHE).then((c) => c.put(req, copie)).catch(() => {});
        }
        return rep;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("./")))
  );
});
