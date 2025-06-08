import '../styles/main.css';
import '../styles/responsive.css';

import App from './pages/app';
import '../scripts/component/AppBar';

import {
  subscribePushNotification,
  unsubscribePushNotification,
} from './utils/pushHelper';

import Idb from './utils/idb'; // ✅ Tambahkan ini
import { addStory, addStoryGuest } from './data/api';
import { getUserData } from './utils';
import { showNotification } from './utils/notification';

// Service Worker
if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(() => console.log('Service worker registered'))
    .catch((error) => console.error('SW registration failed:', error));
}

// Push Button
const subscribeBtn = document.querySelector('#btn-subscribe');
const unsubscribeBtn = document.querySelector('#btn-unsubscribe');

if (subscribeBtn) {
  subscribeBtn.addEventListener('click', async () => {
    try {
      const result = await subscribePushNotification();
      alert('Subscribed!\n' + result.message);
    } catch (error) {
      alert('Gagal subscribe: ' + error.message);
    }
  });
}

if (unsubscribeBtn) {
  unsubscribeBtn.addEventListener('click', async () => {
    try {
      const result = await unsubscribePushNotification();
      alert('Unsubscribed!\n' + result.message);
    } catch (error) {
      alert('Gagal unsubscribe: ' + error.message);
    }
  });
}

// ✅ FUNGSI: Kirim cerita pending saat kembali online
window.addEventListener('online', async () => {
  console.log('🔄 Online detected, syncing pending stories...');
  try {
    await Idb.sendAllPendingStories();
    
    // Opsional: hapus semua pending secara eksplisit (jika kamu yakin semua terkirim)
    await Idb.clearAllPendingStories();

    showNotification('Cerita Offline Dikirim!', {
      body: 'Semua cerita pending berhasil dikirim saat online.',
      icon: '/icons/icon-192.png',
    });
  } catch (error) {
    console.error('Gagal sinkronisasi cerita pending:', error);
  }
});



// APP Initialization
document.addEventListener('DOMContentLoaded', async () => {
  if (!window.location.hash || window.location.hash === '#/') {
    window.location.hash = '#/home';
  }

  const app = new App({
    content: document.querySelector('#main-content'),
  });

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  const skipLink = document.querySelector('.skip-link');
  const mainContent = document.getElementById('main-content');

  if (skipLink && mainContent) {
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      setTimeout(() => mainContent.removeAttribute('tabindex'), 100);
    });
  }
});
