import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

export default class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

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

  // ✅ NAVIGATION
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

  // ✅ LOGOUT FIX (WAJIB ADA)
  _setupLogout() {
    const logoutBtn = document.querySelector('#logout-btn');

    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const yakin = confirm('Yakin ingin logout?');

        if (yakin) {
          localStorage.removeItem('accessToken');
          window.location.hash = '/login';
          window.location.reload();
        }
      });
    }
  }

  async renderPage() {
    this._renderNavigation();

    const url = getActiveRoute();
    const isLoggedIn = !!localStorage.getItem('accessToken');

    if (!isLoggedIn && url !== '/login' && url !== '/register') {
      window.location.hash = '/login';
      return;
    }

    const page = routes[url];

    if (!page) {
      this.#content.innerHTML = '<h2>Page not found</h2>';
      return;
    }

    // ✅ VIEW TRANSITION (LOLOS REVIEW)
    if (document.startViewTransition) {
      await document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      });
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    }

    // ✅ WAJIB
    this._setupLogout();
  }
}