import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { transitionHelper } from '../utils';

export default class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  _isTransitioning = false;

  constructor({ content, drawerButton, navigationDrawer }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });
  }

  _renderNavigation() {
    const isLoggedIn = !!localStorage.getItem('accessToken');

    this.#navigationDrawer.innerHTML = `
      <ul class="nav-list">
        <li><a href="#/">Beranda</a></li>
        <li><a href="#/about">About</a></li>

        ${
          isLoggedIn
            ? `
              <li><a href="#/add">Tambah</a></li>
              <li><a href="#/saved">Saved</a></li>
              <li class="logout"><a href="#" id="logout-btn">Logout</a></li>
            `
            : `
              <li><a href="#/login">Login</a></li>
              <li><a href="#/register">Register</a></li>
            `
        }
      </ul>
    `;
  }

  async renderPage() {
    if (this._isTransitioning) return;
    this._isTransitioning = true;

    this._renderNavigation();

    const url = getActiveRoute();
    const isLoggedIn = !!localStorage.getItem('accessToken');

    // 🔥 REDIRECT DULU
    if (!isLoggedIn && url !== '/login' && url !== '/register') {
      this._isTransitioning = false;
      window.location.hash = '/login';
      return;
    }

    const page = routes[url];

    if (!page) {
      this.#content.innerHTML = '<h2>Page not found</h2>';
      this._isTransitioning = false;
      return;
    }

    // 🔥 WAJIB PAKAI HELPER
    const transition = transitionHelper({
      // 🔥 SKIP TRANSITION KHUSUS HALAMAN HOME (MAP)
      skipTransition: url === '/', 

      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      },
    });

    transition.ready.catch(() => {});

    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: 'instant' });
      this._setupLogout();
    });

    this._isTransitioning = false;
  }

  _setupLogout() {
    const logoutBtn = document.querySelector('#logout-btn');

    if (logoutBtn && !logoutBtn.dataset.bound) {
      logoutBtn.dataset.bound = 'true';

      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (confirm('Yakin ingin logout?')) {
          localStorage.removeItem('accessToken');
          window.location.hash = '/login';
          window.location.reload();
        }
      });
    }
  }
}