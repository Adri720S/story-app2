import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// FIX ICON ERROR
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import { saveStory } from '../../data/db';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

import { getStories } from '../../data/api';

export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h1>Home Page</h1>
        <div id="map"></div>
        <div id="story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('accessToken');

    let stories = [];

    try {
      stories = await getStories(token);
    } catch (error) {
      console.error(error);
      alert('Gagal mengambil data');
      return;
    }

    // 🔥 FIX MAP (WAJIB)
    if (this._map) {
      this._map.remove();
    }

    this._map = L.map('map').setView([-6.2, 106.8], 5);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this._map);

    const listContainer = document.querySelector('#story-list');
    listContainer.innerHTML = '';

    if (!stories || stories.length === 0) {
      listContainer.innerHTML = '<p>Tidak ada data</p>';
      return;
    }

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        L.marker([story.lat, story.lon])
          .addTo(this._map)
          .bindPopup(`<b>${story.name}</b><br>${story.description}`);
      }

      const item = document.createElement('div');
      item.innerHTML = `
        <h2>${story.name}</h2>
        <img src="${story.photoUrl}" alt="${story.name}" width="200">
        <p>${story.description}</p>
        <p>${new Date(story.createdAt).toLocaleDateString()}</p>
        <button class="save-btn" data-id="${story.id}">Simpan</button>
      `;

      listContainer.appendChild(item);
    });

    document.querySelectorAll('.save-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const story = stories.find((s) => s.id === id);

        await saveStory(story);
        alert('Disimpan ke IndexedDB');
      });
    });
  }
}

