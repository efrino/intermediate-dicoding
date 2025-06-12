import SaveStoriesModel from "./save-stories-model.js";
import SaveStoriesPresenter from "./save-stories-presenter.js";

export default class SaveStoriesPage {
    render() {
        return `
        <section class="stories-page">
            <h1 class="stories-title">Save Stories</h1>
            <div id="stories-list" class="stories-grid"></div>
            <div class="stories-pagination">
            <button id="load-more" class="btn">Load More</button>
            </div>
        </section>
        `;
    }

    async afterRender() {
        console.log('afterRender dipanggil');
        const model = new SaveStoriesModel();
        const presenter = new SaveStoriesPresenter(model, this);
        this.presenter = presenter;
        await presenter.showStories();
    }

    bindRemoveStoryButton(handler) {
        const container = document.getElementById('stories-list');
        if (!container) return;

        container.removeEventListener('click', this._removeListener); 

        this._removeListener = (event) => {
            if (event.target.classList.contains('remove-story-btn')) {
                const id = event.target.getAttribute('data-id');
                handler(id);
            }
        };

        container.addEventListener('click', this._removeListener);
    }

    showLoading() {
        const container =
            document.getElementById("stories-list") ||
            document.getElementById("story-detail-content");

        if (container) {
            container.innerHTML = `
            <div class="loading-spinner-container">
            <div class="loading-spinner"></div>
            <p>Loading stories...</p>
            </div>
        `;
        }
    }

    showEmptyState() {
        const container = document.getElementById("stories-list");
        if (container) {
            container.innerHTML = `
            <div class="empty-state">
            <i class="fas fa-book-open"></i>
            <p>No stories found</p>
            ${
                window.AuthHelper?.isUserLoggedIn?.()
                ? '<a href="#/add-story" class="btn">Share Your Story</a>'
                : '<a href="#/login" class="btn">Login to Share</a>'
            }
            </div>
        `;
        }
    }

    renderStories(stories) {
        const container = document.getElementById("stories-list");
        if (!container) return;

        container.innerHTML = '';

        stories.forEach((story, index) => {
            container.innerHTML += this._generateStoryCard(story, index);
        });
    }

    _generateStoryCard(story, index) {
        return `
        <article class="story-card" 
                data-id="${story.id}" 
                tabindex="0"
                style="view-transition-name: story-${story.id}">
            <div class="story-card__image-container">
            <img src="${story.photoUrl}" 
                alt="${story.description}" 
                class="story-card__image"
                style="view-transition-name: story-image-${story.id}"
                onerror="this.src='./images/default-story.jpg'"
                loading="lazy">
            </div>
            <div class="story-card__content">
            <h3 class="story-card__title">${story.name || "Anonymous"}</h3>
            <p class="story-card__description">
                ${story.description?.substring(0, 100) || "No description available"}${story.description?.length > 100 ? "..." : ""}
            </p>
            <div class="story-card__meta">
                <time class="story-card__date">
                ${
                    story.createdAt
                    ? new Date(story.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        })
                    : "Unknown date"
                }
                </time>
                ${
                story.lat && story.lon
                    ? `<div class="story-card__location" 
                        data-lat="${story.lat}" 
                        data-lon="${story.lon}"
                        aria-label="View location on map"
                        role="button"
                        tabindex="0">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Location</span>
                    </div>`
                    : ""
                }
            </div>
            <button class="btn btn--danger remove-story-btn" data-id="${story.id}">
                Remove
            </button>
            <a href="#/stories/${story.id}" class="btn btn--small">Read More</a>
            </div>
        </article>
        `;
    }

    removeFromBookmarkSuccessfully(message) {
        alert(message);
    }

    removeFromBookmarkFailed(message) {
        alert(`Failed to remove story: ${message}`);
    }
}