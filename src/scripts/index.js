// CSS
import '../styles/styles.css';

import App from './pages/app';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});


// ===============================
// ✅ SERVICE WORKER (AMAN DEV)
// ===============================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // ❗ OPTIONAL: disable SW di localhost biar gak ganggu dev
      if (location.hostname === 'localhost') {
        console.log('SW dimatikan saat development');
        return;
      }

      await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered');
    } catch (err) {
      console.error('SW gagal:', err);
    }
  });
}


// ===============================
// 🔔 PERMISSION NOTIFICATION
// ===============================
async function requestPermission() {
  const result = await Notification.requestPermission();

  if (result === 'granted') {
    console.log('Notifikasi diizinkan');
  } else {
    console.log('Notifikasi ditolak');
  }
}

requestPermission();


// ===============================
// 📦 PUSH (dummy untuk sekarang)
// ===============================
async function subscribePush() {
  const registration = await navigator.serviceWorker.ready;

  const response = await fetch(
    'https://story-api.dicoding.dev/v1/notifications/subscribe',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        endpoint: 'dummy',
        keys: {
          p256dh: 'dummy',
          auth: 'dummy',
        },
      }),
    }
  );

  const data = await response.json();
  console.log('Subscribe:', data);
}


// ===============================
// 📲 INSTALL PROMPT
// ===============================
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  console.log('App bisa di-install!');
});