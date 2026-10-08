/**
 * BiB (Browser inside Browser) — Storage Manager
 * Clean, safe LocalStorage wrapper with fallback handling
 */

class StorageManager {
    constructor(prefix = 'bib_') {
        this.prefix = prefix;
        this.memoryStore = {};
    }

    _getKey(key) {
        return `${this.prefix}${key}`;
    }

    get(key, defaultValue = null) {
        const fullKey = this._getKey(key);
        try {
            const raw = localStorage.getItem(fullKey);
            if (raw === null) return defaultValue;
            return JSON.parse(raw);
        } catch (err) {
            console.warn(`[BiB Storage] Failed to read ${fullKey}, using fallback`, err);
            return this.memoryStore[fullKey] !== undefined ? this.memoryStore[fullKey] : defaultValue;
        }
    }

    set(key, value) {
        const fullKey = this._getKey(key);
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(fullKey, serialized);
            this.memoryStore[fullKey] = value;
            return true;
        } catch (err) {
            console.warn(`[BiB Storage] Failed to set ${fullKey}, using memory fallback`, err);
            this.memoryStore[fullKey] = value;
            return false;
        }
    }

    remove(key) {
        const fullKey = this._getKey(key);
        try {
            localStorage.removeItem(fullKey);
            delete this.memoryStore[fullKey];
            return true;
        } catch (err) {
            console.warn(`[BiB Storage] Failed to remove ${fullKey}`, err);
            delete this.memoryStore[fullKey];
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
            this.memoryStore = {};
            return true;
        } catch (err) {
            console.warn(`[BiB Storage] Failed to clear storage`, err);
            this.memoryStore = {};
            return false;
        }
    }
}

// Export singleton instance
window.storageManager = new StorageManager();
