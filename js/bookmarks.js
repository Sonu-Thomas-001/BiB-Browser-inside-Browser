/**
 * BiB (Browser inside Browser) — Bookmarks Manager
 * Manages bookmarks state, address bar star animations, and bookmark bar rendering
 */

class BookmarksManager {
    constructor() {
        this.defaultBookmarks = [
            { id: 'bm_home', title: 'Home', url: 'bib://home', favicon: '🏠' },
            { id: 'bm_welcome', title: 'Welcome', url: 'bib://welcome', favicon: '🚀' },
            { id: 'bm_dev', title: 'Developer', url: 'bib://developer', favicon: '⚡' },
            { id: 'bm_games', title: 'Arcade', url: 'bib://games', favicon: '🎮' },
            { id: 'bm_github', title: 'GitHub', url: 'https://github.com', favicon: '🐙' },
            { id: 'bm_google', title: 'Google', url: 'https://google.com', favicon: '🔍' },
            { id: 'bm_downloads', title: 'Downloads', url: 'bib://downloads', favicon: '📥' }
        ];
        this.bookmarks = [];
        this.init();
    }

    init() {
        this.bookmarks = window.storageManager.get('bookmarks', this.defaultBookmarks);
        this.renderBookmarkBar();
    }

    save() {
        window.storageManager.set('bookmarks', this.bookmarks);
        this.renderBookmarkBar();
        window.dispatchEvent(new CustomEvent('bib:bookmarks-updated'));
    }

    getAll() {
        return this.bookmarks;
    }

    isBookmarked(url) {
        if (!url) return false;
        return this.bookmarks.some(b => b.url.toLowerCase() === url.toLowerCase());
    }

    toggleBookmark(tab) {
        if (!tab || !tab.url) return;

        const starBtn = document.querySelector('.star-btn');
        const url = tab.url;

        if (this.isBookmarked(url)) {
            // Remove
            this.bookmarks = this.bookmarks.filter(b => b.url.toLowerCase() !== url.toLowerCase());
            this.save();
            this.updateStarUI(false);
            if (window.notificationManager) {
                window.notificationManager.show(`Removed "${tab.title || url}" from bookmarks`, 'info', '☆');
            }
        } else {
            // Add
            const newBm = {
                id: `bm_${Date.now()}`,
                title: tab.title || url,
                url: tab.url,
                favicon: tab.favicon || '⭐',
                addedAt: Date.now()
            };
            this.bookmarks.push(newBm);
            this.save();
            this.updateStarUI(true);

            // Animate star pop
            if (starBtn) {
                starBtn.classList.add('star-pop');
                setTimeout(() => starBtn.classList.remove('star-pop'), 500);
            }

            if (window.notificationManager) {
                window.notificationManager.show(`Added "${tab.title || url}" to bookmarks`, 'success', '★');
            }
        }
    }

    addCustomBookmark({ title, url, favicon }) {
        if (!url) return;
        if (this.isBookmarked(url)) {
            if (window.notificationManager) {
                window.notificationManager.show('Page is already bookmarked', 'info');
            }
            return;
        }

        this.bookmarks.push({
            id: `bm_${Date.now()}`,
            title: title || url,
            url: url,
            favicon: favicon || '⭐',
            addedAt: Date.now()
        });
        this.save();

        if (window.notificationManager) {
            window.notificationManager.show(`Bookmarked "${title || url}"`, 'success', '★');
        }
    }

    removeBookmark(url) {
        this.bookmarks = this.bookmarks.filter(b => b.url.toLowerCase() !== url.toLowerCase());
        this.save();
        this.updateStarUI(false);
    }

    updateStarUI(isBookmarked) {
        const starBtn = document.querySelector('.star-btn');
        if (!starBtn) return;

        if (isBookmarked) {
            starBtn.classList.add('is-bookmarked');
            starBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
            `;
            starBtn.setAttribute('title', 'Remove from bookmarks (Ctrl+D)');
        } else {
            starBtn.classList.remove('is-bookmarked');
            starBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            `;
            starBtn.setAttribute('title', 'Bookmark this tab (Ctrl+D)');
        }
    }

    renderBookmarkBar() {
        const bar = document.querySelector('.bookmark-bar');
        if (!bar) return;

        bar.innerHTML = '';
        this.bookmarks.forEach(bm => {
            const item = document.createElement('div');
            item.className = 'bookmark-item';
            item.setAttribute('data-href', bm.url);
            item.setAttribute('title', `${bm.title} — ${bm.url}`);
            item.innerHTML = `
                <span class="bm-favicon">${bm.favicon || '⭐'}</span>
                <span class="bm-title">${bm.title}</span>
            `;
            item.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.navigationEngine) {
                    window.navigationEngine.navigate(bm.url);
                }
            });
            bar.appendChild(item);
        });
    }
}

// Export singleton instance
window.bookmarksManager = new BookmarksManager();
