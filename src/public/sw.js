const CACHE_NAME = 'app-shell-v3';
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
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// FETCH
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 🔥 JANGAN INTERCEPT API
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((res) => {
      return (
        res ||
        fetch(event.request).catch(() => {
          return new Response('Offline', { status: 503 });
        })
      );
    })
  );
});

self.addEventListener('push', (event) => {
  console.log('🔥 PUSH MASUK');

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
    try {
      const json = event.data.json();
      data.title = json.title || data.title;
      data.options.body = json.options?.body || data.options.body;
    } catch (err) {
      data.options.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, data.options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});