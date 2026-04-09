import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default class AddPage {
  async render() {
    return `
      <section class="container">
        <h1>Tambah Story</h1>

        <form id="add-form">
          <label for="description">Deskripsi</label><br>
          <textarea id="description" required></textarea><br><br>

          <label for="photo">Upload Gambar</label><br>
          <input type="file" id="photo" accept="image/*" required><br><br>

          <p>Klik peta untuk pilih lokasi</p>
          <div id="map" style="height:300px;"></div><br>

          <button type="submit">Kirim</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    // ✅ CEK LOGIN
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Silakan login terlebih dahulu');
      window.location.hash = '/login';
      return;
    }

    let lat = null;
    let lon = null;

    const map = L.map('map').setView([-6.2, 106.8], 5);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    let marker;

    // 📍 Ambil koordinat dari klik map
    map.on('click', (e) => {
      lat = e.latlng.lat;
      lon = e.latlng.lng;

      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng).addTo(map);
      }
    });

    const form = document.querySelector('#add-form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const description = document.querySelector('#description').value;
      const photo = document.querySelector('#photo').files[0];

      // ✅ VALIDASI LOKASI
      if (!lat || !lon) {
        alert('Pilih lokasi di peta!');
        return;
      }

      // ✅ VALIDASI FILE
      if (!photo) {
        alert('Pilih gambar terlebih dahulu!');
        return;
      }

      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photo);
      formData.append('lat', lat);
      formData.append('lon', lon);

      try {
        const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (!data.error) {
          alert('Berhasil tambah story!');
          window.location.hash = '/'; // balik ke home
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error(error);
        alert('Gagal tambah data');
      }
    });
  }
}