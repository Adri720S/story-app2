import { getAllStories, deleteStory } from '../../data/db';

export default class SavedPage {
  async render() {
    return `
      <section class="container">
        <h1>Saved Stories</h1>
        <div id="saved-list"></div>
      </section>
    `;
  }

  async afterRender() {
    const stories = await getAllStories();
    const container = document.querySelector('#saved-list');

    if (stories.length === 0) {
      container.innerHTML = '<p>Belum ada data</p>';
      return;
    }

    stories.forEach((story) => {
      const item = document.createElement('div');
      item.innerHTML = `
        <h2>${story.name}</h2>
        <img src="${story.photoUrl}" width="200">
        <p>${story.description}</p>

        <button class="delete-btn" data-id="${story.id}">Hapus</button>
      `;

      container.appendChild(item);
    });

    // delete
    document.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await deleteStory(btn.dataset.id);
        location.reload();
      });
    });
  }
}