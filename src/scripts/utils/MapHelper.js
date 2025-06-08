import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Tambahkan ini setelah import leaflet!
// Import ikon secara eksplisit
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Override URL default Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export class MapHelper {
    static _isLeafletLoaded() {
        return typeof L !== 'undefined' && typeof L.map === 'function';
    }

    static _createBaseLayers() {
        return {
            OpenStreetMap: {
                name: 'OpenStreetMap',
                layer: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors',
                    errorTileUrl: '/images/404.svg',
                }),
            },
            esriWorld: {
                name: 'EsriWorld',
                layer: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/' +
                    'World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ',
                    errorTileUrl: '/images/404.svg',
                }),
            },
            cartoDark: {
                name: 'Carto Dark',
                layer: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
                    errorTileUrl: '/images/404.svg',
                }),
            },
        };
    }

    static initMap(containerId, lat = -6.2088, lng = 106.8456, zoom = 13) {
        if (!this._isLeafletLoaded()) throw new Error("Leaflet library not properly loaded.");

        const container = document.getElementById(containerId);
        if (!container) throw new Error(`Map container with ID '${containerId}' not found`);
        if (container._leaflet_map) return container._leaflet_map;

        const map = L.map(container, {
            preferCanvas: true,
            zoomControl: false,
            attributionControl: false,
            fadeAnimation: true,
            zoomAnimation: true,
        }).setView([lat, lng], zoom);

        container._leaflet_map = map;

        L.control.zoom({ position: "topright" }).addTo(map);

        const baseLayers = this._createBaseLayers();
        const defaultKey = 'OpenStreetMap';
        baseLayers[defaultKey].layer.addTo(map);

        this._addLayerDropdown(map, baseLayers, defaultKey);
        this._addLocationButton(map);

        const handleResize = () => map.invalidateSize();
        window.addEventListener("resize", handleResize);
        map.on("remove", () => window.removeEventListener("resize", handleResize));

        return map;
    }

    static addMarker(map, lat, lng, popupText) {
        const marker = L.marker([lat, lng]).addTo(map);
        if (popupText) marker.bindPopup(popupText);
        return marker;
    }

    static removeMap(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (container._leaflet_map) {
            try {
                container._leaflet_map.remove();
            } catch (error) {
                console.warn("Error while removing map:", error);
            }
            container._leaflet_map = null;
        }
        container.innerHTML = "";
    }

    static async getCurrentLocation(map, options = {}) {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser"));
                return;
            }

            const geolocationOptions = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
                ...options,
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    if (map) {
                        map.setView([latitude, longitude], 15);
                        L.circleMarker([latitude, longitude], {
                            radius: 8,
                            fillColor: "#3388ff",
                            color: "#fff",
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0.9,
                        }).addTo(map).bindPopup("📍 Lokasi Anda").openPopup();
                    }
                    resolve({ lat: latitude, lng: longitude });
                },
                (error) => reject(error),
                geolocationOptions
            );
        });
    }

    static addClickHandler(map, callback) {
        if (!map || !this._isLeafletLoaded() || typeof callback !== "function") return;

        const clickHandler = (e) => {
            try {
                callback(e.latlng.lat, e.latlng.lng);
            } catch (error) {
                console.error("Error in map click handler:", error);
            }
        };

        map.on("click", clickHandler);
        return () => map.off("click", clickHandler);
    }

    static _addLocationButton(map) {
        const locationControl = L.control({ position: 'bottomleft' });

        locationControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            div.style.background = 'white';
            div.style.padding = '6px';
            div.style.cursor = 'pointer';
            div.title = "Tampilkan Lokasi Saya";
            div.innerHTML = '📍 Lokasi Saya';
            div.onclick = () => {
                this.getCurrentLocation(map).catch((err) => {
                    alert("Gagal mendapatkan lokasi: " + err.message);
                });
            };
            return div;
        };

        locationControl.addTo(map);
    }

    static _addLayerDropdown(map, baseLayers, defaultKey) {
        const control = L.control({ position: 'topright' });

        control.onAdd = () => {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            div.style.background = 'white';
            div.style.padding = '4px 6px';

            const select = document.createElement('select');
            select.style.padding = '4px';
            select.style.border = '1px solid #ccc';
            select.style.borderRadius = '4px';

            for (const key in baseLayers) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = baseLayers[key].name;
                if (key === defaultKey) option.selected = true;
                select.appendChild(option);
            }

            let currentLayer = baseLayers[defaultKey].layer;

            select.addEventListener('change', (e) => {
                if (currentLayer) map.removeLayer(currentLayer);
                currentLayer = baseLayers[e.target.value].layer;
                currentLayer.addTo(map);
            });

            div.appendChild(select);
            return div;
        };

        control.addTo(map);
    }
}
