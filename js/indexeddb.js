/**
 * BiB 2.0 — IndexedDB Manager
 * Robust structured client-side storage for history, bookmarks, downloads, and sessions
 */

"use strict";

(function (window) {
    const DB_NAME = "BiB_Database_v2";
    const DB_VERSION = 1;

    class IndexedDBManager {
        constructor() {
            this.db = null;
            this.isReady = false;
            this.readyPromise = this._init();
            this.fallbacks = {
                history: [],
                bookmarks: [],
                downloads: [],
                tabSnapshots: []
            };
        }

        async _init() {
            if (!window.indexedDB) {
                console.warn("[BiB IndexedDB] IndexedDB not available, using in-memory store.");
                return;
            }

            return new Promise((resolve) => {
                const request = window.indexedDB.open(DB_NAME, DB_VERSION);

                request.onupgradeneeded = (e) => {
                    const db = e.target.result;

                    // History store
                    if (!db.objectStoreNames.contains("history")) {
                        const histStore = db.createObjectStore("history", { keyPath: "id" });
                        histStore.createIndex("timestamp", "timestamp", { unique: false });
                        histStore.createIndex("url", "url", { unique: false });
                    }

                    // Bookmarks store
                    if (!db.objectStoreNames.contains("bookmarks")) {
                        const bmStore = db.createObjectStore("bookmarks", { keyPath: "id" });
                        bmStore.createIndex("url", "url", { unique: false });
                    }

                    // Downloads store
                    if (!db.objectStoreNames.contains("downloads")) {
                        const dlStore = db.createObjectStore("downloads", { keyPath: "id" });
                        dlStore.createIndex("timestamp", "timestamp", { unique: false });
                    }

                    // Tab Snapshots store (Session restore)
                    if (!db.objectStoreNames.contains("tabSnapshots")) {
                        const snapStore = db.createObjectStore("tabSnapshots", { keyPath: "id" });
                        snapStore.createIndex("timestamp", "timestamp", { unique: false });
                    }
                };

                request.onsuccess = (e) => {
                    this.db = e.target.result;
                    this.isReady = true;
                    resolve(true);
                };

                request.onerror = (e) => {
                    console.warn("[BiB IndexedDB] Open failed, using memory fallback", e);
                    this.isReady = false;
                    resolve(false);
                };
            });
        }

        async _getStore(storeName, mode = "readonly") {
            await this.readyPromise;
            if (!this.db) return null;
            const tx = this.db.transaction(storeName, mode);
            return tx.objectStore(storeName);
        }

        async put(storeName, item) {
            await this.readyPromise;
            if (!this.db) {
                const list = this.fallbacks[storeName] || [];
                const idx = list.findIndex(i => i.id === item.id);
                if (idx >= 0) list[idx] = item;
                else list.push(item);
                return item.id;
            }

            return new Promise((resolve, reject) => {
                try {
                    const tx = this.db.transaction(storeName, "readwrite");
                    const store = tx.objectStore(storeName);
                    const req = store.put(item);
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => reject(req.error);
                } catch (err) {
                    reject(err);
                }
            });
        }

        async get(storeName, id) {
            await this.readyPromise;
            if (!this.db) {
                const list = this.fallbacks[storeName] || [];
                return list.find(i => i.id === id) || null;
            }

            return new Promise((resolve, reject) => {
                try {
                    const tx = this.db.transaction(storeName, "readonly");
                    const store = tx.objectStore(storeName);
                    const req = store.get(id);
                    req.onsuccess = () => resolve(req.result || null);
                    req.onerror = () => reject(req.error);
                } catch (err) {
                    reject(err);
                }
            });
        }

        async getAll(storeName) {
            await this.readyPromise;
            if (!this.db) {
                return [...(this.fallbacks[storeName] || [])];
            }

            return new Promise((resolve, reject) => {
                try {
                    const tx = this.db.transaction(storeName, "readonly");
                    const store = tx.objectStore(storeName);
                    const req = store.getAll();
                    req.onsuccess = () => resolve(req.result || []);
                    req.onerror = () => reject(req.error);
                } catch (err) {
                    reject(err);
                }
            });
        }

        async delete(storeName, id) {
            await this.readyPromise;
            if (!this.db) {
                if (this.fallbacks[storeName]) {
                    this.fallbacks[storeName] = this.fallbacks[storeName].filter(i => i.id !== id);
                }
                return true;
            }

            return new Promise((resolve, reject) => {
                try {
                    const tx = this.db.transaction(storeName, "readwrite");
                    const store = tx.objectStore(storeName);
                    const req = store.delete(id);
                    req.onsuccess = () => resolve(true);
                    req.onerror = () => reject(req.error);
                } catch (err) {
                    reject(err);
                }
            });
        }

        async clear(storeName) {
            await this.readyPromise;
            if (!this.db) {
                this.fallbacks[storeName] = [];
                return true;
            }

            return new Promise((resolve, reject) => {
                try {
                    const tx = this.db.transaction(storeName, "readwrite");
                    const store = tx.objectStore(storeName);
                    const req = store.clear();
                    req.onsuccess = () => resolve(true);
                    req.onerror = () => reject(req.error);
                } catch (err) {
                    reject(err);
                }
            });
        }

        async count(storeName) {
            await this.readyPromise;
            if (!this.db) {
                return (this.fallbacks[storeName] || []).length;
            }

            return new Promise((resolve, reject) => {
                try {
                    const tx = this.db.transaction(storeName, "readonly");
                    const store = tx.objectStore(storeName);
                    const req = store.count();
                    req.onsuccess = () => resolve(req.result || 0);
                    req.onerror = () => reject(req.error);
                } catch (err) {
                    reject(err);
                }
            });
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.IndexedDB = new IndexedDBManager();
})(window);
