class AuthManager {
    constructor() {
        this.isSignUp = false;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.init();
    }

    init() {
        this.setupEventListeners();
        if (this.currentUser) {
            window.location.href = 'index.html';
        }
    }

    setupEventListeners() {
        document.getElementById('auth-form').addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (this.isSignUp) {
            if (password !== confirmPassword) {
                this.showError('Passwords do not match');
                return;
            }
            await this.signUp(email, password, name);
        } else {
            await this.signIn(email, password);
        }
    }

    async signUp(email, password, name) {
        const user = {
            id: Date.now().toString(),
            email,
            name,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e50914&color=fff`,
            joinDate: new Date().toISOString(),
            preferences: {
                favoriteGenres: [],
                watchedMovies: [],
                ratings: {},
                lists: {
                    watchlist: [],
                    favorites: [],
                    completed: []
                }
            }
        };

        localStorage.setItem('currentUser', JSON.stringify(user));
        this.showSuccess('Account created successfully!');
        setTimeout(() => window.location.href = 'index.html', 1500);
    }

    async signIn(email, password) {
        // Simulate login - in real app, validate against backend
        const user = {
            id: Date.now().toString(),
            email,
            name: email.split('@')[0],
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=e50914&color=fff`,
            preferences: JSON.parse(localStorage.getItem('userPreferences')) || {
                favoriteGenres: [],
                watchedMovies: [],
                ratings: {},
                lists: {
                    watchlist: JSON.parse(localStorage.getItem('watchlist')) || [],
                    favorites: [],
                    completed: []
                }
            }
        };

        localStorage.setItem('currentUser', JSON.stringify(user));
        this.showSuccess('Welcome back!');
        setTimeout(() => window.location.href = 'index.html', 1500);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            animation: slideIn 0.3s ease-out;
            background: ${type === 'error' ? 'var(--accent-red)' : 'var(--accent-blue)'};
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

function toggleAuthMode() {
    const authManager = new AuthManager();
    authManager.isSignUp = !authManager.isSignUp;
    
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const submitBtn = document.getElementById('auth-submit');
    const switchText = document.getElementById('switch-text');
    const confirmGroup = document.getElementById('confirm-password-group');
    const nameGroup = document.getElementById('name-group');

    if (authManager.isSignUp) {
        title.textContent = 'Create Account';
        subtitle.textContent = 'Join CineFlix today';
        submitBtn.textContent = 'Sign Up';
        switchText.innerHTML = 'Already have an account? <a href="#" onclick="toggleAuthMode()">Sign in</a>';
        confirmGroup.style.display = 'block';
        nameGroup.style.display = 'block';
    } else {
        title.textContent = 'Welcome Back';
        subtitle.textContent = 'Sign in to your account';
        submitBtn.textContent = 'Sign In';
        switchText.innerHTML = 'Don\'t have an account? <a href="#" onclick="toggleAuthMode()">Sign up</a>';
        confirmGroup.style.display = 'none';
        nameGroup.style.display = 'none';
    }
}

function signInWithGoogle() {
    // Simulate Google OAuth
    const user = {
        id: 'google_' + Date.now(),
        email: 'user@gmail.com',
        name: 'Google User',
        avatar: 'https://ui-avatars.com/api/?name=Google+User&background=4285f4&color=fff',
        provider: 'google',
        preferences: {
            favoriteGenres: [],
            watchedMovies: [],
            ratings: {},
            lists: {
                watchlist: JSON.parse(localStorage.getItem('watchlist')) || [],
                favorites: [],
                completed: []
            }
        }
    };
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'index.html';
}

function signInWithFacebook() {
    // Simulate Facebook OAuth
    const user = {
        id: 'facebook_' + Date.now(),
        email: 'user@facebook.com',
        name: 'Facebook User',
        avatar: 'https://ui-avatars.com/api/?name=Facebook+User&background=1877f2&color=fff',
        provider: 'facebook',
        preferences: {
            favoriteGenres: [],
            watchedMovies: [],
            ratings: {},
            lists: {
                watchlist: JSON.parse(localStorage.getItem('watchlist')) || [],
                favorites: [],
                completed: []
            }
        }
    };
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});