import StoriesModel from "./stories-model.js";
import StoriesPresenter from "./stories-presenter.js";
import * as api from "../../data/api.js";
import {
    MapHelper
} from '../../utils/MapHelper';
import {
    isUserLoggedIn
} from '../../utils';


export default class StoriesPage {
    constructor() {
        this.model = new StoriesModel(api);
        this.presenter = new StoriesPresenter(this.model, this);
    }

    async render() {
        return `
        <section class="stories-page">
            <h1 class="stories-title">All Stories</h1>
            <div id="stories-list" class="stories-grid"></div>
            <div class="stories-pagination">
            <button id="load-more" class="btn">Load More</button>
            </div>
        </section>
        `;
    }

    async afterRender() {
        await this.presenter.showStories();
        this.bindAddStoryButton(() => this.handleAddStoryClick());
        this.bindLocationClickListeners((lat, lon) => this.showLocationPopup(lat, lon));

        if (!isUserLoggedIn()) {
            const loadMoreBtn = document.getElementById("load-more");
            if (loadMoreBtn) loadMoreBtn.style.display = "none";
        }
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
            <img src="../../../public/images/404.svg" alt="No stories" class="empty-icon" />
            <p>No stories found</p>
            ${window.AuthHelper?.isUserLoggedIn?.()
                    ? '<a href="#/add-story" class="btn">Share Your Story</a>'
                    : '<a href="#/login" class="btn">Go to Login</a>'
                }
        </div>
        `;
        }
    }


    renderStories(stories) {
        const container = document.getElementById("stories-list");
        if (!container) return;
        container.innerHTML = stories.map((story, index) => this._generateStoryCard(story, index)).join("");
    }

    updateLoadMoreButton(remaining, onClickHandler) {
        const loadMoreBtn = document.getElementById("load-more");
        if (!loadMoreBtn) return;

        if (!isUserLoggedIn() || remaining <= 0) {
            loadMoreBtn.style.display = "none";
        } else {
            loadMoreBtn.style.display = "inline-block";
            loadMoreBtn.textContent = `Load More (${remaining} remaining)`;
            loadMoreBtn.onclick = onClickHandler;
        }
    }
    bindLocationClickListeners(callback) {
        const locations = document.querySelectorAll(".story-card__location");
        locations.forEach((location) => {
            location.addEventListener("click", (e) => {
                e.preventDefault();
                const lat = parseFloat(location.dataset.lat);
                const lon = parseFloat(location.dataset.lon);
                callback(lat, lon);
            });
        });
    }

    showLocationPopup(lat, lon) {
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

        const closePopup = () => {
            document.body.removeChild(popup);
            document.body.style.overflow = "";
            document.removeEventListener("click", outsideClickListener);
        };

        popup.querySelector(".close-popup").addEventListener("click", closePopup);

        const outsideClickListener = (event) => {
            if (!popup.contains(event.target)) {
                closePopup();
            }
        };

        setTimeout(() => {
            document.addEventListener("click", outsideClickListener);
        }, 0);
    }

    bindAddStoryButton(handler) {
        console.log("Menjalankan bindAddStoryButton...");
        console.log("window.location.hash:", window.location.hash);

        if (document.querySelector(".fab-add-story")) {
            console.log("FAB sudah ada, tidak akan ditambahkan lagi.");
            return;
        }

        if (window.location.hash.includes("#/stories")) {
            const fab = document.createElement("button");
            fab.className = "fab fab-add-story";
            fab.innerHTML = '<i class="fas fa-plus"></i>';
            fab.setAttribute("aria-label", "Add new story");
            fab.addEventListener("click", handler);
            document.body.appendChild(fab);
        }
    }

    handleAddStoryClick() {
        if (isUserLoggedIn()) {
            window.location.hash = "#/add-story";
        } else {
            window.location.hash = "#/login";
        }
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
            ${story.description || "No description available"}
            </p>

            <div class="story-card__meta">
                <time class="story-card__date">
                ${story.createdAt
                ? new Date(story.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                })
                : "Unknown date"
            }
                </time>
                ${story.lat && story.lon
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
            <a href="#/stories/${story.id}" class="btn btn--small">Read More</a>
            </div>
        </article>
        `;
    }
}