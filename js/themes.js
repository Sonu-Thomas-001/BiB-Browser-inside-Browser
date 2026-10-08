/**
 * BiB 2.0 — Theme Manager
 * Apple Light Mode (Default), Dark Mode, and System Appearance matching
 */

"use strict";

(function (window) {
    class ThemeManager {
        constructor() {
            this.themes = ["light", "dark", "system"];
            this.currentTheme = "light";
            this.mediaQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
        }

        init() {
            const savedTheme = window.BiB.Storage.get("theme", "light");
            this.setTheme(savedTheme, false);

            if (this.mediaQuery) {
                this.mediaQuery.addEventListener("change", () => {
                    if (this.currentTheme === "system") {
                        this._applySystemTheme();
                    }
                });
            }
        }

        setTheme(themeName, notify = true) {
            if (!this.themes.includes(themeName)) {
                themeName = "light";
            }

            this.currentTheme = themeName;
            window.BiB.Storage.set("theme", themeName);

            if (themeName === "system") {
                this._applySystemTheme();
            } else {
                document.documentElement.setAttribute("data-theme", themeName);
            }

            // Update UI indicators
            document.querySelectorAll("[data-theme-value]").forEach(el => {
                const val = el.getAttribute("data-theme-value");
                if (val === themeName) {
                    el.classList.add("is-active");
                } else {
                    el.classList.remove("is-active");
                }
            });

            window.dispatchEvent(new CustomEvent("bib:theme-changed", { detail: { theme: themeName } }));

            if (notify && window.BiB && window.BiB.Notifications) {
                const names = { light: "Light Mode", dark: "Dark Mode", system: "System Theme" };
                window.BiB.Notifications.show(`Switched to ${names[themeName]}`, "info", "sun", 1800);
            }
        }

        _applySystemTheme() {
            document.documentElement.setAttribute("data-theme", "system");
        }

        getTheme() {
            return this.currentTheme;
        }

        toggleTheme() {
            const next = this.currentTheme === "light" ? "dark" : "light";
            this.setTheme(next, true);
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Themes = new ThemeManager();
})(window);
