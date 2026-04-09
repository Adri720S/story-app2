import { openDB } from 'idb';

const DATABASE_NAME = 'story-db';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
  },
});

export const saveStory = async (story) => {
  return (await dbPromise).put(OBJECT_STORE_NAME, story);
};

export const getAllStories = async () => {
  return (await dbPromise).getAll(OBJECT_STORE_NAME);
};

export const deleteStory = async (id) => {
  return (await dbPromise).delete(OBJECT_STORE_NAME, id);
};