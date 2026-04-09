const CACHE_NAME = 'app-shell-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.bundle.js',
];

// =======================
// INSTALL
// =======================
self.addEventListener('install', (event) => {
  self.skipWaiting(); // langsung aktif

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// =======================
// ACTIVATE
// =======================
self.addEventListener('activate', (event) => {
  self.clients.claim(); // langsung ambil kontrol

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

// =======================
// FETCH (OFFLINE SUPPORT)
// =======================
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      // fallback kalau offline total
      if (event.request.destination === 'document') {
        return caches.match('/index.html');
      }
    })
  );
});

// =======================
// PUSH NOTIFICATION
// =======================
self.addEventListener('push', (event) => {
  console.log('Push diterima');

  let data = {
    title: 'Story Baru!',
    options: {
      body: 'Ada story baru ditambahkan',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: {
        url: '/',
      },
      actions: [
        {
          action: 'open',
          title: 'Lihat',
        },
        {
          action: 'close',
          title: 'Tutup',
        },
      ],
    },
  };

  // 🔥 Ambil data dari server (dynamic)
  if (event.data) {
    const json = event.data.json();

    data.title = json.title || 'Story Baru!';
    data.options.body = json.options?.body || 'Ada update baru!';
    data.options.data.url = '/'; // bisa diarahkan ke detail nanti
  }

  event.waitUntil(
    self.registration.showNotification(data.title, data.options)
  );
});

// =======================
// CLICK NOTIFICATION
// =======================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});