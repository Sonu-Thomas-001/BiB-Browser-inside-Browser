/**
 * BiB (Browser inside Browser) — Theme Manager
 * Manages Dark, Light, Midnight, and Cyber modes
 */

class ThemeManager {
    constructor() {
        this.themes = ['dark', 'light', 'midnight', 'cyber'];
        this.currentTheme = 'dark';
        this.init();
    }

    init() {
        const savedTheme = window.storageManager.get('theme', 'dark');
        this.setTheme(savedTheme, false);
    }

    setTheme(themeName, notify = true) {
        if (!this.themes.includes(themeName)) {
            themeName = 'dark';
        }

        this.currentTheme = themeName;
        document.documentElement.setAttribute('data-theme', themeName);
        window.storageManager.set('theme', themeName);

        // Update any theme indicators in the settings or menus
        document.querySelectorAll('[data-theme-option]').forEach(el => {
            const opt = el.getAttribute('data-theme-option');
            if (opt === themeName) {
                el.classList.add('is-active');
            } else {
                el.classList.remove('is-active');
            }
        });

        // Broadcast custom event
        window.dispatchEvent(new CustomEvent('bib:theme-change', { detail: { theme: themeName } }));

        if (notify && window.notificationManager) {
            const prettyNames = {
                dark: 'Dark Slate',
                light: 'Clean Light',
                midnight: 'Deep Midnight',
                cyber: 'Cyber Neon'
            };
            window.notificationManager.show(`Switched to ${prettyNames[themeName]} theme`, 'theme', '🎨', 2000);
        }
    }

    getTheme() {
        return this.currentTheme;
    }

    cycleTheme() {
        const nextIdx = (this.themes.indexOf(this.currentTheme) + 1) % this.themes.length;
        this.setTheme(this.themes[nextIdx], true);
    }
}

// Export singleton instance
window.themeManager = new ThemeManager();
