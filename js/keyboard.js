/**
 * BiB 2.0 — Keyboard Shortcuts & Konami Easter Egg
 */

"use strict";

(function (window) {
    class KeyboardManager {
        constructor() {
            this.konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
            this.konamiIndex = 0;
            this.init();
        }

        init() {
            window.addEventListener("keydown", (e) => this.handleKeyDown(e));
        }

        handleKeyDown(e) {
            this.checkKonami(e.key);

            const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
            const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

            // Escape: Dismiss overlays, modals, find bar, command palette
            if (e.key === "Escape") {
                if (window.BiB && window.BiB.Commands && window.BiB.Commands.isOpen) {
                    window.BiB.Commands.closePalette();
                    return;
                }
                if (window.BiB && window.BiB.Tabs && window.BiB.Tabs.closeTabSearch) {
                    window.BiB.Tabs.closeTabSearch();
                }
                window.dispatchEvent(new CustomEvent("bib:close-overlays"));
                return;
            }

            // Command Palette: Ctrl/Cmd + K
            if (ctrlOrCmd && (e.key === "k" || e.key === "K")) {
                e.preventDefault();
                if (window.BiB && window.BiB.Commands) {
                    window.BiB.Commands.togglePalette();
                }
                return;
            }

            // Tab Search: Ctrl/Cmd + Shift + A
            if (ctrlOrCmd && e.shiftKey && (e.key === "a" || e.key === "A")) {
                e.preventDefault();
                if (window.BiB && window.BiB.Tabs && window.BiB.Tabs.openTabSearch) {
                    window.BiB.Tabs.openTabSearch();
                }
                return;
            }

            // Open Local File: Ctrl/Cmd + O
            if (ctrlOrCmd && (e.key === "o" || e.key === "O")) {
                e.preventDefault();
                if (window.BiB && window.BiB.FileViewer) {
                    window.BiB.FileViewer.promptOpen();
                }
                return;
            }

            // Split View: Alt + S
            if (e.altKey && (e.key === "s" || e.key === "S")) {
                e.preventDefault();
                if (window.BiB && window.BiB.SplitView) {
                    window.BiB.SplitView.toggle();
                }
                return;
            }

            // Reader Mode: Alt + R
            if (e.altKey && (e.key === "r" || e.key === "R")) {
                e.preventDefault();
                if (window.BiB && window.BiB.Reader) {
                    window.BiB.Reader.toggle();
                }
                return;
            }

            // New Mini Floating Window: Ctrl/Cmd + Shift + N
            if (ctrlOrCmd && e.shiftKey && (e.key === "n" || e.key === "N")) {
                e.preventDefault();
                if (window.BiB && window.BiB.WindowManager) {
                    window.BiB.WindowManager.createWindow("bib://home", "BiB Window");
                }
                return;
            }

            // Find in Page: Ctrl/Cmd + F
            if (ctrlOrCmd && (e.key === "f" || e.key === "F")) {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("bib:toggle-find"));
                return;
            }

            // Reopen closed tab: Ctrl/Cmd + Shift + T
            if (ctrlOrCmd && e.shiftKey && (e.key === "t" || e.key === "T")) {
                e.preventDefault();
                if (window.BiB && window.BiB.Tabs) {
                    window.BiB.Tabs.reopenClosedTab();
                }
                return;
            }

            // Toggle bookmark bar: Ctrl/Cmd + Shift + B
            if (ctrlOrCmd && e.shiftKey && (e.key === "b" || e.key === "B")) {
                e.preventDefault();
                if (window.BiB && window.BiB.Browser) {
                    window.BiB.Browser.toggleBookmarkBar();
                }
                return;
            }

            // New Tab: Ctrl/Cmd + T
            if (ctrlOrCmd && !e.shiftKey && (e.key === "t" || e.key === "T")) {
                e.preventDefault();
                if (window.BiB && window.BiB.Tabs) {
                    window.BiB.Tabs.createTab("bib://home");
                }
                return;
            }

            // Close Tab: Ctrl/Cmd + W
            if (ctrlOrCmd && (e.key === "w" || e.key === "W")) {
                e.preventDefault();
                if (window.BiB && window.BiB.Tabs && window.BiB.Tabs.activeTabId) {
                    window.BiB.Tabs.closeTab(window.BiB.Tabs.activeTabId);
                }
                return;
            }

            // Focus address bar: Ctrl/Cmd + L
            if (ctrlOrCmd && (e.key === "l" || e.key === "L")) {
                e.preventDefault();
                const urlInput = document.querySelector(".url-input");
                if (urlInput) {
                    urlInput.focus();
                    urlInput.select();
                }
                return;
            }

            // Reload: Ctrl/Cmd + R
            if (ctrlOrCmd && (e.key === "r" || e.key === "R")) {
                e.preventDefault();
                if (window.BiB && window.BiB.Navigation) {
                    window.BiB.Navigation.reload();
                }
                return;
            }

            // Bookmark current page: Ctrl/Cmd + D
            if (ctrlOrCmd && (e.key === "d" || e.key === "D")) {
                e.preventDefault();
                if (window.BiB && window.BiB.Bookmarks && window.BiB.Tabs) {
                    const activeTab = window.BiB.Tabs.getActiveTab();
                    if (activeTab) {
                        window.BiB.Bookmarks.toggleBookmark(activeTab);
                    }
                }
                return;
            }

            // Zoom in / Zoom out / Reset
            if (ctrlOrCmd && (e.key === "=" || e.key === "+")) {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("bib:zoom", { detail: { delta: 10 } }));
                return;
            }
            if (ctrlOrCmd && (e.key === "-" || e.key === "_")) {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("bib:zoom", { detail: { delta: -10 } }));
                return;
            }
            if (ctrlOrCmd && e.key === "0") {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("bib:zoom-reset"));
                return;
            }

            // Back: Alt + Left
            if (e.altKey && e.key === "ArrowLeft") {
                e.preventDefault();
                if (window.BiB && window.BiB.Navigation) {
                    window.BiB.Navigation.back();
                }
                return;
            }

            // Forward: Alt + Right
            if (e.altKey && e.key === "ArrowRight") {
                e.preventDefault();
                if (window.BiB && window.BiB.Navigation) {
                    window.BiB.Navigation.forward();
                }
                return;
            }
        }

        checkKonami(key) {
            const target = this.konamiCode[this.konamiIndex];
            if (key.toLowerCase() === target.toLowerCase()) {
                this.konamiIndex++;
                if (this.konamiIndex === this.konamiCode.length) {
                    this.konamiIndex = 0;
                    this.triggerKonamiEasterEgg();
                }
            } else {
                this.konamiIndex = 0;
            }
        }

        triggerKonamiEasterEgg() {
            if (window.BiB && window.BiB.Notifications) {
                window.BiB.Notifications.show("Konami Code Accepted! Unlocking Secret Chamber...", "success", "game", 4000);
            }
            if (window.BiB && window.BiB.Tabs) {
                window.BiB.Tabs.createTab("bib://secret");
            }
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Keyboard = new KeyboardManager();
})(window);
