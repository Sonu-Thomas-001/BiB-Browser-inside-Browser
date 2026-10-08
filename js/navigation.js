/**
 * BiB (Browser inside Browser) — Navigation Engine
 * Orchestrates page loads, loading bar states, history tracking, and back/forward stacks
 */

class NavigationEngine {
    constructor() {
        this.isLoading = false;
        this.progressTimer = null;
    }

    navigate(rawUrl, pushToHistory = true) {
        if (!window.tabManager) return;

        const activeTab = window.tabManager.getActiveTab();
        if (!activeTab) return;

        const targetUrl = window.searchEngine ? window.searchEngine.normalizeInput(rawUrl) : rawUrl;

        // Cancel previous loading if in progress
        if (this.isLoading) {
            clearTimeout(this.progressTimer);
        }

        this.startLoadingProgress();

        // Simulate network / render latency (300ms - 750ms)
        const loadDuration = 320 + Math.floor(Math.random() * 400);

        this.progressTimer = setTimeout(() => {
            this.completeLoadingProgress();

            // Push to tab's personal back/forward stack
            if (pushToHistory) {
                // If we navigated while in middle of history stack, truncate forward stack
                if (activeTab.historyIndex < activeTab.history.length - 1) {
                    activeTab.history = activeTab.history.slice(0, activeTab.historyIndex + 1);
                }
                activeTab.history.push(targetUrl);
                activeTab.historyIndex = activeTab.history.length - 1;
            }

            activeTab.url = targetUrl;

            // Render page contents
            if (window.browserApp) {
                window.browserApp.renderCurrentTab();
            }

            // Sync global history
            if (window.historyManager) {
                window.historyManager.addEntry({
                    title: activeTab.title,
                    url: activeTab.url,
                    favicon: activeTab.favicon
                });
            }

            // Update UI components
            this.updateAddressBar(activeTab);
            this.updateNavButtons(activeTab);
            this.updateBookmarkStar(activeTab);

            // Tab bar re-render to reflect new title/favicon
            window.tabManager.renderTabs();
        }, loadDuration);
    }

    startLoadingProgress() {
        this.isLoading = true;
        const bar = document.querySelector('.progress-bar');
        if (!bar) return;

        bar.classList.add('is-loading');
        bar.style.width = '0%';

        setTimeout(() => { bar.style.width = '30%'; }, 50);
        setTimeout(() => { if (this.isLoading) bar.style.width = '65%'; }, 180);
        setTimeout(() => { if (this.isLoading) bar.style.width = '88%'; }, 280);
    }

    completeLoadingProgress() {
        this.isLoading = false;
        const bar = document.querySelector('.progress-bar');
        if (!bar) return;

        bar.style.width = '100%';
        setTimeout(() => {
            bar.classList.remove('is-loading');
            bar.style.width = '0%';
        }, 220);
    }

    reload() {
        const activeTab = window.tabManager ? window.tabManager.getActiveTab() : null;
        if (!activeTab) return;

        if (window.notificationManager) {
            window.notificationManager.show('Reloading page...', 'info', '↻', 1500);
        }
        this.navigate(activeTab.url, false);
    }

    back() {
        const activeTab = window.tabManager ? window.tabManager.getActiveTab() : null;
        if (!activeTab || activeTab.historyIndex <= 0) return;

        activeTab.historyIndex--;
        const previousUrl = activeTab.history[activeTab.historyIndex];
        this.navigate(previousUrl, false);
    }

    forward() {
        const activeTab = window.tabManager ? window.tabManager.getActiveTab() : null;
        if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;

        activeTab.historyIndex++;
        const nextUrl = activeTab.history[activeTab.historyIndex];
        this.navigate(nextUrl, false);
    }

    updateAddressBar(tab) {
        const input = document.querySelector('.url-input');
        if (input && tab) {
            input.value = tab.url;
        }

        const secBadge = document.querySelector('.security-badge');
        if (secBadge && tab) {
            if (tab.url.startsWith('bib://')) {
                secBadge.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                    <span>BiB Local</span>
                `;
            } else {
                secBadge.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                    <span>HTTPS</span>
                `;
            }
        }
    }

    updateNavButtons(tab) {
        const btnBack = document.querySelector('.btn-back');
        const btnForward = document.querySelector('.btn-forward');

        if (btnBack) {
            btnBack.disabled = !tab || tab.historyIndex <= 0;
        }
        if (btnForward) {
            btnForward.disabled = !tab || tab.historyIndex >= tab.history.length - 1;
        }
    }

    updateBookmarkStar(tab) {
        if (!window.bookmarksManager || !tab) return;
        const isBookmarked = window.bookmarksManager.isBookmarked(tab.url);
        window.bookmarksManager.updateStarUI(isBookmarked);
    }
}

// Export singleton instance
window.navigationEngine = new NavigationEngine();
