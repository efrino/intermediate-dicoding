import routes from '../routes/routes';
import {
  getActiveRoute
} from '../routes/url-parser';
import {
  isUserLoggedIn
} from '../utils/index';


class App {
  #content = null;

  constructor({
    content
  }) {
    this.#content = content;
  }

  async renderPage() {
    this._stopActiveMediaStreams();

    const url = getActiveRoute();

    if (!url) return;

    if (url === '/login' && isUserLoggedIn()) {
      window.location.hash = '/home';
      return;
    }

    const page = routes[url];

    if (!page) {
      this.#content.innerHTML = '../../../public/offline.html';
      return;
    }
    this._removeFabButton();
    
    if (!document.startViewTransition) {
      this.#content.innerHTML = await page.render();
      await page.afterRender();

      return;
    }

    document.startViewTransition(async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    });

    this._bindSkipLink();
    document.querySelector('app-bar') ?.update ?.();
  }

  _removeFabButton() {
    const fab = document.querySelector(".fab-add-story");
      if (fab) fab.remove();
  }

  _stopActiveMediaStreams() {
    const videos = document.querySelectorAll('video');

    videos.forEach((video) => {
      const stream = video.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
    });
  }

  _bindSkipLink() {
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
  }
  
}


export default App;