/**
 * BiB 2.0 — Settings Manager
 * Manages user preferences, general options, privacy toggles, and JSON export/import
 */

"use strict";

(function (window) {
    const DEFAULT_SETTINGS = {
        startupPage: "bib://home",
        searchEngine: "BiB Search",
        restoreSession: true,
        showBookmarkBar: true,
        openExternalInNewTab: true,
        showTabPreviews: true,
        confirmCloseMultiple: false,
        saveHistory: true,
        saveBookmarks: true,
        developerMode: true
    };

    class SettingsManager {
        constructor() {
            this.settings = { ...DEFAULT_SETTINGS };
            this.init();
        }

        init() {
            const saved = window.BiB.Storage.get("settings", null);
            if (saved) {
                this.settings = { ...DEFAULT_SETTINGS, ...saved };
            }
        }

        get(key) {
            return this.settings[key] !== undefined ? this.settings[key] : DEFAULT_SETTINGS[key];
        }

        set(key, value) {
            this.settings[key] = value;
            window.BiB.Storage.set("settings", this.settings);
            window.dispatchEvent(new CustomEvent("bib:settings-changed", { detail: { key, value } }));
        }

        getAll() {
            return { ...this.settings };
        }

        async exportSettings() {
            if (window.BiB && window.BiB.Downloads) {
                await window.BiB.Downloads.exportFile(this.settings, "bib-settings.json");
            }
        }

        importSettings(data) {
            if (typeof data !== "object" || data === null) {
                throw new Error("Invalid settings file format.");
            }
            this.settings = { ...DEFAULT_SETTINGS, ...data };
            window.BiB.Storage.set("settings", this.settings);
            window.dispatchEvent(new CustomEvent("bib:settings-changed", { detail: { settings: this.settings } }));
            if (window.BiB && window.BiB.Notifications) {
                window.BiB.Notifications.show("Settings imported successfully", "success", "check");
            }
        }

        resetToDefaults() {
            this.settings = { ...DEFAULT_SETTINGS };
            window.BiB.Storage.set("settings", this.settings);
            window.dispatchEvent(new CustomEvent("bib:settings-changed", { detail: { settings: this.settings } }));
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Settings = new SettingsManager();
})(window);
