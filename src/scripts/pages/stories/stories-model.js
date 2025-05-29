export default class StoriesModel {
    constructor(api) {
        this.api = api;
    }

    async fetchStories() {
        try {
            const response = await this.api.getAllStories();
            return response || [];
        } catch (error) {
            console.error("Failed to fetch stories:", error);
            return [];
        }
    }
}