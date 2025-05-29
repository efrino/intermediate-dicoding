export default class StoriesPresenter {
    constructor(model, view) {
        this._model = model;
        this._view = view;
        this._allStories = [];
        this._currentPage = 1;
        this._storiesPerPage = 6;
    }

    async showStories() {
        this._view.showLoading();

        const stories = await this._model.fetchStories();
        this._allStories = stories;

        if (!stories.length) {
            this._view.showEmptyState();
            return;
        }

        this._view.renderStories(this._getVisibleStories());

        this._view.updateLoadMoreButton(
            this._allStories.length - this._currentPage * this._storiesPerPage,
            () => this._handleLoadMore()
        );

        this._view.bindLocationClickListeners();

        this._view.bindAddStoryButton(() => this._view.handleAddStoryClick());
    }

    _handleLoadMore() {
        this._currentPage++;
        const visibleStories = this._getVisibleStories();
        this._view.renderStories(visibleStories);
        this._view.updateLoadMoreButton(this._getRemainingStoriesCount(), () => this._handleLoadMore());
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