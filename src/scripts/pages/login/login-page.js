import { NotificationHelper } from '../../utils/notification-helper.js';
import {
    LoginModel
} from './login-model.js';
import {
    LoginPresenter
} from './login-presenter.js';

export default class LoginPage {
    render() {
        return `
        <div class="auth-page">
        <div class="auth-container">
            <div class="auth-header">
            <h2 class="auth-title">Welcome Back</h2>
            <p class="auth-subtitle">Please login to continue</p>
            </div>

            <form id="login-form" class="auth-form">
            <div class="form-group">
                <label for="email" class="form-label">Email Address</label>
                <div class="input-group">
                <i class="fas fa-envelope input-icon"></i>
                <input type="email" id="emailInput" name="email" class="form-input" placeholder="Enter your email" required>
                </div>
            </div>

            <div class="form-group">
                <label for="password" class="form-label">Password</label>
                <div class="input-group">
                <i class="fas fa-lock input-icon"></i>
                <input type="password" id="passwordInput" name="password" class="form-input" placeholder="Enter your password" required minlength="8">
                </div>
            </div>

            <button type="submit" class="btn btn-primary btn-block" id="loginButton">Login</button>

            <p class="auth-footer">
                Don't have an account? <a href="#/register" class="auth-link">Create account</a>
            </p>
            </form>
        </div>

        <div class="auth-background">
            <div class="background-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
            </div>
        </div>
        </div>
    `;
    }

    async afterRender() {
        const model = new LoginModel();
        const presenter = new LoginPresenter(model, this);
        const loginForm = document.getElementById('login-form');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('emailInput').value;
            const password = document.getElementById('passwordInput').value;
            await presenter.loginUser(email, password);
        });
    }

    showLoading() {
        const button = document.getElementById('loginButton');
        button.disabled = true;
        button.textContent = 'Logging in...';
    }

    hideLoading() {
        const button = document.getElementById('loginButton');
        button.disabled = false;
        button.textContent = 'Login';
    }

    renderLoginSuccess(user) {
        NotificationHelper.showToast(`Welcome Back, ${user.name}`);
        // aktifkan kembali tombol (opsional kalau mau)
        this.hideLoading();
        window.location.hash = '/home';
    }

    renderLoginError(errorMessage = "Login failed. Please check your credentials.") {
        NotificationHelper.showToast(errorMessage, true);
        this.hideLoading();  // aktifkan kembali tombol setelah error
    }
}