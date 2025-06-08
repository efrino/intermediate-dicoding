// stories-model.js
import Idb from '../../utils/idb';

export default class StoriesModel {
    constructor(api) {
        this.api = api;
    }

    async fetchStories() {
        try {
            const response = await this.api.getAllStories();
            const stories = response || [];

            // Simpan ke IndexedDB
            await Idb.putStories(stories);

            return stories;
        } catch (error) {
            console.error("Gagal ambil dari API, fallback ke IndexedDB:", error);
            return await Idb.getAllStories();
        }
    }
}
