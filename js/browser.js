/**
 * BiB 2.0 — Browser Coordinator
 * Coordinates window controls, live clock, battery status, find-in-page, omnibox, and modals
 */

"use strict";

(function (window) {
    class BrowserCoordinator {
        constructor() {
            this.pageContainer = null;
            this.currentZoom = 100;
            this.findMatches = [];
            this.findCurrentIndex = -1;
        }

        init() {
            this.pageContainer = document.querySelector(".page-container");

            this.bindWindowControls();
            this.bindToolbar();
            this.bindOmnibox();
            this.bindMenu();
            this.bindFindInPage();
            this.bindBookmarkBar();
            this.bindNetworkListeners();
            this.bindLinkHover();
            this.startLiveClock();
            this.initBattery();

            // Zoom event listener
            window.addEventListener("bib:zoom", (e) => this.setZoom(this.currentZoom + e.detail.delta));
            window.addEventListener("bib:zoom-reset", () => this.setZoom(100));
            window.addEventListener("bib:toggle-find", () => this.toggleFindBar());
        }

        /* Window Controls */
        bindWindowControls() {
            const btnClose = document.querySelector(".traffic-dot.close");
            const btnMin = document.querySelector(".traffic-dot.minimize");
            const btnMax = document.querySelector(".traffic-dot.maximize");
            const browserWin = document.querySelector(".browser-window");
            const refusalToast = document.querySelector(".close-refusal-toast");
            const restoreDock = document.querySelector(".desktop-restore-dock");

            // Playful close refusal
            if (btnClose) {
                btnClose.addEventListener("click", () => {
                    browserWin.classList.remove("window-shake");
                    void browserWin.offsetWidth;
                    browserWin.classList.add("window-shake");

                    if (refusalToast) {
                        refusalToast.classList.add("is-visible");
                        setTimeout(() => refusalToast.classList.remove("is-visible"), 2600);
                    }
                });
            }

            // Minimize
            if (btnMin) {
                btnMin.addEventListener("click", () => {
                    browserWin.style.display = "none";
                    if (restoreDock) restoreDock.style.display = "flex";
                });
            }

            // Restore from Dock
            if (restoreDock) {
                restoreDock.addEventListener("click", () => {
                    browserWin.style.display = "flex";
                    restoreDock.style.display = "none";
                });
            }

            // Maximize / Real Fullscreen
            if (btnMax) {
                btnMax.addEventListener("click", () => {
                    browserWin.classList.toggle("is-maximized");
                });
            }
        }

        /* Toolbar Controls */
        bindToolbar() {
            const btnBack = document.querySelector(".btn-back");
            const btnForward = document.querySelector(".btn-forward");
            const btnReload = document.querySelector(".btn-reload");
            const btnNewTab = document.querySelector(".new-tab-btn");
            const starBtn = document.querySelector(".star-btn");
            const shareBtn = document.querySelector(".share-btn");
            const readerBtn = document.querySelector(".reader-btn");

            if (btnBack) btnBack.addEventListener("click", () => window.BiB.Navigation.back());
            if (btnForward) btnForward.addEventListener("click", () => window.BiB.Navigation.forward());
            if (btnReload) btnReload.addEventListener("click", () => window.BiB.Navigation.reload());
            if (btnNewTab) btnNewTab.addEventListener("click", () => window.BiB.Tabs.createTab("bib://home"));

            if (starBtn) {
                starBtn.addEventListener("click", () => {
                    const active = window.BiB.Tabs.getActiveTab();
                    if (active && window.BiB.Bookmarks) {
                        window.BiB.Bookmarks.toggleBookmark(active);
                    }
                });
            }

            if (shareBtn) {
                shareBtn.addEventListener("click", () => {
                    const active = window.BiB.Tabs.getActiveTab();
                    if (active && window.BiB.Share) {
                        window.BiB.Share.sharePage(active);
                    }
                });
            }

            if (readerBtn) {
                readerBtn.addEventListener("click", () => {
                    const active = window.BiB.Tabs.getActiveTab();
                    if (active) {
                        window.BiB.Tabs.toggleReaderMode(active.id);
                    }
                });
            }

            const splitBtn = document.querySelector(".split-btn");
            if (splitBtn) {
                splitBtn.addEventListener("click", () => {
                    if (window.BiB && window.BiB.SplitView) {
                        window.BiB.SplitView.toggle();
                    }
                });
            }

            const commandBtn = document.querySelector(".command-btn");
            if (commandBtn) {
                commandBtn.addEventListener("click", () => {
                    if (window.BiB && window.BiB.Commands) {
                        window.BiB.Commands.togglePalette();
                    }
                });
            }
        }

        /* Status Bar Link Hover Preview (Prompt #79, #80) */
        bindLinkHover() {
            const statusPill = document.querySelector("#linkHoverStatus");
            if (!statusPill) return;

            document.addEventListener("mouseover", (e) => {
                const link = e.target.closest("a");
                if (link) {
                    const dest = link.getAttribute("data-url") || link.getAttribute("href");
                    if (dest && dest !== "#") {
                        statusPill.textContent = dest;
                        statusPill.classList.add("is-visible");
                    }
                }
            });

            document.addEventListener("mouseout", (e) => {
                const link = e.target.closest("a");
                if (link) {
                    statusPill.classList.remove("is-visible");
                }
            });
        }

        /* Omnibox Autocomplete Dropdown */
        bindOmnibox() {
            const input = document.querySelector(".url-input");
            const dropdown = document.querySelector(".omnibox-dropdown");
            if (!input || !dropdown) return;

            let selectedIndex = -1;

            input.addEventListener("focus", async () => {
                input.select();
                await this.renderSuggestions(input.value);
            });

            input.addEventListener("input", async () => {
                selectedIndex = -1;
                await this.renderSuggestions(input.value);
            });

            input.addEventListener("keydown", (e) => {
                const items = dropdown.querySelectorAll(".suggestion-item");

                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (items.length > 0) {
                        selectedIndex = (selectedIndex + 1) % items.length;
                        this.highlightSuggestion(items, selectedIndex);
                    }
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    if (items.length > 0) {
                        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                        this.highlightSuggestion(items, selectedIndex);
                    }
                } else if (e.key === "Enter") {
                    dropdown.classList.remove("is-open");
                    if (selectedIndex >= 0 && items[selectedIndex]) {
                        const targetUrl = items[selectedIndex].getAttribute("data-url");
                        window.BiB.Navigation.navigate(targetUrl);
                    } else if (input.value.trim()) {
                        window.BiB.Navigation.navigate(input.value.trim());
                    }
                    input.blur();
                } else if (e.key === "Escape") {
                    dropdown.classList.remove("is-open");
                }
            });

            document.addEventListener("click", (e) => {
                if (!e.target.closest(".omnibox-wrapper")) {
                    dropdown.classList.remove("is-open");
                }
            });
        }

        async renderSuggestions(val) {
            const dropdown = document.querySelector(".omnibox-dropdown");
            if (!dropdown || !window.BiB.Search) return;

            const list = await window.BiB.Search.getSuggestions(val);
            if (list.length === 0) {
                dropdown.classList.remove("is-open");
                return;
            }

            const u = window.BiB.Utils;
            let currentSection = null;
            let html = "";

            list.forEach(item => {
                if (item.section && item.section !== currentSection) {
                    currentSection = item.section;
                    html += `<div class="suggestion-section-title">${currentSection}</div>`;
                }

                html += `
                    <div class="suggestion-item" data-url="${item.url}">
                        <span class="suggestion-icon">${u.getIcon(item.icon || "search")}</span>
                        <span class="suggestion-title">${u.escapeHtml(item.title)}</span>
                        <span class="suggestion-url">${u.escapeHtml(item.url)}</span>
                    </div>
                `;
            });

            dropdown.innerHTML = html;

            dropdown.querySelectorAll(".suggestion-item").forEach(el => {
                el.addEventListener("click", () => {
                    dropdown.classList.remove("is-open");
                    const target = el.getAttribute("data-url");
                    if (target) window.BiB.Navigation.navigate(target);
                });
            });

            dropdown.classList.add("is-open");
        }

        highlightSuggestion(items, index) {
            items.forEach((item, i) => {
                if (i === index) item.classList.add("is-selected");
                else item.classList.remove("is-selected");
            });
        }

        /* Dropdown Menu */
        bindMenu() {
            const menuBtn = document.querySelector(".menu-btn");
            const menu = document.querySelector(".dropdown-menu");
            if (!menuBtn || !menu) return;

            menuBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                menu.classList.toggle("is-open");
            });

            document.addEventListener("click", (e) => {
                if (!e.target.closest(".menu-btn") && !e.target.closest(".dropdown-menu")) {
                    menu.classList.remove("is-open");
                }
            });

            menu.querySelectorAll("[data-menu-action]").forEach(btn => {
                btn.addEventListener("click", () => {
                    const action = btn.getAttribute("data-menu-action");
                    this.executeMenuAction(action);
                    menu.classList.remove("is-open");
                });
            });
        }

        executeMenuAction(action) {
            switch (action) {
                case "new-tab":
                    window.BiB.Tabs.createTab("bib://home");
                    break;
                case "reopen-tab":
                    window.BiB.Tabs.reopenClosedTab();
                    break;
                case "find":
                    this.toggleFindBar();
                    break;
                case "fullscreen":
                    if (window.BiB.Fullscreen) window.BiB.Fullscreen.toggle();
                    break;
                case "print":
                    window.print();
                    break;
                case "history":
                    window.BiB.Navigation.navigate("bib://history");
                    break;
                case "bookmarks":
                    window.BiB.Navigation.navigate("bib://bookmarks");
                    break;
                case "downloads":
                    window.BiB.Navigation.navigate("bib://downloads");
                    break;
                case "devtools":
                    window.BiB.Navigation.navigate("bib://developer");
                    break;
                case "settings":
                    window.BiB.Navigation.navigate("bib://settings");
                    break;
                case "focus-mode":
                    document.querySelector(".browser-window").classList.toggle("is-focus-mode");
                    break;
                case "toggle-theme":
                    if (window.BiB.Themes) window.BiB.Themes.toggleTheme();
                    break;
            }
        }

        /* Find In Page */
        bindFindInPage() {
            const findBar = document.querySelector(".find-bar");
            const input = document.querySelector(".find-input");
            const btnPrev = document.querySelector(".find-prev");
            const btnNext = document.querySelector(".find-next");
            const btnClose = document.querySelector(".find-close");

            if (btnClose && findBar) {
                btnClose.addEventListener("click", () => findBar.classList.remove("is-visible"));
            }

            if (input) {
                input.addEventListener("input", () => this.executeFind(input.value));
                input.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") this.jumpFindMatch(1);
                    if (e.key === "Escape") findBar.classList.remove("is-visible");
                });
            }

            if (btnNext) btnNext.addEventListener("click", () => this.jumpFindMatch(1));
            if (btnPrev) btnPrev.addEventListener("click", () => this.jumpFindMatch(-1));
        }

        toggleFindBar() {
            const findBar = document.querySelector(".find-bar");
            const input = document.querySelector(".find-input");
            if (!findBar || !input) return;

            const isVis = findBar.classList.toggle("is-visible");
            if (isVis) {
                input.focus();
                input.select();
            }
        }

        executeFind(query) {
            const countEl = document.querySelector(".find-count");
            if (!this.pageContainer || !query.trim()) {
                if (countEl) countEl.textContent = "0/0";
                return;
            }

            const text = this.pageContainer.innerText || "";
            const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
            const matches = text.match(regex);
            const count = matches ? matches.length : 0;

            if (countEl) {
                countEl.textContent = count > 0 ? `1/${count}` : "0/0";
            }
        }

        jumpFindMatch(direction) {
            // Find navigator simulation feedback
            if (window.BiB.Notifications) {
                window.BiB.Notifications.show("Scrolled to match", "info", "find", 1200);
            }
        }

        /* Bookmark Bar */
        bindBookmarkBar() {
            const bar = document.querySelector(".bookmark-bar");
            if (!bar) return;

            const show = window.BiB.Settings.get("showBookmarkBar");
            this.toggleBookmarkBar(show);

            window.addEventListener("bib:bookmarks-updated", () => this.renderBookmarkBar());
            this.renderBookmarkBar();
        }

        toggleBookmarkBar(show = null) {
            const bar = document.querySelector(".bookmark-bar");
            if (!bar) return;

            if (show === null) {
                bar.classList.toggle("is-hidden");
            } else {
                if (show) bar.classList.remove("is-hidden");
                else bar.classList.add("is-hidden");
            }
        }

        async renderBookmarkBar() {
            const bar = document.querySelector(".bookmark-bar");
            if (!bar || !window.BiB.Bookmarks) return;

            const bms = await window.BiB.Bookmarks.getAll();
            const u = window.BiB.Utils;
            bar.innerHTML = "";

            bms.forEach(bm => {
                const item = document.createElement("div");
                item.className = "bookmark-item";
                item.innerHTML = `
                    <span>${u.getIcon(bm.favicon || "star")}</span>
                    <span>${u.escapeHtml(bm.title)}</span>
                `;
                item.addEventListener("click", () => {
                    window.BiB.Navigation.navigate(bm.url);
                });
                bar.appendChild(item);
            });
        }

        /* Live Clock & Battery */
        startLiveClock() {
            const clockEl = document.querySelector(".status-clock");
            const update = () => {
                if (clockEl) {
                    clockEl.textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
                }
            };
            update();
            setInterval(update, 1000 * 30);
        }

        async initBattery() {
            const battEl = document.querySelector(".status-battery");
            if (!battEl || !navigator.getBattery) return;

            try {
                const battery = await navigator.getBattery();
                const update = () => {
                    const pct = Math.round(battery.level * 100);
                    battEl.textContent = `${pct}% ${battery.charging ? "⚡" : ""}`;
                };
                update();
                battery.addEventListener("levelchange", update);
                battery.addEventListener("chargingchange", update);
            } catch (e) {
                // Ignore unsupported
            }
        }

        bindNetworkListeners() {
            const pill = document.querySelector(".status-network-pill");
            const update = () => {
                if (pill) {
                    if (navigator.onLine) {
                        pill.classList.remove("offline");
                        pill.querySelector(".status-net-text").textContent = "Online";
                    } else {
                        pill.classList.add("offline");
                        pill.querySelector(".status-net-text").textContent = "Offline";
                    }
                }
            };

            window.addEventListener("online", update);
            window.addEventListener("offline", update);
            update();
        }

        setZoom(val) {
            this.currentZoom = Math.min(150, Math.max(70, val));
            if (this.pageContainer) {
                this.pageContainer.style.zoom = `${this.currentZoom}%`;
            }
            this.updateStatusBar();
        }

        updateStatusBar() {
            const zoomEl = document.querySelector(".status-zoom");
            const tabCountEl = document.querySelector(".status-tabs-count");

            if (zoomEl) zoomEl.textContent = `${this.currentZoom}%`;
            if (tabCountEl && window.BiB.Tabs) {
                const total = window.BiB.Tabs.tabs.length;
                const activeIdx = window.BiB.Tabs.tabs.findIndex(t => t.id === window.BiB.Tabs.activeTabId) + 1;
                tabCountEl.textContent = `Tab ${activeIdx || 1} of ${total}`;
            }
        }

        renderCurrentTab() {
            const active = window.BiB.Tabs ? window.BiB.Tabs.getActiveTab() : null;
            if (active && window.BiB.Renderer && this.pageContainer) {
                window.BiB.Renderer.render(active, this.pageContainer);
            }
        }

        showViewSource() {
            const active = window.BiB.Tabs ? window.BiB.Tabs.getActiveTab() : null;
            const content = this.pageContainer ? this.pageContainer.innerHTML : "";
            const escaped = window.BiB.Utils.escapeHtml(content);

            const modal = document.querySelector(".modal-backdrop");
            if (!modal) return;

            modal.querySelector(".modal-title").textContent = `View Source: ${active ? active.url : ""}`;
            modal.querySelector(".modal-body").innerHTML = `
                <pre style="background:var(--color-surface-secondary);padding:14px;border-radius:var(--radius-sm);overflow-x:auto;font-family:var(--font-mono);font-size:12px;color:var(--color-text);">${escaped}</pre>
            `;
            modal.querySelector(".modal-footer").innerHTML = `
                <button class="btn btn-secondary" id="modalCopySourceBtn">Copy</button>
                <button class="btn btn-primary" onclick="document.querySelector('.modal-backdrop').classList.remove('is-open')">Done</button>
            `;

            const copyBtn = modal.querySelector("#modalCopySourceBtn");
            if (copyBtn) {
                copyBtn.addEventListener("click", () => {
                    window.BiB.Utils.copyToClipboard(content);
                    if (window.BiB.Notifications) window.BiB.Notifications.show("Source copied", "success", "copy");
                });
            }

            modal.classList.add("is-open");
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Browser = new BrowserCoordinator();
})(window);
