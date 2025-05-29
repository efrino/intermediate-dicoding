import CONFIG from '../config';
import { getUserData } from '../utils';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  DETAILS: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
};

export async function registerUser(name, email, password) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Register failed');
  }

  return responseData;
}


export async function addStory(formData) {
  try {
    const { token } = getUserData();

    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error('Error adding story:', error);
    return { error: true, message: error.message };
  }
}

export async function loginUser(email, password) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return await response.json();
}

export async function getAllStories(page = 1, size = 10, withLocation = false) {
  try {
    const { token } = getUserData();

    if (!token) {
      throw new Error('No access token found. Please login first.');
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const url = `${ENDPOINTS.STORIES}?page=${page}&size=${size}&location=${withLocation ? 1 : 0}`;

    const response = await fetch(url, { headers });

    const text = await response.text();

    let responseJson;
    try {
      responseJson = JSON.parse(text);
    } catch (err) {
      console.error('Failed to parse JSON response:', err);
      throw new Error('Invalid JSON response from server');
    }

    if (!response.ok || responseJson.error) {
      throw new Error(responseJson.message || 'Failed to fetch stories');
    }

    return responseJson.listStory;
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }
}

export async function getStoryById(id) {
  try {
    const { token } = getUserData();

    if (!token) {
      throw new Error("401: Authentication token is required");
    }

    const response = await fetch(ENDPOINTS.DETAILS(id), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`${response.status}: ${data.message}`);
    }

    if (!data.story || !data.story.id) {
      console.error("Invalid API response structure:", data);
      throw new Error("500: Invalid story data structure");
    }

    return data.story;
  } catch (error) {
    console.error(`API Error for story ${id}:`, error);
    throw error;
  }
}
export async function addStoryGuest(formData) {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/stories/guest`, {
      method: 'POST',
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error('Error adding guest story:', error);
    return { error: true, message: error.message };
  }
}
