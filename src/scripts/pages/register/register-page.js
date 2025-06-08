import {
    NotificationHelper
} from '../../utils/notification-helper.js';
import {
    RegisterModel
} from './register-model.js';
import {
    RegisterPresenter
} from './register-presenter.js';

export default class RegisterPage {
    render() {
        return `
        <div class="auth-page">
            <div class="auth-container">
            <div class="auth-header">
                <h2 class="auth-title">Create Account</h2>
                <p class="auth-subtitle">Join our community today</p>
            </div>
            
            <form id="register-form" class="auth-form">
                <div class="form-group">
                <label for="name" class="form-label">Full Name</label>
                <div class="input-group">
                    <i class="fas fa-user input-icon"></i>
                    <input type="text" id="name" name="name" class="form-input" placeholder="Enter your full name" required>
                </div>
                </div>
                
                <div class="form-group">
                <label for="email" class="form-label">Email Address</label>
                <div class="input-group">
                    <i class="fas fa-envelope input-icon"></i>
                    <input type="email" id="email" name="email" class="form-input" placeholder="Enter your email" required>
                </div>
                </div>
                
                <div class="form-group">
                <label for="password" class="form-label">Password</label>
                <div class="input-group">
                    <i class="fas fa-lock input-icon"></i>
                    <input type="password" id="password" name="password" class="form-input" placeholder="Create password (min 8 chars)" required minlength="8">
                    
                </div>
                </div>
                
                <div class="form-group">
                <label class="checkbox-container terms-checkbox">
                    <input type="checkbox" id="terms">
                    <span class="checkmark"></span>
                    I agree to the <a href="#/terms" class="terms-link">Terms of Service</a> and <a href="#/privacy" class="terms-link">Privacy Policy</a>
                </label>
                </div>
                
                <button type="submit" class="btn btn-primary btn-block btn-auth" id="registerbtn">
                <span class="btn-text">Create Account</span>
                <i class="fas fa-user-plus btn-icon"></i>
                </button>
                
                <div class="auth-divider">
                <span>OR</span>
                </div>
                
                <p class="auth-footer">
                Already have an account? <a href="#/login" class="auth-link">Login here</a>
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
        const model = new RegisterModel();
        const presenter = new RegisterPresenter(model, this);

        const form = document.getElementById('register-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const agreed = document.getElementById('terms')?.checked;

            if (!agreed) {
                alert('You must agree to the terms.');
                return;
            }

            await presenter.registerUser(name, email, password);
        });
    }

    showLoading() {
        const button = document.getElementById('registerbtn');
        button.disabled = true;
        button.querySelector('.btn-text').textContent = 'Creating...';
    }

    hideLoading() {
        const button = document.getElementById('registerbtn');
        if (button) {
            button.disabled = false;
            const btnText = button.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Create Account';
        }
    }

    renderRegisterSuccess(message) {
        this.hideLoading();
        NotificationHelper.showToast(`Berhasil: ${message}`);
        window.location.hash = '#/login';
    }

    renderRegisterError(message) {
        this.hideLoading();
        NotificationHelper.showToast(`Gagal: ${message}`, true);
    }
}
