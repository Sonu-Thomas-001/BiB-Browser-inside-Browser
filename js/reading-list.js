/**
 * BiB 3.0 — Reading List Manager
 * Save pages for offline reading, mark read/unread, and persist in IndexedDB
 */

"use strict";

(function (window) {
    class ReadingListManager {
        constructor() {
            this.items = [];
            this.isReady = this._init();
        }

        async _init() {
            if (window.BiB && window.BiB.IndexedDB) {
                try {
                    this.items = await window.BiB.IndexedDB.getAll("readingList");
                } catch (e) {
                    this.items = window.BiB.Storage.get("bib_reading_list", []);
                }
            } else {
                this.items = window.BiB.Storage ? window.BiB.Storage.get("bib_reading_list", []) : [];
            }
        }

        async addCurrentPage() {
            await this.isReady;
            const currentTab = window.BiB.Tabs ? window.BiB.Tabs.getActiveTab() : null;
            if (!currentTab) return;

            const existing = this.items.find(i => i.url === currentTab.url);
            if (existing) {
                if (window.BiB.Notifications) {
                    window.BiB.Notifications.show("Already in Reading List", "info", "reading-list");
                }
                return;
            }

            const item = {
                id: `rl_${Date.now()}`,
                title: currentTab.title,
                url: currentTab.url,
                favicon: currentTab.favicon || "reading-list",
                timestamp: Date.now(),
                isRead: false
            };

            this.items.unshift(item);
            await this._persist();

            if (window.BiB.Notifications) {
                window.BiB.Notifications.show(`Added to Reading List: ${item.title}`, "success", "reading-list");
            }
        }

        async toggleRead(id) {
            await this.isReady;
            const item = this.items.find(i => i.id === id);
            if (!item) return;

            item.isRead = !item.isRead;
            await this._persist();
        }

        async remove(id) {
            await this.isReady;
            this.items = this.items.filter(i => i.id !== id);
            if (window.BiB.IndexedDB) {
                try { await window.BiB.IndexedDB.delete("readingList", id); } catch (e) {}
            }
            if (window.BiB.Storage) {
                window.BiB.Storage.set("bib_reading_list", this.items);
            }
        }

        async getAll() {
            await this.isReady;
            return [...this.items];
        }

        async _persist() {
            if (window.BiB.Storage) {
                window.BiB.Storage.set("bib_reading_list", this.items);
            }
            if (window.BiB.IndexedDB) {
                try {
                    for (const item of this.items) {
                        await window.BiB.IndexedDB.put("readingList", item);
                    }
                } catch (e) {}
            }
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.ReadingList = new ReadingListManager();
})(window);
