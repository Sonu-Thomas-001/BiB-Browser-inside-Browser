/**
 * BiB 2.0 — Storage Manager (localStorage)
 * Handles lightweight UI preferences, theme, and settings
 */

"use strict";

(function (window) {
    class StorageManager {
        constructor(prefix = "bib_v2_") {
            this.prefix = prefix;
            this.memoryFallback = new Map();
        }

        _key(key) {
            return `${this.prefix}${key}`;
        }

        get(key, defaultValue = null) {
            const fullKey = this._key(key);
            try {
                const item = localStorage.getItem(fullKey);
                if (item === null) return defaultValue;
                return JSON.parse(item);
            } catch (err) {
                console.warn(`[BiB Storage] Read failed for ${fullKey}, using memory fallback`, err);
                return this.memoryFallback.has(fullKey) ? this.memoryFallback.get(fullKey) : defaultValue;
            }
        }

        set(key, value) {
            const fullKey = this._key(key);
            try {
                localStorage.setItem(fullKey, JSON.stringify(value));
                this.memoryFallback.set(fullKey, value);
                return true;
            } catch (err) {
                console.warn(`[BiB Storage] Write failed for ${fullKey}, using memory fallback`, err);
                this.memoryFallback.set(fullKey, value);
                return false;
            }
        }

        remove(key) {
            const fullKey = this._key(key);
            try {
                localStorage.removeItem(fullKey);
                this.memoryFallback.delete(fullKey);
                return true;
            } catch (err) {
                this.memoryFallback.delete(fullKey);
                return false;
            }
        }

        clear() {
            try {
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith(this.prefix)) {
                        keysToRemove.push(k);
                    }
                }
                keysToRemove.forEach(k => localStorage.removeItem(k));
                this.memoryFallback.clear();
                return true;
            } catch (err) {
                this.memoryFallback.clear();
                return false;
            }
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Storage = new StorageManager();
})(window);
