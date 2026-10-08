/**
 * BiB 2.0 — Navigation Engine
 * Omnibox handling, back/forward history stacks, and progress bar animation
 */

"use strict";

(function (window) {
    class NavigationEngine {
        constructor() {
            this.isLoading = false;
            this.timer = null;
        }

        navigate(rawUrl, pushToHistory = true) {
            const tabs = window.BiB.Tabs;
            if (!tabs) return;

            const activeTab = tabs.getActiveTab();
            if (!activeTab) return;

            const targetUrl = window.BiB.Search ? window.BiB.Search.normalizeInput(rawUrl) : rawUrl;

            if (this.isLoading) {
                clearTimeout(this.timer);
            }

            this.startProgress();

            // Realistic loading latency (240ms - 580ms)
            const duration = 240 + Math.floor(Math.random() * 340);

            this.timer = setTimeout(async () => {
                this.completeProgress();

                if (pushToHistory) {
                    if (activeTab.historyIndex < activeTab.history.length - 1) {
                        activeTab.history = activeTab.history.slice(0, activeTab.historyIndex + 1);
                    }
                    activeTab.history.push(targetUrl);
                    activeTab.historyIndex = activeTab.history.length - 1;
                }

                activeTab.url = targetUrl;
                const meta = tabs.getMetadata(targetUrl);
                activeTab.title = meta.title;
                activeTab.favicon = meta.favicon;

                // Sync history store
                if (window.BiB.History && window.BiB.Settings.get("saveHistory")) {
                    await window.BiB.History.addEntry({
                        title: activeTab.title,
                        url: activeTab.url,
                        favicon: activeTab.favicon
                    });
                }

                // Render page content
                if (window.BiB.Browser) {
                    window.BiB.Browser.renderCurrentTab();
                    window.BiB.Browser.updateStatusBar();
                }

                this.syncWithTab(activeTab);
                tabs.renderTabs();
            }, duration);
        }

        startProgress() {
            this.isLoading = true;
            const bar = document.querySelector(".progress-bar");
            if (!bar) return;

            bar.classList.add("is-loading");
            bar.style.width = "0%";

            setTimeout(() => { bar.style.width = "35%"; }, 40);
            setTimeout(() => { if (this.isLoading) bar.style.width = "75%"; }, 160);
        }

        completeProgress() {
            this.isLoading = false;
            const bar = document.querySelector(".progress-bar");
            if (!bar) return;

            bar.style.width = "100%";
            setTimeout(() => {
                bar.classList.remove("is-loading");
                bar.style.width = "0%";
            }, 200);
        }

        reload() {
            const tabs = window.BiB.Tabs;
            if (!tabs) return;
            const active = tabs.getActiveTab();
            if (active) this.navigate(active.url, false);
        }

        back() {
            const tabs = window.BiB.Tabs;
            if (!tabs) return;
            const active = tabs.getActiveTab();
            if (active && active.historyIndex > 0) {
                active.historyIndex--;
                this.navigate(active.history[active.historyIndex], false);
            }
        }

        forward() {
            const tabs = window.BiB.Tabs;
            if (!tabs) return;
            const active = tabs.getActiveTab();
            if (active && active.historyIndex < active.history.length - 1) {
                active.historyIndex++;
                this.navigate(active.history[active.historyIndex], false);
            }
        }

        syncWithTab(tab) {
            if (!tab) return;
            const input = document.querySelector(".url-input");
            const btnBack = document.querySelector(".btn-back");
            const btnForward = document.querySelector(".btn-forward");
            const starBtn = document.querySelector(".star-btn");
            const secBadge = document.querySelector(".security-badge");

            if (input) input.value = tab.url;

            if (btnBack) btnBack.disabled = tab.historyIndex <= 0;
            if (btnForward) btnForward.disabled = tab.historyIndex >= tab.history.length - 1;

            if (starBtn && window.BiB.Bookmarks) {
                const isBookmarked = window.BiB.Bookmarks.isBookmarked(tab.url);
                starBtn.innerHTML = window.BiB.Utils.getIcon(isBookmarked ? "star-filled" : "star");
                starBtn.style.color = isBookmarked ? "var(--color-warning)" : "";
            }

            if (secBadge) {
                const u = window.BiB.Utils;
                secBadge.innerHTML = u.getIcon(tab.url.startsWith("https://") || tab.url.startsWith("bib://") ? "lock" : "info");
            }
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Navigation = new NavigationEngine();
})(window);
