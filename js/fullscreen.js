/**
 * BiB 2.0 — Real Fullscreen API Integration
 */

"use strict";

(function (window) {
    class FullscreenManager {
        constructor() {
            this.isFullscreen = false;
            this.init();
        }

        init() {
            document.addEventListener("fullscreenchange", () => {
                this.isFullscreen = !!document.fullscreenElement;
                window.dispatchEvent(new CustomEvent("bib:fullscreen-changed", { detail: { isFullscreen: this.isFullscreen } }));
            });
        }

        async toggle() {
            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                    if (window.BiB && window.BiB.Notifications) {
                        window.BiB.Notifications.show("Entered Fullscreen", "info", "fullscreen", 1500);
                    }
                } else {
                    if (document.exitFullscreen) {
                        await document.exitFullscreen();
                    }
                }
            } catch (err) {
                console.warn("[BiB Fullscreen] API restricted or declined", err);
                if (window.BiB && window.BiB.Notifications) {
                    window.BiB.Notifications.show("Fullscreen not supported in this frame", "warning");
                }
            }
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Fullscreen = new FullscreenManager();
})(window);
