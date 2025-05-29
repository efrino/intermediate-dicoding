import {
    DetailModel
} from './detail-model.js';
import {
    DetailPresenter
} from './detail-presenter.js';

import {
    MapHelper
} from '../../utils/MapHelper';
import { showFormattedDate } from '../../utils/index.js';


export default class DetailPage {
    render() {
        return `
        <div id="stories-container" class="stories-container" aria-live="polite">
        </div>
        `;
    }

    async afterRender() {
        const model = new DetailModel();
        const presenter = new DetailPresenter(model, this);

        const id = window.location.hash.split('/')[2];

        if (id) {
            await presenter.getDetail(id);

            const mapEl = document.getElementById('story-map');

            if (mapEl) {
                const lat = parseFloat(mapEl.dataset.lat);
                const lon = parseFloat(mapEl.dataset.lon);

                if (!isNaN(lat) && !isNaN(lon)) {
                    this._initDetailMap(lat, lon, "Story Location");
                } else {
                    console.warn("Invalid or missing coordinates in data attributes");
                }
            } else {
                console.warn("#story-map not found in DOM");
            }
        } else {
            this.renderFailedMessage('Story ID tidak ditemukan.');
        }
    }

    renderDetail(story = {}) {
        const container = document.getElementById('stories-container');
        const safeStory = {
            id: story.id || 'unknown',
            name: this._escapeHtml(story.name) || 'Anonymous',
            description: this._escapeHtml(story.description) || 'No description available',
            photoUrl: this._validateUrl(story.photoUrl) || './images/default-story.jpg',
            createdAt: story.createdAt ?
                new Date(story.createdAt).toLocaleDateString() : 'Unknown date',
            lat: typeof story.lat === 'number' ? story.lat : null,
            lon: typeof story.lon === 'number' ? story.lon : null,
        };

        container.innerHTML = `
        <article class="story-detail" data-id="${safeStory.id}">
        <button class="back-button" aria-label="Kembali ke halaman sebelumnya" onclick="window.history.back()">
        <i class="fas fa-arrow-left"></i> Back
        </button>


            <h1>${safeStory.name}'s Story</h1>
            
            <div class="story-meta">
            <time datetime="${story.createdAt || ''}">
            ${story.createdAt ? showFormattedDate(story.createdAt) : 'Tanggal tidak diketahui'}
            </time>
            </div>

            <figure class="story-image">
            <img src="${safeStory.photoUrl}" 
                alt="Story by ${safeStory.name}" 
                loading="lazy">
            </figure>

           <div class="story-content">
            <p class="story-description">${safeStory.description}</p>
            </div>


            ${safeStory.lat !== null && safeStory.lon !== null
                ? `
            <div class="story-map-container">
                <h2><i class="fas fa-map-marker-alt"></i> Location</h2>
                <div id="story-map" 
                    data-lat="${safeStory.lat}" 
                    data-lon="${safeStory.lon}" 
                    aria-label="Story location map">
                </div>
            </div>
            `
                : ''
            }
        </article>
    `;
    }

    renderFailedMessage(message = 'Gagal mendapatkan detail story.') {
        const container = document.getElementById('stories-container');
        container.innerHTML = `
        <div class="error-message" aria-live="assertive">
            <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Error</h2>
            <p>${this._escapeHtml(message)}</p>
            <div class="error-actions">
            <button onclick="window.location.reload()" class="btn">
                Try Again
            </button>
            <a href="#/stories" class="btn">
                Back to Stories
            </a>
            </div>
        </div>
        `;
    }

    showLoading() {
        const container = document.getElementById('stories-container');
        container.innerHTML = `
        <div class="loading-indicator" aria-live="polite" aria-busy="true">
            <div class="spinner" aria-hidden="true"></div>
            <p>Loading stories...</p>
        </div>
        `;
    }

    _escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    _validateUrl(url) {
        if (!url) return null;
        try {
            new URL(url);
            return url;
        } catch {
            return null;
        }
    }

    _initDetailMap(lat, lon, title) {
        MapHelper.removeMap("story-map");

        const mapContainer = document.getElementById("story-map");
        if (!mapContainer) {
            console.error("Story map container not found");
            return;
        }

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    resizeObserver.disconnect();
                    this._initializeStoryMap(lat, lon, title);
                }
            }
        });

        resizeObserver.observe(mapContainer);

        const fallbackTimeout = setTimeout(() => {
            resizeObserver.disconnect();
            this._initializeStoryMap(lat, lon, title);
        }, 500);

        this._mapCleanup = () => {
            clearTimeout(fallbackTimeout);
            resizeObserver.disconnect();
        };
    }

    _initializeStoryMap(lat, lon, title) {
        try {
            const mapContainer = document.getElementById("story-map");
            if (!mapContainer || !mapContainer.isConnected) {
                throw new Error("Map container not available");
            }

            const map = MapHelper.initMap("story-map", lat, lon, 13);
            if (!map) {
                throw new Error("Map initialization returned null");
            }

            try {
                const marker = MapHelper.addMarker(
                    map,
                    lat,
                    lon,
                    `<h3>${title || "Story Location"}</h3>
                    <p>Latitude: ${lat.toFixed(6)}</p>
                    <p>Longitude: ${lon.toFixed(6)}</p>`
                );
                marker.openPopup();
            } catch (markerError) {
                console.error("Failed to add marker:", markerError);
            }

            this._storyMap = map;
        } catch (error) {
            console.error("Failed to initialize story map:", error);
            this._showMapFallback(lat, lon);
        }
    }

    _showMapFallback(lat, lon) {
        const mapContainer = document.getElementById("story-map");
        if (!mapContainer) return;

        mapContainer.innerHTML = `
        <div class="map-fallback">
            <p>Map could not be loaded. Coordinates:</p>
            <p>Latitude: ${lat.toFixed(6)}</p>
            <p>Longitude: ${lon.toFixed(6)}</p>
        </div>
        `;
    }
}