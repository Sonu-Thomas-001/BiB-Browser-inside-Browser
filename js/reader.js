/**
 * BiB 3.0 — Reader Mode Controller
 * Distraction-free typography environment with customizable fonts, themes (White, Sepia, Dark, Black), and widths
 */

"use strict";

(function (window) {
    class ReaderModeController {
        constructor() {
            this.prefs = window.BiB.Storage.get("bib_reader_prefs", {
                fontFamily: "sans", // 'sans', 'serif', 'mono'
                fontSize: 18, // px
                width: 720, // px
                theme: "white" // 'white', 'sepia', 'dark', 'black'
            });
        }

        toggle() {
            const activeTab = window.BiB.Tabs ? window.BiB.Tabs.getActiveTab() : null;
            if (!activeTab) return;

            activeTab.isReaderMode = !activeTab.isReaderMode;
            if (window.BiB.Browser) {
                window.BiB.Browser.renderCurrentTab();
            }

            if (window.BiB.Notifications) {
                window.BiB.Notifications.show(
                    activeTab.isReaderMode ? "Reader Mode enabled" : "Reader Mode disabled",
                    "info",
                    "reader"
                );
            }
        }

        setTheme(theme) {
            this.prefs.theme = theme;
            this._saveAndApply();
        }

        setFontFamily(family) {
            this.prefs.fontFamily = family;
            this._saveAndApply();
        }

        setFontSize(delta) {
            this.prefs.fontSize = Math.max(14, Math.min(28, this.prefs.fontSize + delta));
            this._saveAndApply();
        }

        setWidth(width) {
            this.prefs.width = width;
            this._saveAndApply();
        }

        _saveAndApply() {
            if (window.BiB.Storage) {
                window.BiB.Storage.set("bib_reader_prefs", this.prefs);
            }
            const wrapper = document.querySelector(".reader-view-container");
            if (wrapper) {
                wrapper.setAttribute("data-reader-theme", this.prefs.theme);
                wrapper.style.setProperty("--reader-font-size", `${this.prefs.fontSize}px`);
                wrapper.style.setProperty("--reader-max-width", `${this.prefs.width}px`);
                wrapper.setAttribute("data-reader-font", this.prefs.fontFamily);
            }
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Reader = new ReaderModeController();
})(window);
