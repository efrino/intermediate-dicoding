export class RegisterPresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    async registerUser(name, email, password) {
        this.view.showLoading();

        const result = await this.model.register(name, email, password);

        if (!result.error) {
            this.view.renderRegisterSuccess(result.message);
        } else {
            this.view.renderRegisterError(result.message);
        }
    }
}