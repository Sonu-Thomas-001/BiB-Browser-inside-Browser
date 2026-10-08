/**
 * BiB 2.0 — Tab System Manager
 * HTML5 Drag-and-Drop reordering, Tab Groups, Pinning, and Hover Previews
 */

"use strict";

(function (window) {
    class TabManager {
        constructor() {
            this.tabs = [];
            this.activeTabId = null;
            this.closedTabs = [];
            this.tabContainer = null;
            this.draggedTabId = null;
            this.previewEl = null;
        }

        init(containerEl) {
            this.tabContainer = containerEl;
            this.previewEl = document.querySelector(".tab-hover-preview");
            this.closedTabs = window.BiB.Storage.get("closed_tabs", []);
        }

        createTab(url = "bib://home", activate = true, isPinned = false, group = null) {
            const id = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            const meta = this.getMetadata(url);

            const tab = {
                id,
                title: meta.title,
                url,
                favicon: meta.favicon,
                history: [url],
                historyIndex: 0,
                isPinned,
                isReaderMode: false,
                group
            };

            if (isPinned) {
                const firstUnpinned = this.tabs.findIndex(t => !t.isPinned);
                if (firstUnpinned === -1) this.tabs.push(tab);
                else this.tabs.splice(firstUnpinned, 0, tab);
            } else {
                this.tabs.push(tab);
            }

            this.renderTabs(id);

            if (activate) {
                this.switchTab(id);
            }

            return tab;
        }

        closeTab(id) {
            const index = this.tabs.findIndex(t => t.id === id);
            if (index === -1) return;

            const closed = this.tabs[index];
            this.closedTabs.push({ ...closed });
            if (this.closedTabs.length > 20) this.closedTabs.shift();
            window.BiB.Storage.set("closed_tabs", this.closedTabs);

            const tabEl = this.tabContainer.querySelector(`[data-tab-id="${id}"]`);
            if (tabEl) tabEl.classList.add("tab-exiting");

            setTimeout(() => {
                this.tabs = this.tabs.filter(t => t.id !== id);

                if (this.activeTabId === id) {
                    if (this.tabs.length > 0) {
                        const nextIdx = Math.max(0, index - 1);
                        this.switchTab(this.tabs[nextIdx].id);
                    } else {
                        // Recreate start page if last tab closed
                        this.createTab("bib://home", true);
                        return;
                    }
                }

                this.renderTabs();
            }, 140);
        }

        switchTab(id) {
            const target = this.tabs.find(t => t.id === id);
            if (!target) return;

            this.activeTabId = id;
            this.renderTabs();

            if (window.BiB && window.BiB.Navigation) {
                window.BiB.Navigation.syncWithTab(target);
            }

            if (window.BiB && window.BiB.Browser) {
                window.BiB.Browser.renderCurrentTab();
            }
        }

        duplicateTab(id) {
            const src = this.tabs.find(t => t.id === id);
            if (!src) return;
            return this.createTab(src.url, true, false, src.group);
        }

        togglePin(id) {
            const tab = this.tabs.find(t => t.id === id);
            if (!tab) return;

            tab.isPinned = !tab.isPinned;
            this.tabs.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return 0;
            });

            this.renderTabs();
        }

        closeOthers(id) {
            this.tabs = this.tabs.filter(t => t.id === id || t.isPinned);
            this.switchTab(id);
        }

        closeRight(id) {
            const idx = this.tabs.findIndex(t => t.id === id);
            if (idx === -1) return;
            this.tabs = this.tabs.filter((t, i) => i <= idx || t.isPinned);
            this.switchTab(id);
        }

        reopenClosedTab() {
            if (this.closedTabs.length === 0) {
                if (window.BiB && window.BiB.Notifications) {
                    window.BiB.Notifications.show("No closed tabs to restore", "info");
                }
                return;
            }

            const last = this.closedTabs.pop();
            window.BiB.Storage.set("closed_tabs", this.closedTabs);
            const restored = this.createTab(last.url, true, last.isPinned, last.group);
            if (window.BiB && window.BiB.Notifications) {
                window.BiB.Notifications.show(`Restored tab: ${restored.title}`, "info", "plus");
            }
        }

        toggleReaderMode(id) {
            const tab = this.tabs.find(t => t.id === id);
            if (!tab) return;
            tab.isReaderMode = !tab.isReaderMode;
            if (window.BiB && window.BiB.Browser) {
                window.BiB.Browser.renderCurrentTab();
            }
        }

        setGroup(id, groupName) {
            const tab = this.tabs.find(t => t.id === id);
            if (!tab) return;
            tab.group = groupName;
            this.renderTabs();
        }

        getActiveTab() {
            return this.tabs.find(t => t.id === this.activeTabId) || this.tabs[0];
        }

        getTab(id) {
            return this.tabs.find(t => t.id === id);
        }

        getMetadata(url) {
            if (!url) return { title: "New Tab", favicon: "search" };
            const lower = url.toLowerCase();

            if (lower === "bib://home") return { title: "Start Page", favicon: "search" };
            if (lower === "bib://welcome") return { title: "Welcome Tour", favicon: "info" };
            if (lower === "bib://about") return { title: "About BiB", favicon: "info" };
            if (lower === "bib://developer") return { title: "Developer Tools", favicon: "terminal" };
            if (lower === "bib://history") return { title: "History", favicon: "history" };
            if (lower === "bib://bookmarks") return { title: "Bookmarks", favicon: "star" };
            if (lower === "bib://settings") return { title: "Settings", favicon: "settings" };
            if (lower === "bib://downloads") return { title: "Downloads", favicon: "download" };
            if (lower === "bib://games") return { title: "Arcade Games", favicon: "game" };
            if (lower === "bib://privacy") return { title: "Privacy", favicon: "shield" };
            if (lower === "bib://performance") return { title: "Performance", favicon: "terminal" };
            if (lower === "bib://secret") return { title: "Secret Chamber", favicon: "game" };
            if (lower.startsWith("bib://search")) return { title: "Search Results", favicon: "search" };

            // Clean domain title
            const domainMatch = url.match(/^https?:\/\/([^/?#]+)/i);
            const domain = domainMatch ? domainMatch[1] : url;
            return { title: domain, favicon: "external-link" };
        }

        renderTabs(newTabId = null) {
            if (!this.tabContainer) return;
            this.tabContainer.innerHTML = "";

            const u = window.BiB.Utils;
            let currentGroup = null;

            this.tabs.forEach((tab, index) => {
                // Render Group pill if tab has group
                if (tab.group && tab.group !== currentGroup) {
                    currentGroup = tab.group;
                    const groupColors = {
                        Work: { bg: "rgba(0, 113, 227, 0.12)", text: "#0071E3", border: "rgba(0, 113, 227, 0.25)" },
                        Projects: { bg: "rgba(52, 199, 89, 0.12)", text: "#34C759", border: "rgba(52, 199, 89, 0.25)" },
                        Fun: { bg: "rgba(255, 149, 0, 0.12)", text: "#FF9500", border: "rgba(255, 149, 0, 0.25)" }
                    };
                    const color = groupColors[tab.group] || groupColors.Work;

                    const groupPill = document.createElement("div");
                    groupPill.className = "tab-group-pill";
                    groupPill.style.setProperty("--group-color", color.bg);
                    groupPill.style.setProperty("--group-text-color", color.text);
                    groupPill.style.setProperty("--group-border", color.border);
                    groupPill.innerHTML = `
                        <span class="group-dot"></span>
                        <span>${tab.group}</span>
                    `;
                    this.tabContainer.appendChild(groupPill);
                } else if (!tab.group) {
                    currentGroup = null;
                }

                // Render Tab element
                const tabEl = document.createElement("div");
                tabEl.className = `tab ${tab.id === this.activeTabId ? "is-active" : ""} ${tab.isPinned ? "is-pinned" : ""}`;
                if (newTabId && tab.id === newTabId) tabEl.classList.add("tab-entering");
                tabEl.setAttribute("data-tab-id", tab.id);
                tabEl.setAttribute("data-tab-index", index);
                tabEl.setAttribute("draggable", "true");

                tabEl.innerHTML = `
                    <span class="tab-favicon">${u.getIcon(tab.favicon || "search")}</span>
                    <span class="tab-title">${u.escapeHtml(tab.title)}</span>
                    <button class="tab-close-btn" aria-label="Close tab" title="Close Tab (⌘W)">
                        ${u.getIcon("close")}
                    </button>
                `;

                // Tab Switch
                tabEl.addEventListener("click", (e) => {
                    if (e.target.closest(".tab-close-btn")) return;
                    this.switchTab(tab.id);
                });

                // Tab Close
                const closeBtn = tabEl.querySelector(".tab-close-btn");
                if (closeBtn) {
                    closeBtn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        this.closeTab(tab.id);
                    });
                }

                // Real Drag and Drop handlers
                this.bindDragAndDrop(tabEl, tab);

                // Tab Hover Preview
                this.bindHoverPreview(tabEl, tab);

                this.tabContainer.appendChild(tabEl);
            });
        }

        bindDragAndDrop(tabEl, tab) {
            tabEl.addEventListener("dragstart", (e) => {
                this.draggedTabId = tab.id;
                tabEl.classList.add("is-dragging");
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", tab.id);
            });

            tabEl.addEventListener("dragend", () => {
                tabEl.classList.remove("is-dragging");
                this.clearDragClasses();
                this.draggedTabId = null;
            });

            tabEl.addEventListener("dragover", (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                const rect = tabEl.getBoundingClientRect();
                const mid = rect.left + rect.width / 2;

                if (e.clientX < mid) {
                    tabEl.classList.add("drag-over-left");
                    tabEl.classList.remove("drag-over-right");
                } else {
                    tabEl.classList.add("drag-over-right");
                    tabEl.classList.remove("drag-over-left");
                }
            });

            tabEl.addEventListener("dragleave", () => {
                tabEl.classList.remove("drag-over-left", "drag-over-right");
            });

            tabEl.addEventListener("drop", (e) => {
                e.preventDefault();
                const srcId = this.draggedTabId || e.dataTransfer.getData("text/plain");
                this.clearDragClasses();

                if (!srcId || srcId === tab.id) return;

                const fromIdx = this.tabs.findIndex(t => t.id === srcId);
                const toIdx = this.tabs.findIndex(t => t.id === tab.id);

                if (fromIdx >= 0 && toIdx >= 0) {
                    const [moved] = this.tabs.splice(fromIdx, 1);
                    this.tabs.splice(toIdx, 0, moved);
                    this.renderTabs();
                }
            });
        }

        clearDragClasses() {
            if (!this.tabContainer) return;
            this.tabContainer.querySelectorAll(".tab").forEach(t => {
                t.classList.remove("drag-over-left", "drag-over-right", "is-dragging");
            });
        }

        bindHoverPreview(tabEl, tab) {
            if (!this.previewEl) return;

            tabEl.addEventListener("mouseenter", () => {
                if (!window.BiB.Settings.get("showTabPreviews")) return;

                const rect = tabEl.getBoundingClientRect();
                this.previewEl.style.left = `${Math.max(10, rect.left)}px`;
                this.previewEl.style.top = `${rect.bottom + 6}px`;

                const titleEl = this.previewEl.querySelector(".tab-preview-title");
                const urlEl = this.previewEl.querySelector(".tab-preview-url");

                if (titleEl) titleEl.textContent = tab.title;
                if (urlEl) urlEl.textContent = tab.url;

                this.previewEl.classList.add("is-visible");
            });

            tabEl.addEventListener("mouseleave", () => {
                if (this.previewEl) this.previewEl.classList.remove("is-visible");
            });
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Tabs = new TabManager();
})(window);
