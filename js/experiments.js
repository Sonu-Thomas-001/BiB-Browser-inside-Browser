/**
 * BiB 3.0 — Feature Flags & Browser Experiments Manager
 * Clean, centralized experimental switches persisted in localStorage
 */

"use strict";

(function (window) {
    const DEFAULT_FLAGS = {
        glassToolbar: { title: "Liquid Glass Toolbar", desc: "Translucent backdrop-filter styling on navigation chrome", enabled: true },
        dynamicBackground: { title: "Ambient Background Glow", desc: "Subtle, imperceptible blurred lighting forms on Start Page", enabled: true },
        tabPreviews: { title: "Hover Tab Snapshots", desc: "Show floating card snapshots when hovering over tabs", enabled: true },
        splitView: { title: "Multi-Pane Split View", desc: "Browse two pages side-by-side with draggable divider", enabled: true },
        commandPalette: { title: "Quick Command Palette (⌘K)", desc: "Spotlight-style global command search and shortcut hub", enabled: true },
        miniWindows: { title: "Floating Mini-Windows (PiP)", desc: "Internal draggable and resizable browser window simulation", enabled: true },
        webglExperiment: { title: "WebGL GPU Acceleration", desc: "Canvas shader demo on diagnostics and internal pages", enabled: true }
    };

    class FeatureFlagsManager {
        constructor() {
            this.flags = window.BiB.Storage.get("bib_feature_flags", {});
            // Merge defaults
            for (const [key, val] of Object.entries(DEFAULT_FLAGS)) {
                if (this.flags[key] === undefined) {
                    this.flags[key] = val.enabled;
                }
            }
        }

        isEnabled(key) {
            return !!this.flags[key];
        }

        set(key, value) {
            this.flags[key] = !!value;
            window.BiB.Storage.set("bib_feature_flags", this.flags);
        }

        getAll() {
            return Object.keys(DEFAULT_FLAGS).map(key => ({
                id: key,
                title: DEFAULT_FLAGS[key].title,
                desc: DEFAULT_FLAGS[key].desc,
                enabled: this.flags[key] !== undefined ? this.flags[key] : DEFAULT_FLAGS[key].enabled
            }));
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.FeatureFlags = new FeatureFlagsManager();
})(window);
