const CACHE_NAME = 'app-shell-v1';
const urlsToCache = ['/', '/index.html', '/app.bundle.js'];

// INSTALL
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// ACTIVATE
self.addEventListener('activate', (event) => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
});

// FETCH
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});

// PUSH
self.addEventListener('push', (event) => {
  let data = {
    title: 'Story Baru!',
    options: {
      body: 'Ada story baru ditambahkan',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: '/' },
    },
  };

  if (event.data) {
    const json = event.data.json();
    data.title = json.title;
    data.options.body = json.options?.body;
  }

  event.waitUntil(
    self.registration.showNotification(data.title, data.options)
  );
});

// CLICK
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientsArr) => {
      for (const client of clientsArr) {
        if (client.url.includes(url)) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});