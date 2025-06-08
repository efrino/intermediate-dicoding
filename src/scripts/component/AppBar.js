import { getUserData } from '../utils/index.js';
import { NotificationHelper } from '../utils/notification-helper.js';
import { subscribePushNotification, unsubscribePushNotification } from '../utils/pushHelper.js';

class AppBar extends HTMLElement {
    connectedCallback() {
        this.render();
        this._setupNavActiveToggle();
    }

    render() {
        const user = getUserData();

        const authContent = user.token
            ? `
                <div class="user-info">
                    <span class="user-name">${user.name || 'User'}</span>
                    <button id="logout-button" class="btn btn--text">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
              `
            : `
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

        <!-- Notifikasi Button as nav item -->
        <li>
          <button id="notif-toggle-btn" class="notif-btn" aria-label="Toggle Notifikasi" title="Toggle Notifikasi">
            <i id="notif-icon" class="far fa-bell fa-lg"></i>
          </button>
        </li>

        <li id="auth-menu">${authContent}</li>
      </ul>

      <button class="close-menu-btn" aria-label="Close menu">
        <span class="sr-only">Close</span>
        <span aria-hidden="true">✕</span>
      </button>
    </nav>
  </header>
`;
        // Logout event
        if (user.token) {
            this.querySelector('#logout-button')?.addEventListener('click', () => {
                localStorage.removeItem('userName');
                localStorage.removeItem('accessToken');

                NotificationHelper.showToast('You have successfully logged out');
                window.location.hash = '#/login';
            });
        }

        // Hamburger menu toggle
        const menuToggle = this.querySelector('#hamburger-button');
        const navDrawer = this.querySelector('#navigation-drawer');
        const closeMenuBtn = this.querySelector('.close-menu-btn');

        menuToggle?.addEventListener('click', () => {
            navDrawer?.classList.add('open');
            menuToggle.setAttribute('aria-expanded', 'true');
        });

        closeMenuBtn?.addEventListener('click', () => {
            navDrawer?.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });

        // Tutup menu setelah klik salah satu menu (mobile UX)
        const navLinks = this.querySelectorAll('.app-bar__navigation .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navDrawer?.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Setup notification toggle button logic
        this._setupNotificationToggle();
    }

    _setupNotificationToggle() {
        const notifBtn = this.querySelector('#notif-toggle-btn');
        const notifIcon = this.querySelector('#notif-icon');

        if (!('Notification' in window) || !navigator.serviceWorker) {
            notifBtn.style.display = 'none';
            return;
        }

        const updateButtonState = async () => {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // subscribed → solid bell
                notifIcon.classList.remove('far');
                notifIcon.classList.add('fas');
                notifIcon.title = 'Berlangganan Notifikasi';
                notifBtn.setAttribute('aria-pressed', 'true');
            } else {
                // not subscribed → regular bell
                notifIcon.classList.remove('fas');
                notifIcon.classList.add('far');
                notifIcon.title = 'Berhenti Berlangganan Notifikasi';
                notifBtn.setAttribute('aria-pressed', 'false');
            }
        };

        notifBtn.addEventListener('click', async () => {
            notifBtn.disabled = true; // disable button sementara

            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();

                if (subscription) {
                    // Unsubscribe via helper
                    await unsubscribePushNotification();
                } else {
                    // Subscribe via helper
                    await subscribePushNotification();
                }
                await updateButtonState();
            } catch (error) {
                console.error('❌ Gagal toggle notifikasi:', error);
            } finally {
                notifBtn.disabled = false;
            }
        });

        updateButtonState();
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
