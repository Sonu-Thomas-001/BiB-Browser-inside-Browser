/**
 * BiB (Browser inside Browser) — Context Menu Manager
 * Custom context menus for tabs, links, and webpage viewports
 */

class ContextMenuManager {
    constructor() {
        this.menu = null;
        this.currentTarget = null;
        this.init();
    }

    init() {
        this.createMenuElement();
        document.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        document.addEventListener('click', () => this.hide());
        window.addEventListener('bib:close-overlays', () => this.hide());
    }

    createMenuElement() {
        this.menu = document.createElement('div');
        this.menu.className = 'context-menu menu-show';
        document.body.appendChild(this.menu);
    }

    handleContextMenu(e) {
        // Find if target is inside tab, link, or general viewport
        const tabEl = e.target.closest('.tab');
        const linkEl = e.target.closest('a') || e.target.closest('[data-href]');
        const viewportEl = e.target.closest('.viewport');
        const browserWindow = e.target.closest('.browser-window');

        if (!browserWindow) {
            // Right clicking outside the simulated browser: let native menu open
            return;
        }

        e.preventDefault();
        this.currentTarget = { tabEl, linkEl, viewportEl, event: e };

        if (tabEl) {
            this.renderTabMenu(tabEl);
        } else if (linkEl) {
            this.renderLinkMenu(linkEl);
        } else {
            this.renderViewportMenu();
        }

        this.show(e.clientX, e.clientY);
    }

    renderTabMenu(tabEl) {
        const tabId = tabEl.getAttribute('data-tab-id');
        const tab = window.tabManager ? window.tabManager.getTab(tabId) : null;
        const isPinned = tab ? tab.isPinned : false;

        this.menu.innerHTML = `
            <button class="menu-item" data-action="new-tab">
                <span class="menu-left"><span>＋</span> New Tab</span>
                <span class="shortcut">Ctrl+T</span>
            </button>
            <button class="menu-item" data-action="duplicate-tab" data-tab-id="${tabId}">
                <span class="menu-left"><span>📋</span> Duplicate Tab</span>
            </button>
            <button class="menu-item" data-action="reload-tab" data-tab-id="${tabId}">
                <span class="menu-left"><span>↻</span> Reload</span>
                <span class="shortcut">Ctrl+R</span>
            </button>
            <button class="menu-item" data-action="toggle-pin" data-tab-id="${tabId}">
                <span class="menu-left"><span>📌</span> ${isPinned ? 'Unpin Tab' : 'Pin Tab'}</span>
            </button>
            <div class="menu-divider"></div>
            <button class="menu-item" data-action="close-tab" data-tab-id="${tabId}">
                <span class="menu-left"><span>✕</span> Close Tab</span>
                <span class="shortcut">Ctrl+W</span>
            </button>
            <button class="menu-item" data-action="close-others" data-tab-id="${tabId}">
                <span class="menu-left"><span>🧹</span> Close Other Tabs</span>
            </button>
            <button class="menu-item" data-action="close-right" data-tab-id="${tabId}">
                <span class="menu-left"><span>👉</span> Close Tabs to Right</span>
            </button>
        `;
        this.attachMenuListeners();
    }

    renderLinkMenu(linkEl) {
        const href = linkEl.getAttribute('href') || linkEl.getAttribute('data-href');
        this.menu.innerHTML = `
            <button class="menu-item" data-action="open-link" data-url="${href}">
                <span class="menu-left"><span>🔗</span> Open Link</span>
            </button>
            <button class="menu-item" data-action="open-link-new-tab" data-url="${href}">
                <span class="menu-left"><span>↗</span> Open in New Tab</span>
            </button>
            <div class="menu-divider"></div>
            <button class="menu-item" data-action="copy-link" data-url="${href}">
                <span class="menu-left"><span>📄</span> Copy Link Address</span>
            </button>
            <button class="menu-item" data-action="bookmark-link" data-url="${href}">
                <span class="menu-left"><span>⭐</span> Bookmark Link</span>
            </button>
        `;
        this.attachMenuListeners();
    }

    renderViewportMenu() {
        this.menu.innerHTML = `
            <button class="menu-item" data-action="nav-back">
                <span class="menu-left"><span>←</span> Back</span>
                <span class="shortcut">Alt+←</span>
            </button>
            <button class="menu-item" data-action="nav-forward">
                <span class="menu-left"><span>→</span> Forward</span>
                <span class="shortcut">Alt+→</span>
            </button>
            <button class="menu-item" data-action="nav-reload">
                <span class="menu-left"><span>↻</span> Reload</span>
                <span class="shortcut">Ctrl+R</span>
            </button>
            <div class="menu-divider"></div>
            <button class="menu-item" data-action="bookmark-page">
                <span class="menu-left"><span>⭐</span> Bookmark this Page</span>
                <span class="shortcut">Ctrl+D</span>
            </button>
            <button class="menu-item" data-action="view-source">
                <span class="menu-left"><span>📄</span> View Page Source</span>
            </button>
            <button class="menu-item" data-action="inspect">
                <span class="menu-left"><span>🛠️</span> Inspect (DevTools)</span>
            </button>
        `;
        this.attachMenuListeners();
    }

    attachMenuListeners() {
        this.menu.querySelectorAll('.menu-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                const tabId = btn.getAttribute('data-tab-id');
                const url = btn.getAttribute('data-url');
                this.executeAction(action, { tabId, url });
                this.hide();
            });
        });
    }

    executeAction(action, data) {
        if (!window.tabManager || !window.navigationEngine) return;

        switch (action) {
            case 'new-tab':
                window.tabManager.createTab('bib://welcome');
                break;
            case 'duplicate-tab':
                window.tabManager.duplicateTab(data.tabId);
                break;
            case 'reload-tab':
                window.tabManager.switchTab(data.tabId);
                window.navigationEngine.reload();
                break;
            case 'toggle-pin':
                window.tabManager.togglePinTab(data.tabId);
                break;
            case 'close-tab':
                window.tabManager.closeTab(data.tabId);
                break;
            case 'close-others':
                window.tabManager.closeOtherTabs(data.tabId);
                break;
            case 'close-right':
                window.tabManager.closeTabsToRight(data.tabId);
                break;
            case 'open-link':
                if (data.url) window.navigationEngine.navigate(data.url);
                break;
            case 'open-link-new-tab':
                if (data.url) window.tabManager.createTab(data.url);
                break;
            case 'copy-link':
                if (data.url && navigator.clipboard) {
                    navigator.clipboard.writeText(data.url);
                    window.notificationManager.show('Copied link to clipboard', 'info');
                }
                break;
            case 'bookmark-link':
                if (data.url && window.bookmarksManager) {
                    window.bookmarksManager.addCustomBookmark({ title: data.url, url: data.url, favicon: '🔗' });
                }
                break;
            case 'nav-back':
                window.navigationEngine.back();
                break;
            case 'nav-forward':
                window.navigationEngine.forward();
                break;
            case 'nav-reload':
                window.navigationEngine.reload();
                break;
            case 'bookmark-page':
                const activeTab = window.tabManager.getActiveTab();
                if (activeTab && window.bookmarksManager) {
                    window.bookmarksManager.toggleBookmark(activeTab);
                }
                break;
            case 'view-source':
                if (window.browserApp) {
                    window.browserApp.showViewSourceModal();
                }
                break;
            case 'inspect':
                window.tabManager.createTab('bib://developer');
                break;
        }
    }

    show(x, y) {
        this.menu.classList.add('is-visible');
        
        // Prevent menu overflowing outside window bounds
        const menuRect = this.menu.getBoundingClientRect();
        let posX = x;
        let posY = y;

        if (posX + menuRect.width > window.innerWidth) {
            posX = window.innerWidth - menuRect.width - 10;
        }
        if (posY + menuRect.height > window.innerHeight) {
            posY = window.innerHeight - menuRect.height - 10;
        }

        this.menu.style.left = `${posX}px`;
        this.menu.style.top = `${posY}px`;
    }

    hide() {
        if (this.menu) {
            this.menu.classList.remove('is-visible');
        }
    }
}

// Export singleton instance
window.contextMenuManager = new ContextMenuManager();
