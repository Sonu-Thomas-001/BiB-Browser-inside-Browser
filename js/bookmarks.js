/**
 * BiB 2.0 — Bookmarks Manager
 * IndexedDB backed bookmarks, star animations, bookmark bar, and export/import
 */

"use strict";

(function (window) {
    class BookmarksManager {
        constructor() {
            this.bookmarks = [];
            this.initPromise = this._init();
        }

        async _init() {
            try {
                this.bookmarks = await window.BiB.IndexedDB.getAll("bookmarks");
                if (this.bookmarks.length === 0) {
                    const defaultBookmarks = [
                        { id: "bm_1", title: "Start Page", url: "bib://home", favicon: "home", category: "Core" },
                        { id: "bm_2", title: "Developer Tools", url: "bib://developer", favicon: "terminal", category: "Dev" },
                        { id: "bm_3", title: "Arcade Games", url: "bib://games", favicon: "game", category: "Fun" },
                        { id: "bm_4", title: "GitHub", url: "https://github.com", favicon: "external-link", category: "Web" },
                        { id: "bm_5", title: "Example Domain", url: "https://example.com", favicon: "external-link", category: "Web" }
                    ];
                    for (const bm of defaultBookmarks) {
                        await window.BiB.IndexedDB.put("bookmarks", bm);
                    }
                    this.bookmarks = defaultBookmarks;
                }
            } catch (err) {
                console.warn("[BiB Bookmarks] Init error", err);
            }
        }

        async getAll() {
            await this.initPromise;
            return this.bookmarks;
        }

        isBookmarked(url) {
            if (!url) return false;
            return this.bookmarks.some(b => b.url.toLowerCase() === url.toLowerCase());
        }

        async toggleBookmark(tab) {
            await this.initPromise;
            if (!tab || !tab.url) return;

            const url = tab.url;
            if (this.isBookmarked(url)) {
                await this.removeBookmark(url);
                if (window.BiB && window.BiB.Notifications) {
                    window.BiB.Notifications.show(`Removed from bookmarks`, "info", "trash");
                }
            } else {
                const newBm = {
                    id: `bm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                    title: tab.title || url,
                    url: tab.url,
                    favicon: tab.favicon || "star",
                    category: "General",
                    addedAt: Date.now()
                };
                this.bookmarks.push(newBm);
                await window.BiB.IndexedDB.put("bookmarks", newBm);
                window.dispatchEvent(new CustomEvent("bib:bookmarks-updated"));

                if (window.BiB && window.BiB.Notifications) {
                    window.BiB.Notifications.show(`Added "${newBm.title}" to bookmarks`, "success", "star-filled");
                }
            }
        }

        async removeBookmark(url) {
            await this.initPromise;
            const target = this.bookmarks.find(b => b.url.toLowerCase() === url.toLowerCase());
            if (target) {
                this.bookmarks = this.bookmarks.filter(b => b.id !== target.id);
                await window.BiB.IndexedDB.delete("bookmarks", target.id);
                window.dispatchEvent(new CustomEvent("bib:bookmarks-updated"));
            }
        }

        async exportBookmarks() {
            await this.initPromise;
            if (window.BiB && window.BiB.Downloads) {
                await window.BiB.Downloads.exportFile(this.bookmarks, "bib-bookmarks.json");
            }
        }

        async importBookmarks(data) {
            await this.initPromise;
            if (!Array.isArray(data)) {
                throw new Error("Invalid format: expected JSON array of bookmarks.");
            }

            let importedCount = 0;
            for (const item of data) {
                if (item.url && item.title) {
                    const cleanItem = {
                        id: item.id || `bm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                        title: item.title,
                        url: item.url,
                        favicon: item.favicon || "star",
                        category: item.category || "General",
                        addedAt: item.addedAt || Date.now()
                    };
                    await window.BiB.IndexedDB.put("bookmarks", cleanItem);
                    if (!this.bookmarks.some(b => b.url.toLowerCase() === cleanItem.url.toLowerCase())) {
                        this.bookmarks.push(cleanItem);
                        importedCount++;
                    }
                }
            }

            window.dispatchEvent(new CustomEvent("bib:bookmarks-updated"));

            if (window.BiB && window.BiB.Notifications) {
                window.BiB.Notifications.show(`Imported ${importedCount} bookmarks`, "success", "check");
            }
            return importedCount;
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Bookmarks = new BookmarksManager();
})(window);
