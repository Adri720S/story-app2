import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// FIX ICON
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import { getStories } from '../../data/api';
import { saveStory } from '../../data/db';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

export default class HomePage {
  constructor() {
    this._map = null;
  }

  async render() {
    return `
      <section class="container">
        <h1>Home Page</h1>

        <!-- 🔥 SEARCH -->
        <input type="text" id="search" placeholder="Cari story..." />

        <div id="map" style="height: 400px;"></div>
        <div id="story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      window.location.hash = '/login';
      return;
    }

    let stories = [];

    try {
      stories = await getStories(token);
    } catch (error) {
      console.error(error);
      alert('Gagal mengambil data');
      return;
    }

    // 🔥 RESET MAP (ANTI ERROR)
    if (this._map) {
      this._map.off();
      this._map.remove();
      this._map = null;
    }

    const container = document.getElementById('map');

    if (container) {
      container.innerHTML = '';
      if (container._leaflet_id) {
        delete container._leaflet_id;
      }
    }

    // 🔥 DELAY (biar aman dari transition)
    await new Promise((r) => setTimeout(r, 50));

    this._map = L.map('map').setView([-6.2, 106.8], 5);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(this._map);

    const listContainer = document.querySelector('#story-list');

    // 🔥 RENDER FUNCTION
    const renderList = (data) => {
      listContainer.innerHTML = '';

      if (!data || data.length === 0) {
        listContainer.innerHTML = '<p>Tidak ada data</p>';
        return;
      }

      data.forEach((story) => {
        // marker
        if (story.lat && story.lon) {
          L.marker([story.lat, story.lon])
            .addTo(this._map)
            .bindPopup(`<b>${story.name}</b><br>${story.description}`);
        }

        const item = document.createElement('div');

        item.innerHTML = `
          <h2>${story.name}</h2>
          <img src="${story.photoUrl}" width="200" alt="Foto dari ${story.name}">
          <p>${story.description}</p>
          <p>${new Date(story.createdAt).toLocaleDateString()}</p>
          <button class="save-btn" data-id="${story.id}">Simpan</button>
        `;

        listContainer.appendChild(item);
      });

      // 🔥 SAVE BUTTON
      document.querySelectorAll('.save-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const story = stories.find((s) => s.id === id);

          await saveStory(story);
          alert('Disimpan ke IndexedDB');
        });
      });
    };

    // render awal
    renderList(stories);

    // 🔥 SEARCH FEATURE
    const searchInput = document.getElementById('search');

    searchInput.addEventListener('input', () => {
      const keyword = searchInput.value.toLowerCase();

      const filtered = stories.filter((story) =>
        story.name.toLowerCase().includes(keyword)
      );

      renderList(filtered);
    });
  }
}