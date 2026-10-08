/**
 * BiB (Browser inside Browser) — Main Application Entry Point
 * Orchestrates initialization, boots default tabs, and displays welcome experience
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize core browser UI
    if (window.browserApp) {
        window.browserApp.init();
    }

    // 2. Initialize default tabs
    if (window.tabManager) {
        window.tabManager.createTab('bib://welcome', true, false);
        window.tabManager.createTab('bib://home', false, false);
        window.tabManager.createTab('bib://developer', false, false);
    }

    // 3. Welcome notification toast
    setTimeout(() => {
        if (window.notificationManager) {
            window.notificationManager.show('Welcome to BiB — Browser inside Browser 🌀', 'info', '🚀', 3500);
        }
    }, 600);
});

// Global graceful error handling
window.addEventListener('error', (event) => {
    console.warn('[BiB Runtime Notice]', event.message);
});
