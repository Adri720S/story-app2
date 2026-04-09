import { subscribePush } from '../../utils/push';

export default class LoginPage {
  async render() {
    return `
      <section class="container">
        <h1>Login</h1>

        <form id="login-form">
          <label for="email">Email</label><br>
          <input id="email" type="email" required><br><br>

          <label for="password">Password</label><br>
          <input id="password" type="password" required><br><br>

          <button type="submit">Login</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#login-form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      try {
        const response = await fetch('https://story-api.dicoding.dev/v1/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (!data.error) {
          localStorage.setItem('accessToken', data.loginResult.token);

          window.location.hash = '/';
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error(error);
        alert('Terjadi error saat login');
      }
    });
  }
}