import { MapHelper } from '../../utils/MapHelper.js';
import { NotificationHelper } from '../../utils/notification-helper';
import AddStoryPresenter from '../add-story/add-presenter';

export default class AddPage {
  render() {
    return `
      <section class="add-story-container">
        <h1 class="add-story-title">Share Your Story</h1>
        <form id="add-story-form" class="add-story-form">
          <div class="form-group">
            <label for="description">Story Description</label>
            <textarea id="description" name="description" required></textarea>
          </div>

          <div class="form-group">
            <label>Upload Photo</label>
            <div id="photo-options">
              <input type="file" id="photo" name="photo" accept="image/*">
              <button type="button" id="take-photo-btn" class="btn btn--secondary">Take Photo</button>
            </div>
            <div id="photo-preview-container"></div>
            <button type="button" id="delete-photo-btn" class="btn btn--danger" style="display: none;">Delete Photo</button>
            <canvas id="canvas" style="display: none;"></canvas>
            <video id="video" autoplay style="display: none;"></video>
          </div>

          <div class="form-group">
            <label class="checkbox-container">
              <input type="checkbox" id="add-location">
              <span class="checkmark"></span>
              Add Location
            </label>
            <div id="location-info" style="display: none;">
              <p>Selected Location: <span id="selected-location">Not selected</span></p>
            </div>
            <div id="map-container" style="display: none; height: 300px;"></div>
          </div>

          <button type="submit" class="btn btn--primary">Share Story</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    this._capturedPhoto = null;
    this._map = null;
    this._marker = null;

    this._presenter = new AddStoryPresenter(this);

    this._bindFormSubmit();
    this._bindTakePhotoButton();
    this._bindPhotoInput();
    this._bindDeletePhotoButton();
    this._bindLocationCheckbox();
  }

  onSubmit(handler) {
    this._handleFormSubmit = handler;
  }

  _bindFormSubmit() {
    const form = document.getElementById("add-story-form");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const description = form.description.value;
      const photoInput = form.photo;
      const addLocation = document.getElementById("add-location").checked;

      let lat, lon;
      if (addLocation) {
        const locationText = document.getElementById("selected-location").textContent;
        if (locationText !== "Not selected") {
          [lat, lon] = locationText.split(",").map((coord) => parseFloat(coord.trim()));
        }
      }

      if (!photoInput.files[0] && !this._capturedPhoto) {
        NotificationHelper.showToast("Please select or take a photo", true);
        return;
      }

      const photo = this._capturedPhoto || photoInput.files[0];

      try {
        if (this._handleFormSubmit) {
          await this._handleFormSubmit({ description, photo, lat, lon });
        }
        NotificationHelper.showToast('Story added successfully');
        window.location.hash = '/stories';
      } catch (error) {
        console.error("Error submitting story:", error);
        NotificationHelper.showToast(error.message, true);
      }
    });
  }

  _bindTakePhotoButton() {
    const takePhotoBtn = document.getElementById("take-photo-btn");
    if (!takePhotoBtn) return;

    takePhotoBtn.addEventListener("click", () => {
      this._startCamera();
    });
  }

  _bindPhotoInput() {
    const fileInput = document.getElementById("photo");
    const previewContainer = document.getElementById("photo-preview-container");
    const photoOptions = document.getElementById("photo-options");
    const deleteBtn = document.getElementById("delete-photo-btn");

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;

      this._capturedPhoto = null;
      previewContainer.innerHTML = "";

      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.style.maxWidth = "100%";
      img.style.marginTop = "10px";
      previewContainer.appendChild(img);

      photoOptions.style.display = "none";
      deleteBtn.style.display = "inline-block";
    });
  }

  _bindDeletePhotoButton() {
    const fileInput = document.getElementById("photo");
    const previewContainer = document.getElementById("photo-preview-container");
    const photoOptions = document.getElementById("photo-options");
    const deleteBtn = document.getElementById("delete-photo-btn");
    const video = document.getElementById("video");

    deleteBtn.addEventListener("click", () => {
      this._capturedPhoto = null;
      fileInput.value = "";
      previewContainer.innerHTML = "";

      photoOptions.style.display = "block";
      deleteBtn.style.display = "none";

      if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.style.display = "none";
      }
    });
  }

  _bindLocationCheckbox() {
    const locationCheckbox = document.getElementById("add-location");
    if (!locationCheckbox) return;

    locationCheckbox.addEventListener("change", (event) => {
      const mapContainer = document.getElementById("map-container");
      const locationInfo = document.getElementById("location-info");

      if (event.target.checked) {
        mapContainer.style.display = "block";
        locationInfo.style.display = "block";

        try {
          this._map = MapHelper.initMap("map-container");

          MapHelper.getCurrentLocation(this._map)
            .then((coords) => {
              this._marker = MapHelper.addMarker(
                this._map,
                coords.lat,
                coords.lng,
                "Your Location"
              );
              document.getElementById("selected-location").textContent =
                `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
            })
            .catch((error) => {
              console.error("Error getting location:", error);
              NotificationHelper.showToast("Unable to get current location. Please select manually.", true);
            });

          MapHelper.addClickHandler(this._map, (clickedLat, clickedLng) => {
            if (this._marker) {
              this._map.removeLayer(this._marker);
            }
            this._marker = MapHelper.addMarker(this._map, clickedLat, clickedLng, "Selected Location");
            document.getElementById("selected-location").textContent =
              `${clickedLat.toFixed(4)}, ${clickedLng.toFixed(4)}`;
          });
        } catch (error) {
          console.error("Map initialization error:", error);
          mapContainer.innerHTML = `
            <div class="map-error">
              <p>Map could not be loaded. Please try again later.</p>
            </div>`;
        }
      } else {
        if (this._map) {
          this._map.remove();
          this._map = null;
          this._marker = null;
        }
        mapContainer.style.display = "none";
        locationInfo.style.display = "none";
      }
    });
  }

  _startCamera() {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const photoPreview = document.getElementById("photo-preview-container");
    const fileInput = document.getElementById("photo");
    const photoOptions = document.getElementById("photo-options");
    const deleteBtn = document.getElementById("delete-photo-btn");

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
        video.style.display = "block";

        const captureBtn = document.createElement("button");
        captureBtn.textContent = "Capture Photo";
        captureBtn.className = "btn";
        captureBtn.style.marginTop = "10px";

        captureBtn.addEventListener("click", () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            this._capturedPhoto = new File([blob], "captured-photo.png", {
              type: "image/png"
            });

            photoPreview.innerHTML = "";
            const img = document.createElement("img");
            img.src = URL.createObjectURL(blob);
            img.style.maxWidth = "100%";
            img.style.marginTop = "10px";
            photoPreview.appendChild(img);

            video.srcObject.getTracks().forEach((track) => track.stop());
            video.style.display = "none";
            captureBtn.remove();

            photoOptions.style.display = "none";
            deleteBtn.style.display = "inline-block";
          }, "image/png");
        });

        photoPreview.appendChild(captureBtn);
      }).catch((error) => {
        console.error("Error accessing camera:", error);
        NotificationHelper.showToast("Could not access camera", true);
      });
    } else {
      NotificationHelper.showToast("Camera access not supported", true);
    }
  }
}
