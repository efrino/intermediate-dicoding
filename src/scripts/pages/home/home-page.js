import { showFormattedDate } from '../../utils';
import { MapHelper } from '../../utils/MapHelper';
import { HomeModel } from './home-model';
import { HomePresenter } from './home-presenter';

export default class HomePage {
  render() {
    return `
    <section class="hero">
      <div class="hero__inner">
        <h2 class="hero__title">Share Your Dicoding Story</h2>
        <p class="hero__tagline">Tell us about your learning journey, projects, and experiences at Dicoding</p>
        <a href="#/add-story" class="btn btn--primary">Share Your Story</a>
      </div>
    </section>

    <div id="unauth-container" class="unauth" hidden>
      <h3>You must be logged in to view featured stories.</h3>
      <a href="#/login" class="btn btn--primary">Go to Login</a>
    </div>

    <section id="featured-stories-section" class="featured-stories" hidden>
      <h2>Featured Stories</h2>
      <div id="featured-stories-container" class="stories-container"></div>
      <div class="show-more-container">
        <a href="#/stories" class="btn btn--secondary">Show More Stories</a>
      </div>
    </section>
  `;
  }

  async afterRender() {
    const token = localStorage.getItem('accessToken');
    const unauthContainer = document.getElementById('unauth-container');
    const featuredSection = document.getElementById('featured-stories-section');

    if (!token) {
      unauthContainer.removeAttribute('hidden');
      featuredSection.setAttribute('hidden', true);
      return;
    }

    unauthContainer.setAttribute('hidden', true);
    featuredSection.removeAttribute('hidden');

    const homeModel = new HomeModel();
    const homePresenter = new HomePresenter({
      homeModel,
      homePage: this,
    });

    try {
      await homePresenter.init();
      this._attachLocationClickListeners();
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        localStorage.removeItem('accessToken');
        unauthContainer.removeAttribute('hidden');
        featuredSection.setAttribute('hidden', true);
      } else {
        this.renderError(error.message);
      }
    }
  }

  renderStories(stories) {
    const container = document.getElementById('featured-stories-container');
    if (!container) return;

    container.innerHTML = stories
      .slice(0, 3)
      .map((story) => this._getStoryCard(story))
      .join('');
  }

  renderLoading() {
    const container = document.getElementById('featured-stories-container');
    if (container) container.innerHTML = '<div class="loading-spinner"></div>';
  }

  renderError(message) {
    const container = document.getElementById('featured-stories-container');
    if (container) container.innerHTML = `<p class="error-message">${message}</p>`;
  }

  _getStoryCard(story) {
    const date = story.createdAt ? showFormattedDate(story.createdAt) : 'Unknown date';

    return `
      <article class="story-card">
        <div class="story-card__image-container">
          <img src="${story.photoUrl}" alt="${story.description}" class="story-card__image">
        </div>
        <div class="story-card__content">
          <h3 class="story-card__title">${story.name}</h3>
          <p class="story-card__description">${story.description}</p>
          <div class="story-card__meta">
            <time class="story-card__date">${date}</time>
            ${story.lat && story.lon
        ? `<div class="story-card__location" data-lat="${story.lat}" data-lon="${story.lon}">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Location</span>
                  </div>`
        : ''
      }
          </div>
          <a href="#/stories/${story.id}" class="btn btn--small">Read More</a>
        </div>
      </article>
    `;
  }

  _attachLocationClickListeners() {
    const locations = document.querySelectorAll(".story-card__location");
    locations.forEach((location) => {
      location.addEventListener("click", (e) => {
        e.preventDefault();
        const lat = parseFloat(location.dataset.lat);
        const lon = parseFloat(location.dataset.lon);
        this._showLocationPopup(lat, lon);
      });
    });
  }

  _showLocationPopup(lat, lon) {
    const popup = document.createElement("div");
    popup.className = "map-popup";
    popup.innerHTML = `
      <div id="mini-map" style="width: 500px; height: 350px;"></div>
      <button class="close-popup">&times;</button>
    `;

    document.body.appendChild(popup);
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      const map = MapHelper.initMap("mini-map", lat, lon, 13);
      MapHelper.addMarker(map, lat, lon, "Story location").openPopup();
    }, 100);

    popup.querySelector(".close-popup").addEventListener("click", () => {
      document.body.removeChild(popup);
      document.body.style.overflow = "";
      document.removeEventListener("click", outsideClickListener);
    });

    const outsideClickListener = (event) => {
      if (!popup.contains(event.target)) {
        document.body.removeChild(popup);
        document.body.style.overflow = "";
        document.removeEventListener("click", outsideClickListener);
      }
    };

    setTimeout(() => {
      document.addEventListener("click", outsideClickListener);
    }, 0);
  }
}
