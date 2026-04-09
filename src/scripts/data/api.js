import CONFIG from '../config';

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
};

export async function getStories(token) {
  const response = await fetch(ENDPOINTS.STORIES, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await response.json();

  // ✅ HANDLE ERROR API
  if (json.error) {
    throw new Error(json.message);
  }

  return json.listStory;
}