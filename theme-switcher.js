class ThemeSwitcher {
    constructor() {
        this.currentTheme = localStorage.getItem('cinematch-theme') || 'netflix';
        this.themes = {
            netflix: {
                name: 'Netflix',
                icon: '🎬',
                colors: {
                    '--primary': '#e50914',
                    '--secondary': '#221f1f',
                    '--background': '#141414',
                    '--surface': '#2f2f2f',
                    '--text': '#ffffff',
                    '--text-secondary': '#b3b3b3',
                    '--accent': '#e50914',
                    '--gradient': 'linear-gradient(135deg, #e50914 0%, #831010 100%)'
                }
            },
            disney: {
                name: 'Disney+',
                icon: '✨',
                colors: {
                    '--primary': '#1e3a8a',
                    '--secondary': '#0f172a',
                    '--background': '#020617',
                    '--surface': '#1e293b',
                    '--text': '#f8fafc',
                    '--text-secondary': '#cbd5e1',
                    '--accent': '#3b82f6',
                    '--gradient': 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)'
                }
            },
            hbo: {
                name: 'HBO Max',
                icon: '👑',
                colors: {
                    '--primary': '#7c3aed',
                    '--secondary': '#1f1b24',
                    '--background': '#0f0b14',
                    '--surface': '#2d1b3d',
                    '--text': '#ffffff',
                    '--text-secondary': '#c4b5fd',
                    '--accent': '#a855f7',
                    '--gradient': 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
                }
            }
        };
        this.init();
    }

    init() {
        this.createThemeSwitcher();
        this.applyTheme(this.currentTheme);
    }

    createThemeSwitcher() {
        const switcher = document.createElement('div');
        switcher.className = 'theme-switcher';
        switcher.innerHTML = `
            <button class="theme-toggle" id="theme-toggle">
                <i class="fas fa-palette"></i>
            </button>
            <div class="theme-dropdown" id="theme-dropdown">
                ${Object.entries(this.themes).map(([key, theme]) => `
                    <div class="theme-option ${key === this.currentTheme ? 'active' : ''}" data-theme="${key}">
                        <span class="theme-icon">${theme.icon}</span>
                        <span class="theme-name">${theme.name}</span>
                    </div>
                `).join('')}
            </div>
        `;

        document.body.appendChild(switcher);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const toggle = document.getElementById('theme-toggle');
        const dropdown = document.getElementById('theme-dropdown');
        
        toggle.addEventListener('click', () => {
            dropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-switcher')) {
                dropdown.classList.remove('active');
            }
        });

        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.switchTheme(theme);
                dropdown.classList.remove('active');
            });
        });
    }

    switchTheme(themeName) {
        this.currentTheme = themeName;
        this.applyTheme(themeName);
        localStorage.setItem('cinematch-theme', themeName);
        
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.theme === themeName);
        });
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        const root = document.documentElement;
        
        Object.entries(theme.colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    }
}

// Initialize theme switcher
document.addEventListener('DOMContentLoaded', () => {
    new ThemeSwitcher();
});