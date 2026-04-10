import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

export default class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #isTransitioning = false;

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

  _setupLogout() {
    const logoutBtn = document.querySelector('#logout-btn');

    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const yakin = confirm('Yakin ingin logout?');

        if (yakin) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('pushSubscribed');
          window.location.hash = '/login';
          window.location.reload();
        }
      });
    }
  }

  // 🔥 GLOBAL CLEANUP (INI KUNCI UTAMA)
  _cleanup() {
    const mapContainer = document.getElementById('map');

    if (mapContainer && mapContainer._leaflet_id) {
      try {
        mapContainer._leaflet_id = null;
      } catch (e) {
        console.warn('cleanup error', e);
      }
    }
  }

  async renderPage() {
    if (this.#isTransitioning) return;
    this.#isTransitioning = true;

    this._renderNavigation();

    let url = getActiveRoute();
    const isLoggedIn = !!localStorage.getItem('accessToken');

    if (!isLoggedIn && url !== '/login' && url !== '/register') {
      url = '/login';
    }

    const page = routes[url];

    if (!page) {
      this.#content.innerHTML = '<h2>Page not found</h2>';
      this.#isTransitioning = false;
      return;
    }

    // 🔥 WAJIB: bersihin map sebelum render baru
    this._cleanup();

    try {
      if (document.startViewTransition) {
        await document.startViewTransition(async () => {
          this.#content.innerHTML = await page.render();
          await page.afterRender();
        });
      } else {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      }
    } catch (err) {
      console.warn('Transition skipped:', err);

      this.#content.innerHTML = await page.render();
      await page.afterRender();
    }

    this._setupLogout();

    this.#isTransitioning = false;
  }
}