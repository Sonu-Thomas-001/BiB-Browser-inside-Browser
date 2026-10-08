/**
 * BiB (Browser inside Browser) — History Manager
 * Tracks visited pages, provides search filtering and persistence
 */

class HistoryManager {
    constructor() {
        this.history = [];
        this.init();
    }

    init() {
        this.history = window.storageManager.get('history', this.getDefaultHistory());
    }

    getDefaultHistory() {
        const now = Date.now();
        return [
            { id: 'h_1', title: 'Welcome to BiB', url: 'bib://welcome', favicon: '🚀', timestamp: now - 1000 * 60 * 3 },
            { id: 'h_2', title: 'BiB Home Dashboard', url: 'bib://home', favicon: '🏠', timestamp: now - 1000 * 60 * 12 },
            { id: 'h_3', title: 'BiB Developer Console', url: 'bib://developer', favicon: '⚡', timestamp: now - 1000 * 60 * 28 },
            { id: 'h_4', title: 'GitHub: Antigravity/BiB', url: 'https://github.com', favicon: '🐙', timestamp: now - 1000 * 60 * 60 * 3 },
            { id: 'h_5', title: 'Arcade Mini Games', url: 'bib://games', favicon: '🎮', timestamp: now - 1000 * 60 * 60 * 24 }
        ];
    }

    save() {
        window.storageManager.set('history', this.history);
        window.dispatchEvent(new CustomEvent('bib:history-updated'));
    }

    addEntry({ title, url, favicon }) {
        if (!url || url === 'about:blank') return;

        // Skip adding the exact same URL consecutively within 3 seconds
        if (this.history.length > 0) {
            const last = this.history[0];
            if (last.url === url && Date.now() - last.timestamp < 3000) {
                return;
            }
        }

        const entry = {
            id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            title: title || url,
            url: url,
            favicon: favicon || '📄',
            timestamp: Date.now()
        };

        // Insert at beginning (newest first)
        this.history.unshift(entry);

        // Limit to 200 items to keep storage lightweight
        if (this.history.length > 200) {
            this.history = this.history.slice(0, 200);
        }

        this.save();
    }

    getAll(filter = '') {
        if (!filter) return this.history;
        const q = filter.toLowerCase().trim();
        return this.history.filter(h => 
            (h.title && h.title.toLowerCase().includes(q)) ||
            (h.url && h.url.toLowerCase().includes(q))
        );
    }

    deleteEntry(id) {
        this.history = this.history.filter(h => h.id !== id);
        this.save();
        if (window.notificationManager) {
            window.notificationManager.show('Removed item from history', 'info');
        }
    }

    clearHistory() {
        this.history = [];
        this.save();
        if (window.notificationManager) {
            window.notificationManager.show('All browsing history cleared', 'success', '🧹');
        }
    }
}

// Export singleton instance
window.historyManager = new HistoryManager();
