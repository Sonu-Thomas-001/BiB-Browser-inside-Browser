/**
 * BiB 2.0 — Downloads Manager
 * Real client-side Blob downloads, export actions, and IndexedDB persistence
 */

"use strict";

(function (window) {
    class DownloadsManager {
        constructor() {
            this.downloads = [];
            this.initPromise = this._init();
        }

        async _init() {
            try {
                this.downloads = await window.BiB.IndexedDB.getAll("downloads");
                // Sort newest first
                this.downloads.sort((a, b) => b.timestamp - a.timestamp);
            } catch (err) {
                console.warn("[BiB Downloads] Could not load downloads", err);
                this.downloads = [];
            }
        }

        async getAll() {
            await this.initPromise;
            return this.downloads;
        }

        async recordDownload(item) {
            await this.initPromise;
            const record = {
                id: item.id || `dl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                filename: item.filename,
                size: item.size || 0,
                url: item.url || "bib://downloads",
                status: item.status || "completed",
                timestamp: Date.now()
            };

            this.downloads.unshift(record);
            await window.BiB.IndexedDB.put("downloads", record);
            window.dispatchEvent(new CustomEvent("bib:downloads-updated"));
            return record;
        }

        async exportFile(data, filename, type = "application/json") {
            const blob = new Blob([typeof data === "string" ? data : JSON.stringify(data, null, 2)], { type });
            window.BiB.Utils.downloadBlob(blob, filename);

            await this.recordDownload({
                filename: filename,
                size: blob.size,
                status: "completed"
            });

            if (window.BiB && window.BiB.Notifications) {
                window.BiB.Notifications.show(`Downloaded ${filename}`, "success", "download");
            }
        }

        async clearAll() {
            this.downloads = [];
            await window.BiB.IndexedDB.clear("downloads");
            window.dispatchEvent(new CustomEvent("bib:downloads-updated"));
            if (window.BiB && window.BiB.Notifications) {
                window.BiB.Notifications.show("Cleared download history", "info", "trash");
            }
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Downloads = new DownloadsManager();
})(window);
