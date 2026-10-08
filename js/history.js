/**
 * BiB 2.0 — History Manager
 * IndexedDB backed browsing history, search filtering, export and import
 */

"use strict";

(function (window) {
    class HistoryManager {
        constructor() {
            this.history = [];
            this.initPromise = this._init();
        }

        async _init() {
            try {
                this.history = await window.BiB.IndexedDB.getAll("history");
                if (this.history.length === 0) {
                    // Seed initial history
                    const now = Date.now();
                    const seed = [
                        { id: "h_1", title: "Welcome to BiB", url: "bib://welcome", favicon: "logo", timestamp: now - 180000 },
                        { id: "h_2", title: "BiB Start Page", url: "bib://home", favicon: "home", timestamp: now - 360000 },
                        { id: "h_3", title: "Developer Tools", url: "bib://developer", favicon: "terminal", timestamp: now - 900000 }
                    ];
                    for (const item of seed) {
                        await window.BiB.IndexedDB.put("history", item);
                    }
                    this.history = seed;
                }
                this.history.sort((a, b) => b.timestamp - a.timestamp);
            } catch (err) {
                console.warn("[BiB History] Init failed", err);
            }
        }

        async addEntry({ title, url, favicon }) {
            await this.initPromise;
            if (!url || url === "about:blank") return;

            // Debounce successive duplicate entries within 2s
            if (this.history.length > 0) {
                const latest = this.history[0];
                if (latest.url === url && Date.now() - latest.timestamp < 2000) {
                    return;
                }
            }

            const entry = {
                id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                title: title || url,
                url: url,
                favicon: favicon || "search",
                timestamp: Date.now()
            };

            this.history.unshift(entry);
            if (this.history.length > 500) this.history.pop();

            await window.BiB.IndexedDB.put("history", entry);
            window.dispatchEvent(new CustomEvent("bib:history-updated"));
        }

        async getAll(filter = "") {
            await this.initPromise;
            if (!filter) return this.history;
            const q = filter.toLowerCase().trim();
            return this.history.filter(h =>
                (h.title && h.title.toLowerCase().includes(q)) ||
                (h.url && h.url.toLowerCase().includes(q))
            );
        }

        async deleteEntry(id) {
            await this.initPromise;
            this.history = this.history.filter(h => h.id !== id);
            await window.BiB.IndexedDB.delete("history", id);
            window.dispatchEvent(new CustomEvent("bib:history-updated"));
            if (window.BiB && window.BiB.Notifications) {
                window.BiB.Notifications.show("History entry removed", "info", "trash");
            }
        }

        async clearAll() {
            await this.initPromise;
            this.history = [];
            await window.BiB.IndexedDB.clear("history");
            window.dispatchEvent(new CustomEvent("bib:history-updated"));
            if (window.BiB && window.BiB.Notifications) {
                window.BiB.Notifications.show("Browsing history cleared", "success", "trash");
            }
        }

        async exportHistory() {
            await this.initPromise;
            if (window.BiB && window.BiB.Downloads) {
                await window.BiB.Downloads.exportFile(this.history, "bib-history.json");
            }
        }

        async importHistory(data) {
            await this.initPromise;
            if (!Array.isArray(data)) {
                throw new Error("Invalid format: expected JSON array of history entries.");
            }

            let importedCount = 0;
            for (const item of data) {
                if (item.url && item.timestamp) {
                    const cleanItem = {
                        id: item.id || `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                        title: item.title || item.url,
                        url: item.url,
                        favicon: item.favicon || "search",
                        timestamp: Number(item.timestamp) || Date.now()
                    };
                    await window.BiB.IndexedDB.put("history", cleanItem);
                    this.history.push(cleanItem);
                    importedCount++;
                }
            }

            this.history.sort((a, b) => b.timestamp - a.timestamp);
            window.dispatchEvent(new CustomEvent("bib:history-updated"));

            if (window.BiB && window.BiB.Notifications) {
                window.BiB.Notifications.show(`Imported ${importedCount} history records`, "success", "check");
            }
            return importedCount;
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.History = new HistoryManager();
})(window);
