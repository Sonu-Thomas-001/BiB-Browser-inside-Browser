/**
 * BiB (Browser inside Browser) — Tab System Manager
 * Manages tab lifecycles, states, animations, pins, and closed tab restoration
 */

class TabManager {
    constructor() {
        this.tabs = [];
        this.activeTabId = null;
        this.closedTabs = [];
        this.tabsContainer = null;
        this.init();
    }

    init() {
        this.tabsContainer = document.querySelector('.tabs-container');
        this.closedTabs = window.storageManager.get('closed_tabs', []);
    }

    createTab(url = 'bib://welcome', activate = true, isPinned = false) {
        const id = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const pageInfo = this.getPageMetadata(url);

        const newTab = {
            id,
            title: pageInfo.title,
            url,
            favicon: pageInfo.favicon,
            history: [url],
            historyIndex: 0,
            bookmarked: false,
            isPinned
        };

        if (isPinned) {
            // Insert pinned tabs at the start
            const lastPinnedIdx = this.tabs.findIndex(t => !t.isPinned);
            if (lastPinnedIdx === -1) {
                this.tabs.push(newTab);
            } else {
                this.tabs.splice(lastPinnedIdx, 0, newTab);
            }
        } else {
            this.tabs.push(newTab);
        }

        this.renderTabs(id);

        if (activate) {
            this.switchTab(id);
        }

        if (window.notificationManager) {
            // Optional micro toast if user duplicated
        }

        return newTab;
    }

    closeTab(id) {
        const index = this.tabs.findIndex(t => t.id === id);
        if (index === -1) return;

        const tabToClose = this.tabs[index];

        // Save into closed tabs stack for Ctrl+Shift+T restore
        this.closedTabs.push({ ...tabToClose });
        if (this.closedTabs.length > 20) this.closedTabs.shift();
        window.storageManager.set('closed_tabs', this.closedTabs);

        // Find DOM element to animate exit
        const tabEl = this.tabsContainer ? this.tabsContainer.querySelector(`[data-tab-id="${id}"]`) : null;
        if (tabEl) {
            tabEl.classList.add('tab-exiting');
        }

        setTimeout(() => {
            this.tabs = this.tabs.filter(t => t.id !== id);

            // If we closed the active tab, switch to adjacent tab
            if (this.activeTabId === id) {
                if (this.tabs.length > 0) {
                    const newActiveIdx = Math.max(0, index - 1);
                    this.switchTab(this.tabs[newActiveIdx].id);
                } else {
                    // Closed last tab: automatically spawn new tab
                    this.createTab('bib://welcome', true);
                    return;
                }
            }

            this.renderTabs();
        }, 180);
    }

    switchTab(id) {
        const tab = this.tabs.find(t => t.id === id);
        if (!tab) return;

        this.activeTabId = id;
        this.renderTabs();

        // Update omnibox and nav buttons
        if (window.navigationEngine) {
            window.navigationEngine.updateAddressBar(tab);
            window.navigationEngine.updateNavButtons(tab);
            window.navigationEngine.updateBookmarkStar(tab);
        }

        // Render current page content
        if (window.browserApp) {
            window.browserApp.renderCurrentTab();
            window.browserApp.updateStatusBar();
        }

        // Ensure active tab is scrolled into view
        if (this.tabsContainer) {
            const activeEl = this.tabsContainer.querySelector(`[data-tab-id="${id}"]`);
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }
        }
    }

    duplicateTab(id) {
        const sourceTab = this.tabs.find(t => t.id === id);
        if (!sourceTab) return;

        const newTab = this.createTab(sourceTab.url, true, false);
        if (window.notificationManager) {
            window.notificationManager.show('Tab duplicated', 'tab', '📋');
        }
        return newTab;
    }

    togglePinTab(id) {
        const tab = this.tabs.find(t => t.id === id);
        if (!tab) return;

        tab.isPinned = !tab.isPinned;
        
        // Re-sort tabs so pinned ones come first
        this.tabs.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
        });

        this.renderTabs();

        if (window.notificationManager) {
            window.notificationManager.show(tab.isPinned ? 'Tab pinned' : 'Tab unpinned', 'tab', '📌');
        }
    }

    closeOtherTabs(id) {
        this.tabs = this.tabs.filter(t => t.id === id || t.isPinned);
        this.switchTab(id);
        this.renderTabs();
    }

    closeTabsToRight(id) {
        const index = this.tabs.findIndex(t => t.id === id);
        if (index === -1) return;

        this.tabs = this.tabs.filter((t, i) => i <= index || t.isPinned);
        this.switchTab(id);
        this.renderTabs();
    }

    reopenClosedTab() {
        if (this.closedTabs.length === 0) {
            if (window.notificationManager) {
                window.notificationManager.show('No recently closed tabs to restore', 'info');
            }
            return;
        }

        const lastClosed = this.closedTabs.pop();
        window.storageManager.set('closed_tabs', this.closedTabs);

        const restored = this.createTab(lastClosed.url, true, lastClosed.isPinned);
        if (window.notificationManager) {
            window.notificationManager.show(`Restored tab: ${restored.title}`, 'tab', '🗂️');
        }
    }

    getActiveTab() {
        return this.tabs.find(t => t.id === this.activeTabId) || this.tabs[0];
    }

    getTab(id) {
        return this.tabs.find(t => t.id === id);
    }

    getPageMetadata(url) {
        if (!url) return { title: 'New Tab', favicon: '🌐' };

        const lower = url.toLowerCase();
        if (lower === 'bib://welcome') return { title: 'BiB Welcome', favicon: '🚀' };
        if (lower === 'bib://home') return { title: 'Home Dashboard', favicon: '🏠' };
        if (lower === 'bib://about') return { title: 'About BiB', favicon: 'ℹ️' };
        if (lower === 'bib://developer') return { title: 'Developer Console', favicon: '⚡' };
        if (lower === 'bib://history') return { title: 'Browsing History', favicon: '📜' };
        if (lower === 'bib://bookmarks') return { title: 'Bookmarks Manager', favicon: '⭐' };
        if (lower === 'bib://settings') return { title: 'Browser Settings', favicon: '⚙️' };
        if (lower === 'bib://downloads') return { title: 'Downloads Manager', favicon: '📥' };
        if (lower === 'bib://games') return { title: 'Arcade Mini Games', favicon: '🎮' };
        if (lower === 'bib://secret') return { title: 'BiB Secret Chamber', favicon: '👾' };
        if (lower === 'bib://404') return { title: '404 - Page Escaped', favicon: '🛸' };
        if (lower.startsWith('bib://search')) return { title: 'BiB Search', favicon: '🔍' };

        // External sites
        if (lower.includes('github.com')) return { title: 'GitHub: Antigravity/BiB', favicon: '🐙' };
        if (lower.includes('google.com')) return { title: 'Google Search', favicon: '🔍' };
        if (lower.includes('example.com')) return { title: 'Example Domain', favicon: '🌐' };
        if (lower.includes('news.local')) return { title: 'BiB Tech News', favicon: '📰' };
        if (lower.includes('social.local')) return { title: 'BiB Social Stream', favicon: '💬' };

        return { title: url.replace(/^https?:\/\//, ''), favicon: '🌐' };
    }

    renderTabs(newTabId = null) {
        if (!this.tabsContainer) return;

        this.tabsContainer.innerHTML = '';

        this.tabs.forEach(tab => {
            const tabEl = document.createElement('div');
            tabEl.className = `tab ${tab.id === this.activeTabId ? 'is-active' : ''} ${tab.isPinned ? 'is-pinned' : ''}`;
            if (newTabId && tab.id === newTabId) {
                tabEl.classList.add('tab-entering');
            }
            tabEl.setAttribute('data-tab-id', tab.id);
            tabEl.setAttribute('title', `${tab.title} (${tab.url})`);

            tabEl.innerHTML = `
                <span class="tab-favicon">${tab.favicon || '🌐'}</span>
                <span class="tab-title">${tab.title}</span>
                <button class="tab-close" aria-label="Close tab" title="Close Tab (Ctrl+W)">✕</button>
            `;

            // Tab switch on click
            tabEl.addEventListener('click', (e) => {
                if (e.target.closest('.tab-close')) return;
                this.switchTab(tab.id);
            });

            // Close button click
            const closeBtn = tabEl.querySelector('.tab-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.closeTab(tab.id);
                });
            }

            this.tabsContainer.appendChild(tabEl);
        });

        // Update status bar tab counter
        if (window.browserApp) {
            window.browserApp.updateStatusBar();
        }
    }
}

// Export singleton instance
window.tabManager = new TabManager();
