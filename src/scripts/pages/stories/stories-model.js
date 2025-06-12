import * as Api from '../../data/api.js';

export default class StoriesModel {
    constructor(api = {
        getAllStories: Api.getAllStories,
        getStoryById: Api.getStoryById
    }) {
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

    async getStoryById(id) {
        try {
            const story = await this.api.getStoryById(id);
            return story;
        } catch (error) {
            console.error(`Failed to get story by id ${id}:`, error);
            throw error;
        }
    }
}