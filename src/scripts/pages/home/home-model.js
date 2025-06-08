// home-model.js
import Idb from '../../utils/idb';
import { getAllStories } from '../../data/api';

export class HomeModel {
    async fetchStories(page = 1, limit = 3) {
        try {
            const response = await getAllStories();
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
