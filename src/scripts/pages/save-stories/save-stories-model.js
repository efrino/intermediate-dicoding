import Database from '../../data/database';

export default class SaveStoriesModel {
    async getStories() {
        try {
            const stories = await Database.getAllReports();
            return stories;
        } catch (error) {
            console.error('Failed to get stories from IndexedDB:', error);
            return null;
        }
    }
    async removeStory(id) {
        try {
            return await Database.removeStory(id);
        } catch (error) {
            throw new Error('Failed to remove story');
        }
    }

}