export class HomePresenter {
    constructor({
        homeModel,
        homePage
    }) {
        this.homeModel = homeModel;
        this.homePage = homePage;
    }

    async init() {
        try {
            this.homePage.renderLoading();

            const stories = await this.homeModel.fetchStories(1, 3);

            this.homePage.renderStories(stories);
        } catch (error) {
            this.homePage.renderError(error.message);
        }
    }
}