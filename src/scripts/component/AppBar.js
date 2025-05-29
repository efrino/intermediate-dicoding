import {
    getUserData
} from '../utils/index.js';
import { NotificationHelper } from '../utils/notification-helper.js';

class AppBar extends HTMLElement {
    connectedCallback() {
        this.render();
        this._setupNavActiveToggle();
    }

    render() {
        const user = getUserData();

        const authContent = user.token ?
            `
            <div class="user-info">
            <span class="user-name">${user.name || 'User'}</span>
            <button id="logout-button" class="btn btn--text">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
            </div>
        ` :
            `
            <a href="#/login" class="nav-link">Login</a>
            <a href="#/register" class="nav-link register-btn">Register</a>
        `;

        this.innerHTML = `
        <header class="app-bar" role="banner">
            <a href="#main-content" class="skip-link">Skip to content</a>
            <div class="app-bar__brand">
            <h1>Dicoding Stories</h1>
            </div>

            <button
            id="hamburger-button"
            class="menu-toggle"
            aria-label="Menu"
            aria-expanded="false"
            aria-controls="navigation-drawer"
            >
            <span class="sr-only">Menu</span>
            <span class="menu-icon" aria-hidden="true">☰</span>
            </button>

            <nav
            id="navigation-drawer"
            class="app-bar__navigation"
            role="navigation"
            aria-label="Main"
            >
            <ul>
                <li><a href="#/home" class="nav-link">Home</a></li>
                <li><a href="#/stories" class="nav-link">Stories</a></li>
                <li id="auth-menu">${authContent}</li>
            </ul>
            <button class="close-menu-btn" aria-label="Close menu">
                <span class="sr-only">Close</span>
                <span aria-hidden="true">✕</span>
            </button>
            </nav>
        </header>
    `;

        if (user.token) {
            this.querySelector('#logout-button')?.addEventListener('click', () => {
                localStorage.removeItem('userName');
                localStorage.removeItem('accessToken');

                NotificationHelper.showToast('You have successfully logged out');
                window.location.hash = '#/login';
            });
        }
    }

    _setupNavActiveToggle() {
        const navLinks = this.querySelectorAll('.app-bar__navigation .nav-link');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                navLinks.forEach(nav => nav.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        const currentHash = window.location.hash || '#/home';
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentHash) {
                link.classList.add('active');
            }
        });
    }

    update() {
        this.render();
        this._setupNavActiveToggle();
    }
}

customElements.define('app-bar', AppBar);
