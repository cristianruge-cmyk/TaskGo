// Simple service worker para cachear los archivos principales y permitir uso offline.
const CACHE_NAME = 'taskgo-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache=> cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e)=>{
  // Estrategia: cache first for app shell
  e.respondWith(
    caches.match(e.request).then(resp => {
      if(resp) return resp;
      return fetch(e.request).then(response => {
        // Guardar en cache dinámico si es GET y está OK
        if(e.request.method === 'GET' && response && response.status === 200){
          const respClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, respClone));
        }
        return response;
      }).catch(()=> caches.match('/')); // fallback al index si falla
    })
  );
});

self.addEventListener('notificationclick', (e)=>{
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(list => {
    for(const c of list){
      if(c.url === '/' && 'focus' in c) return c.focus();
    }
    if(clients.openWindow) return clients.openWindow('/');
  }));
});