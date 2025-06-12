export default class StoriesPresenter {
    constructor(apiModel, dbModel, view) {
        this._apiModel = apiModel;
        this._dbModel = dbModel;
        this._view = view;
        this._allStories = [];
        this._currentPage = 1;
        this._storiesPerPage = 6;
    }

    async showStories() {
        this._view.showLoading();

        const stories = await this._apiModel.fetchStories();

        if (!stories.length) {
            this._view.showEmptyState();
            return;
        }

        const updatedStories = await Promise.all(
            stories.map(async (story) => {
                const isSaved = await this._dbModel.getReportById(story.id);
                return {
                    ...story,
                    isSaved: !!isSaved,
                };
            })
        );

        this._allStories = updatedStories;

        const visibleStories = this._getVisibleStories();

        this._view.renderStories(visibleStories);

        this._view.updateLoadMoreButton(
            this._allStories.length - this._currentPage * this._storiesPerPage,
            () => this._handleLoadMore()
        );

        this._view.bindLocationClickListeners();
        this._view.bindSaveStoryButton((id, button) => this.saveStory(id, button));
        this._view.bindAddStoryButton(() => this._view.handleAddStoryClick());
    }

    async saveStory(id, buttonElement) {
        try {
            const story = await this._apiModel.getStoryById(id);
            await this._dbModel.putReport(story);

            const storyIndex = this._allStories.findIndex(s => s.id === id);
            if (storyIndex !== -1) {
                this._allStories[storyIndex].isSaved = true;
            }

            if (buttonElement) {
                buttonElement.textContent = 'Tersimpan';
                buttonElement.disabled = true;
            }
            this._view.saveToBookmarkSuccessfully('Success to save story');
        } catch (error) {
            console.error('saveStory: error:', error);
            this._view.saveToBookmarkFailed(error.message);
        }
    }

    async _handleLoadMore() {
        this._currentPage++;

        const visibleStories = this._getVisibleStories();

        const updatedStories = await Promise.all(
            visibleStories.map(async (story) => {
                const isSaved = await this._dbModel.getReportById(story.id);
                return {
                    ...story,
                    isSaved: !!isSaved,
                };
            })
        );

        this._allStories = this._allStories.concat(updatedStories);

        this._view.renderStories(this._allStories);

        this._view.updateLoadMoreButton(
            this._getRemainingStoriesCount(),
            () => this._handleLoadMore()
        );

        this._view.bindSaveStoryButton((id, button) => this.saveStory(id, button));
        this._view.bindAddStoryButton(() => this._view.handleAddStoryClick());
        this._view.bindLocationClickListeners(this._showLocationPopup.bind(this));
    }

    _getVisibleStories() {
        const end = this._currentPage * this._storiesPerPage;
        return this._allStories.slice(0, end);
    }

    _getRemainingStoriesCount() {
        return this._allStories.length - this._currentPage * this._storiesPerPage;
    }

    _showLocationPopup(lat, lon) {
        this._view.showLocationPopup(lat, lon);
    }
}