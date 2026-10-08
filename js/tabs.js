/**
 * BiB 3.0 — Advanced Tab System Manager
 * Supports Pinned tabs, Tab Groups, Tab Search (⌘⇧A), Audio Muting, Hover Previews, and Session Persistence
 */

"use strict";

(function (window) {
    class TabManager {
        constructor() {
            this.tabs = [];
            this.activeTabId = null;
            this.closedTabs = [];
            this.collapsedGroups = new Set();
            this.tabContainer = null;
            this.draggedTabId = null;
            this.previewEl = null;
            this.tabSearchModalEl = null;
        }

        init(containerEl) {
            this.tabContainer = containerEl;
            this.previewEl = document.querySelector(".tab-hover-preview");
            this.closedTabs = window.BiB.Storage.get("closed_tabs", []);
            this._initTabSearchModal();
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
                isPinned: !!isPinned,
                isMuted: false,
                isReaderMode: false,
                group: group || null,
                zoom: 100,
                createdAt: Date.now()
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

            this.persistSession();
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
                        // Keep browser alive with start page
                        this.createTab("bib://home", true);
                        return;
                    }
                }

                this.renderTabs();
                this.persistSession();
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

            this.persistSession();
        }

        duplicateTab(id) {
            const src = this.tabs.find(t => t.id === id);
            if (!src) return;
            return this.createTab(src.url, true, false, src.group);
        }

        togglePinTab(id) {
            const tab = this.tabs.find(t => t.id === id);
            if (!tab) return;

            tab.isPinned = !tab.isPinned;
            this.tabs.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return 0;
            });

            this.renderTabs();
            this.persistSession();
            if (window.BiB && window.BiB.Notifications) {
                window.BiB.Notifications.show(tab.isPinned ? "Tab pinned" : "Tab unpinned", "info", "pin");
            }
        }

        toggleMuteTab(id) {
            const tab = this.tabs.find(t => t.id === id);
            if (!tab) return;

            tab.isMuted = !tab.isMuted;
            this.renderTabs();

            // Mute controlled video/audio elements in current view if active
            const mediaEls = document.querySelectorAll(".page-container audio, .page-container video");
            mediaEls.forEach(el => el.muted = tab.isMuted);

            if (window.BiB && window.BiB.Notifications) {
                window.BiB.Notifications.show(tab.isMuted ? "Tab audio muted" : "Tab audio unmuted", "info", tab.isMuted ? "mute" : "volume");
            }
        }

        closeOthers(id) {
            this.tabs = this.tabs.filter(t => t.id === id || t.isPinned);
            this.switchTab(id);
            this.persistSession();
        }

        closeRight(id) {
            const idx = this.tabs.findIndex(t => t.id === id);
            if (idx === -1) return;
            this.tabs = this.tabs.filter((t, i) => i <= idx || t.isPinned);
            this.switchTab(id);
            this.persistSession();
        }

        restoreLastClosedTab() {
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
                window.BiB.Notifications.show(`Restored: ${restored.title}`, "info", "plus");
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
            this.persistSession();
        }

        toggleGroupCollapse(groupName) {
            if (this.collapsedGroups.has(groupName)) {
                this.collapsedGroups.delete(groupName);
            } else {
                this.collapsedGroups.add(groupName);
            }
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
            if (lower === "bib://diagnostics") return { title: "Browser Diagnostics", favicon: "cpu" };
            if (lower === "bib://experiments") return { title: "Experiments & Flags", favicon: "sparkles" };
            if (lower === "bib://history") return { title: "History", favicon: "history" };
            if (lower === "bib://bookmarks") return { title: "Bookmarks", favicon: "star" };
            if (lower === "bib://reading-list") return { title: "Reading List", favicon: "reading-list" };
            if (lower === "bib://settings") return { title: "Settings", favicon: "settings" };
            if (lower === "bib://downloads") return { title: "Downloads", favicon: "download" };
            if (lower === "bib://games") return { title: "Arcade Games", favicon: "game" };
            if (lower === "bib://privacy") return { title: "Privacy", favicon: "shield" };
            if (lower === "bib://performance") return { title: "Performance", favicon: "terminal" };
            if (lower.startsWith("bib://search")) return { title: "Search Results", favicon: "search" };
            if (lower.startsWith("file://local/")) {
                const name = url.replace("file://local/", "");
                return { title: decodeURIComponent(name), favicon: "file" };
            }

            // External website domain title
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
                // Check if tab belongs to collapsed group
                if (tab.group && this.collapsedGroups.has(tab.group) && tab.id !== this.activeTabId) {
                    return;
                }

                // Render Group pill if tab starts a new group
                if (tab.group && tab.group !== currentGroup) {
                    currentGroup = tab.group;
                    const groupColors = {
                        Work: { bg: "rgba(0, 113, 227, 0.12)", text: "#0071E3", border: "rgba(0, 113, 227, 0.25)" },
                        Projects: { bg: "rgba(52, 199, 89, 0.12)", text: "#34C759", border: "rgba(52, 199, 89, 0.25)" },
                        AI: { bg: "rgba(175, 82, 222, 0.12)", text: "#AF52DE", border: "rgba(175, 82, 222, 0.25)" },
                        Fun: { bg: "rgba(255, 149, 0, 0.12)", text: "#FF9500", border: "rgba(255, 149, 0, 0.25)" }
                    };
                    const color = groupColors[tab.group] || groupColors.Work;
                    const isCollapsed = this.collapsedGroups.has(tab.group);

                    const groupPill = document.createElement("div");
                    groupPill.className = `tab-group-pill ${isCollapsed ? 'is-collapsed' : ''}`;
                    groupPill.style.setProperty("--group-color", color.bg);
                    groupPill.style.setProperty("--group-text-color", color.text);
                    groupPill.style.setProperty("--group-border", color.border);
                    groupPill.title = `Click to ${isCollapsed ? 'expand' : 'collapse'} group`;
                    groupPill.innerHTML = `
                        <span class="group-dot"></span>
                        <span>${u.escapeHtml(tab.group)}</span>
                    `;
                    groupPill.addEventListener("click", () => this.toggleGroupCollapse(tab.group));
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

                if (tab.isPinned) {
                    tabEl.title = tab.title;
                    tabEl.innerHTML = `
                        <span class="tab-favicon">${u.getIcon(tab.favicon || "search", "icon", 15)}</span>
                    `;
                } else {
                    tabEl.innerHTML = `
                        <span class="tab-favicon">${u.getIcon(tab.favicon || "search", "icon", 15)}</span>
                        <span class="tab-title">${u.escapeHtml(tab.title)}</span>
                        ${tab.isMuted ? `<span class="tab-mute-badge" title="Unmute (⌥M)">${u.getIcon("mute", "icon", 12)}</span>` : ""}
                        <button class="tab-close-btn" aria-label="Close tab" title="Close Tab (⌘W)">
                            ${u.getIcon("close", "icon", 14)}
                        </button>
                    `;
                }

                // Tab Switch
                tabEl.addEventListener("click", (e) => {
                    if (e.target.closest(".tab-close-btn")) return;
                    if (e.target.closest(".tab-mute-badge")) {
                        this.toggleMuteTab(tab.id);
                        return;
                    }
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
                    this.persistSession();
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
                const rect = tabEl.getBoundingClientRect();
                this.previewEl.style.left = `${Math.max(10, rect.left)}px`;
                this.previewEl.style.top = `${rect.bottom + 8}px`;

                const titleEl = this.previewEl.querySelector(".tab-preview-title");
                const urlEl = this.previewEl.querySelector(".tab-preview-url");
                const thumbEl = this.previewEl.querySelector(".tab-preview-thumb");

                if (titleEl) titleEl.textContent = tab.title;
                if (urlEl) urlEl.textContent = tab.url;

                // Visual snapshot preview
                if (thumbEl) {
                    thumbEl.innerHTML = `
                        <div class="tab-snapshot-card">
                            <div class="snapshot-header">
                                <span class="snapshot-dot"></span>
                                <span class="snapshot-domain">${tab.url.replace(/^https?:\/\//, '').split('/')[0]}</span>
                            </div>
                            <div class="snapshot-body">
                                <div class="snapshot-line l1"></div>
                                <div class="snapshot-line l2"></div>
                                <div class="snapshot-line l3"></div>
                            </div>
                        </div>
                    `;
                }

                this.previewEl.classList.add("is-visible");
            });

            tabEl.addEventListener("mouseleave", () => {
                if (this.previewEl) this.previewEl.classList.remove("is-visible");
            });
        }

        _initTabSearchModal() {
            const container = document.createElement("div");
            container.className = "tab-search-backdrop";
            container.style.display = "none";
            container.innerHTML = `
                <div class="tab-search-dialog" role="dialog" aria-modal="true" aria-label="Search Tabs">
                    <div class="tab-search-header">
                        <input type="text" class="tab-search-input" placeholder="Search open tabs (⌘⇧A)..." spellcheck="false" autocomplete="off">
                        <span class="tab-search-count">0 tabs</span>
                    </div>
                    <div class="tab-search-list"></div>
                </div>
            `;
            document.body.appendChild(container);
            this.tabSearchModalEl = container;

            const input = container.querySelector(".tab-search-input");
            input.addEventListener("input", () => this._renderTabSearchResults(input.value));
            input.addEventListener("keydown", (e) => {
                if (e.key === "Escape") this.closeTabSearch();
            });

            container.addEventListener("click", (e) => {
                if (e.target === container) this.closeTabSearch();
            });
        }

        openTabSearch() {
            if (!this.tabSearchModalEl) return;
            this.tabSearchModalEl.style.display = "flex";
            this.tabSearchModalEl.classList.add("is-open");
            const input = this.tabSearchModalEl.querySelector(".tab-search-input");
            input.value = "";
            this._renderTabSearchResults("");
            setTimeout(() => input.focus(), 50);
        }

        closeTabSearch() {
            if (this.tabSearchModalEl) {
                this.tabSearchModalEl.classList.remove("is-open");
                this.tabSearchModalEl.style.display = "none";
            }
        }

        _renderTabSearchResults(query) {
            const listEl = this.tabSearchModalEl.querySelector(".tab-search-list");
            const countEl = this.tabSearchModalEl.querySelector(".tab-search-count");
            const q = query.trim().toLowerCase();

            const filtered = this.tabs.filter(t => {
                if (!q) return true;
                return t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q);
            });

            countEl.textContent = `${filtered.length} of ${this.tabs.length}`;
            const u = window.BiB.Utils;

            if (filtered.length === 0) {
                listEl.innerHTML = `<div class="tab-search-empty">No matching tabs</div>`;
                return;
            }

            listEl.innerHTML = filtered.map(t => `
                <div class="tab-search-item ${t.id === this.activeTabId ? 'is-active' : ''}" data-tab-id="${t.id}">
                    <span class="tab-search-item-icon">${u.getIcon(t.favicon || "search", "icon", 16)}</span>
                    <div class="tab-search-item-info">
                        <span class="tab-search-item-title">${u.escapeHtml(t.title)}</span>
                        <span class="tab-search-item-url">${u.escapeHtml(t.url)}</span>
                    </div>
                    ${t.id === this.activeTabId ? '<span class="tab-search-badge">Active</span>' : ''}
                </div>
            `).join("");

            listEl.querySelectorAll(".tab-search-item").forEach(item => {
                item.addEventListener("click", () => {
                    const id = item.getAttribute("data-tab-id");
                    if (id) {
                        this.switchTab(id);
                        this.closeTabSearch();
                    }
                });
            });
        }

        async persistSession() {
            if (!window.BiB) return;
            const sessionData = {
                id: "current_session",
                timestamp: Date.now(),
                activeTabId: this.activeTabId,
                tabs: this.tabs.map(t => ({
                    id: t.id,
                    title: t.title,
                    url: t.url,
                    favicon: t.favicon,
                    isPinned: t.isPinned,
                    group: t.group,
                    zoom: t.zoom || 100
                }))
            };

            if (window.BiB.Storage) {
                window.BiB.Storage.set("bib_session", sessionData);
            }
            if (window.BiB.IndexedDB) {
                try {
                    await window.BiB.IndexedDB.put("sessions", sessionData);
                } catch (e) {
                    // Fallback to localStorage already done
                }
            }
        }

        async checkSessionRecovery() {
            const saved = window.BiB.Storage ? window.BiB.Storage.get("bib_session", null) : null;
            if (saved && saved.tabs && saved.tabs.length > 1) {
                return saved;
            }
            return null;
        }

        restoreSession(sessionData) {
            if (!sessionData || !sessionData.tabs || sessionData.tabs.length === 0) return;
            this.tabs = [];
            sessionData.tabs.forEach((t, i) => {
                this.createTab(t.url, t.id === sessionData.activeTabId || i === 0, t.isPinned, t.group);
            });
            if (window.BiB && window.BiB.Notifications) {
                window.BiB.Notifications.show(`Restored session with ${sessionData.tabs.length} tabs`, "success", "check");
            }
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Tabs = new TabManager();
})(window);
