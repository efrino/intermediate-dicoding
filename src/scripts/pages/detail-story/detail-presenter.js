export class DetailPresenter {
    constructor(model, view) {
        this._model = model;
        this._view = view;
    }

    async getDetail(id) {
        try {
            this._view.showLoading();

            const story = await this._model.fetchStoryById(id);

            if (story && story.id) {
                this._view.renderDetail(story);
            } else {
                this._view.renderFailedMessage('Detail story tidak ditemukan.');
            }
        } catch (error) {
            console.error('Error fetching story detail:', error);
            this._view.renderFailedMessage('Terjadi kesalahan saat mengambil detail story.');
        }
    }
}
