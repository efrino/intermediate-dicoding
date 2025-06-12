export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function saveUserData({
  name,
  token
}) {
  localStorage.setItem('userName', name);
  localStorage.setItem('accessToken', token);
}

export function getUserData() {
  return {
    name: localStorage.getItem('userName'),
    token: localStorage.getItem('accessToken'),
  };
}

export function clearUserData() {
  localStorage.removeItem('userName');
  localStorage.removeItem('accessToken');
}

export function isUserLoggedIn() {
  const {
    token
  } = getUserData();
  return !!token;
}

export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.log('Service Worker API unsupported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service worker telah terpasang', registration);
  } catch (error) {
    console.log('Failed to install service worker:', error);
  }
}

export function convertBase64ToUint8Array(base64String) {
  const base64 = base64String
    .padEnd(base64String.length + ((4 - (base64String.length % 4)) % 4), '=')
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);

  return new Uint8Array(rawData.split('').map((char) => char.charCodeAt(0)));
}