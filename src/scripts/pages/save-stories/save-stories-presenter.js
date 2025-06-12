export default class SaveStoriesPresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    async showStories() {
        this.view.showLoading();

        const stories = await this.model.getStories();
        console.log('Stories fetched:', stories);
        if (!stories || stories.length === 0) {
            this.view.showEmptyState();
            return;
        }

        this.view.renderStories(stories);

        this.view.bindRemoveStoryButton(async (id) => {
            await this.removeStory(id);
        });
    }

    async removeStory(storyId) {
        try {
            await this.model.removeStory(storyId);
            this.view.removeFromBookmarkSuccessfully('Story successfully removed.');
            await this.showStories();
        } catch (error) {
            console.error('removeStory: error:', error);
            this.view.removeFromBookmarkFailed(error.message);
        }
    }
}