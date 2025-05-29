import {
    getAllStories
} from '../../data/api';

export class HomeModel {
    async fetchStories(page = 1, limit = 3) {
        try {
            return await getAllStories(page, limit);
        } catch (error) {
            throw new Error('Failed to fetch stories');
        }
    }
}