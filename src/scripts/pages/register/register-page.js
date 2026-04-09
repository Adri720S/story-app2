export default class RegisterPage {
  async render() {
    return `
      <section class="container">
        <h1>Register</h1>

        <form id="register-form">
          <label for="name">Nama</label><br>
          <input id="name" type="text" required><br><br>

          <label for="email">Email</label><br>
          <input id="email" type="email" required><br><br>

          <label for="password">Password</label><br>
          <input id="password" type="password" required><br><br>

          <button type="submit">Register</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#register-form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.querySelector('#name').value;
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      try {
        const response = await fetch('https://story-api.dicoding.dev/v1/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });

        const data = await response.json();

        if (!data.error) {
          alert('Register berhasil! Silakan login.');
          window.location.hash = '/login';
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error(error);
        alert('Register gagal');
      }
    });
  }
}