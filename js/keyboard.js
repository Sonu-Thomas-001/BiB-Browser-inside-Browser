/**
 * BiB (Browser inside Browser) — Keyboard Shortcuts Manager
 * Intercepts shortcuts for simulated browser actions & Easter eggs
 */

class KeyboardManager {
    constructor() {
        this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        this.konamiProgress = 0;
        this.init();
    }

    init() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    handleKeyDown(e) {
        // Handle Konami code detection
        this.checkKonami(e.key);

        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

        // Escape: Close dropdowns, context menus, modals
        if (e.key === 'Escape') {
            window.dispatchEvent(new CustomEvent('bib:close-overlays'));
            return;
        }

        // Ctrl/Cmd + Shift + T: Reopen closed tab
        if (ctrlOrCmd && e.shiftKey && (e.key === 'T' || e.key === 't')) {
            e.preventDefault();
            if (window.tabManager) {
                window.tabManager.reopenClosedTab();
            }
            return;
        }

        // Ctrl/Cmd + Shift + B: Toggle bookmark bar
        if (ctrlOrCmd && e.shiftKey && (e.key === 'B' || e.key === 'b')) {
            e.preventDefault();
            if (window.browserApp) {
                window.browserApp.toggleBookmarkBar();
            }
            return;
        }

        // Ctrl/Cmd + T: New tab
        if (ctrlOrCmd && !e.shiftKey && (e.key === 't' || e.key === 'T')) {
            e.preventDefault();
            if (window.tabManager) {
                window.tabManager.createTab('bib://welcome');
            }
            return;
        }

        // Ctrl/Cmd + W: Close active tab
        if (ctrlOrCmd && (e.key === 'w' || e.key === 'W')) {
            e.preventDefault();
            if (window.tabManager && window.tabManager.activeTabId) {
                window.tabManager.closeTab(window.tabManager.activeTabId);
            }
            return;
        }

        // Ctrl/Cmd + L: Focus address bar
        if (ctrlOrCmd && (e.key === 'l' || e.key === 'L')) {
            e.preventDefault();
            const urlInput = document.querySelector('.url-input');
            if (urlInput) {
                urlInput.focus();
                urlInput.select();
            }
            return;
        }

        // Ctrl/Cmd + R: Reload active tab
        if (ctrlOrCmd && (e.key === 'r' || e.key === 'R')) {
            e.preventDefault();
            if (window.navigationEngine) {
                window.navigationEngine.reload();
            }
            return;
        }

        // Ctrl/Cmd + D: Bookmark current page
        if (ctrlOrCmd && (e.key === 'd' || e.key === 'D')) {
            e.preventDefault();
            if (window.bookmarksManager && window.tabManager) {
                const activeTab = window.tabManager.getActiveTab();
                if (activeTab) {
                    window.bookmarksManager.toggleBookmark(activeTab);
                }
            }
            return;
        }

        // Alt + ArrowLeft: Navigate back
        if (e.altKey && e.key === 'ArrowLeft') {
            e.preventDefault();
            if (window.navigationEngine) {
                window.navigationEngine.back();
            }
            return;
        }

        // Alt + ArrowRight: Navigate forward
        if (e.altKey && e.key === 'ArrowRight') {
            e.preventDefault();
            if (window.navigationEngine) {
                window.navigationEngine.forward();
            }
            return;
        }
    }

    checkKonami(key) {
        const expected = this.konamiCode[this.konamiProgress];
        if (key.toLowerCase() === expected.toLowerCase()) {
            this.konamiProgress++;
            if (this.konamiProgress === this.konamiCode.length) {
                this.konamiProgress = 0;
                this.triggerEasterEgg();
            }
        } else {
            this.konamiProgress = 0;
        }
    }

    triggerEasterEgg() {
        if (window.notificationManager) {
            window.notificationManager.show('🎮 Konami Code Activated! Welcome to Cyber Mode & Secret Vault!', 'success', '👾', 4000);
        }
        if (window.themeManager) {
            window.themeManager.setTheme('cyber');
        }
        if (window.tabManager) {
            window.tabManager.createTab('bib://secret');
        }
    }
}

// Export singleton instance
window.keyboardManager = new KeyboardManager();
