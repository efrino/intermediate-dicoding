export class LoginPresenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    async loginUser(email, password) {
        this.view.showLoading();
        try {
            const user = await this.model.login(email, password);
            this.view.renderLoginSuccess(user);
        } catch (error) {
            this.view.renderLoginError();
        }
    }
}