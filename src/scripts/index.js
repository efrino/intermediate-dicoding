import '../styles/main.css';
import '../styles/responsive.css';

import App from './pages/app';
import '../scripts/component/AppBar';

import { registerServiceWorker } from './utils';

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.location.hash || window.location.hash === '#/') {
    window.location.hash = '#/home';
  }
  const app = new App({
    content: document.querySelector('#main-content'),
  });
  await app.renderPage();
  await registerServiceWorker();

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

      setTimeout(() => {
        mainContent.removeAttribute('tabindex');
      }, 100);
    });
  }
});
