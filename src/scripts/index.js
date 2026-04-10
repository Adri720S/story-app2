import 'regenerator-runtime';
import '../styles/styles.css';

import App from './pages/app';
import { subscribePush, unsubscribePush } from './utils/push';

// =======================
// INIT APP
// =======================
const app = new App({
  content: document.querySelector('#main-content'),
  drawerButton: document.querySelector('#drawer-button'),
  navigationDrawer: document.querySelector('#navigation-drawer'),
});

// =======================
// ROUTING
// =======================
window.addEventListener('hashchange', () => {
  app.renderPage();
});

window.addEventListener('load', () => {
  app.renderPage();
  registerServiceWorker();
  initPushButton();
});

// =======================
// REGISTER SW
// =======================
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('SW berhasil');
    } catch (error) {
      console.log('SW gagal', error);
    }
  }
}

// =======================
// BUTTON NOTIF
// =======================
function initPushButton() {
  const subBtn = document.getElementById('subscribe-btn');
  const unsubBtn = document.getElementById('unsubscribe-btn');

  if (subBtn) subBtn.addEventListener('click', subscribePush);
  if (unsubBtn) unsubBtn.addEventListener('click', unsubscribePush);
}