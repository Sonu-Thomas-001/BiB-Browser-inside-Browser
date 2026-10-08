/**
 * BiB 2.0 — Page Renderer
 * Renders internal pages, Reader view, and safe iframe embedder with Apple aesthetic
 */

"use strict";

(function (window) {
    class PageRenderer {
        async render(tab, container) {
            if (!tab || !container) return;
            const url = tab.url.toLowerCase();

            // Clear previous content
            container.innerHTML = "";

            if (tab.isReaderMode) {
                container.innerHTML = this.getReaderMode(tab);
                return;
            }

            if (url === "bib://home") {
                container.innerHTML = await this.getStartPage();
                this.bindStartPage(container);
            } else if (url === "bib://welcome") {
                container.innerHTML = this.getWelcomePage();
            } else if (url === "bib://about") {
                container.innerHTML = await this.getAboutPage();
            } else if (url === "bib://developer") {
                container.innerHTML = this.getDeveloperPage();
                if (window.BiB && window.BiB.DeveloperTools) {
                    window.BiB.DeveloperTools.init(container);
                }
            } else if (url === "bib://history") {
                container.innerHTML = await this.getHistoryPage();
                this.bindHistoryPage(container);
            } else if (url === "bib://bookmarks") {
                container.innerHTML = await this.getBookmarksPage();
                this.bindBookmarksPage(container);
            } else if (url === "bib://settings") {
                container.innerHTML = this.getSettingsPage();
                this.bindSettingsPage(container);
            } else if (url === "bib://downloads") {
                container.innerHTML = await this.getDownloadsPage();
                this.bindDownloadsPage(container);
            } else if (url === "bib://games") {
                container.innerHTML = this.getGamesPage();
                if (window.BiB && window.BiB.Games) {
                    window.BiB.Games.initDotGame();
                    window.BiB.Games.initDinoGame();
                }
            } else if (url === "bib://privacy") {
                container.innerHTML = this.getPrivacyPage();
            } else if (url === "bib://performance") {
                container.innerHTML = await this.getPerformancePage();
            } else if (url === "bib://secret") {
                container.innerHTML = this.getSecretPage();
                this.bindSecretPage(container);
            } else if (url.startsWith("bib://search")) {
                const params = new URLSearchParams(tab.url.split("?")[1] || "");
                const q = params.get("q") || "";
                container.innerHTML = this.getSearchPage(q);
                this.bindSearchPage(container);
            } else if (url.startsWith("https://") || url.startsWith("http://")) {
                // Attempt safe iframe embedding with graceful fallback
                container.innerHTML = this.getIframeEmbed(tab.url);
            } else {
                container.innerHTML = this.get404Page(tab.url);
                this.bind404Page(container);
            }
        }

        /* Start Page (bib://home) */
        async getStartPage() {
            const u = window.BiB.Utils;
            let recentHtml = "";
            if (window.BiB.History) {
                const recent = (await window.BiB.History.getAll()).slice(0, 5);
                if (recent.length > 0) {
                    recentHtml = `
                        <div class="favorites-section" style="margin-top:20px;">
                            <div class="section-label">Recently Visited</div>
                            <div class="recent-list">
                                ${recent.map(r => `
                                    <div class="recent-row" data-nav="${r.url}">
                                        <span class="favorite-icon">${u.getIcon(r.favicon || "search")}</span>
                                        <span class="recent-title">${u.escapeHtml(r.title)}</span>
                                        <span class="recent-url">${u.escapeHtml(r.url)}</span>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                    `;
                }
            }

            return `
                <div class="start-page">
                    <div class="start-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                            <rect x="3" y="3" width="18" height="18" rx="4"/>
                            <rect x="7" y="7" width="10" height="10" rx="2" stroke="var(--color-accent)"/>
                        </svg>
                    </div>
                    <h1 class="start-title">BiB</h1>
                    <p class="start-subtitle">A tiny browser living inside your browser.</p>

                    <div class="start-search-box">
                        <span class="start-search-icon" style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;min-width:18px;max-width:18px;flex-shrink:0;line-height:0;">
                            ${u.getIcon("search", "icon", 18)}
                        </span>
                        <input type="text" id="startSearchInput" class="start-search-input" placeholder="Search or enter website" spellcheck="false" autocomplete="off">
                    </div>

                    <div class="favorites-section">
                        <div class="section-label">Favorites</div>
                        <div class="favorites-grid">
                            <div class="favorite-item" data-nav="bib://welcome">
                                <div class="favorite-icon-box">${u.getIcon("info")}</div>
                                <span class="favorite-title">Welcome</span>
                            </div>
                            <div class="favorite-item" data-nav="bib://developer">
                                <div class="favorite-icon-box">${u.getIcon("terminal")}</div>
                                <span class="favorite-title">Developer</span>
                            </div>
                            <div class="favorite-item" data-nav="bib://games">
                                <div class="favorite-icon-box">${u.getIcon("game")}</div>
                                <span class="favorite-title">Games</span>
                            </div>
                            <div class="favorite-item" data-nav="bib://history">
                                <div class="favorite-icon-box">${u.getIcon("history")}</div>
                                <span class="favorite-title">History</span>
                            </div>
                            <div class="favorite-item" data-nav="bib://bookmarks">
                                <div class="favorite-icon-box">${u.getIcon("star")}</div>
                                <span class="favorite-title">Bookmarks</span>
                            </div>
                            <div class="favorite-item" data-nav="https://github.com">
                                <div class="favorite-icon-box">${u.getIcon("external-link")}</div>
                                <span class="favorite-title">GitHub</span>
                            </div>
                        </div>
                    </div>

                    ${recentHtml}
                </div>
            `;
        }

        bindStartPage(container) {
            const input = container.querySelector("#startSearchInput");
            if (input) {
                input.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" && input.value.trim()) {
                        window.BiB.Navigation.navigate(input.value.trim());
                    }
                });
            }

            container.querySelectorAll("[data-nav]").forEach(el => {
                el.addEventListener("click", () => {
                    const target = el.getAttribute("data-nav");
                    if (target) window.BiB.Navigation.navigate(target);
                });
            });
        }

        /* Welcome Page */
        getWelcomePage() {
            const u = window.BiB.Utils;
            return `
                <div class="page-wrapper">
                    <div class="page-header">
                        <h1 class="page-title">Welcome to BiB 2.0</h1>
                        <p class="page-subtitle">A client-side browser simulation crafted with the design quality of Apple, Safari, and macOS.</p>
                    </div>

                    <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);margin-bottom:var(--space-8);box-shadow:var(--shadow-card);">
                        <h3 style="font-size:16px;font-weight:600;margin-bottom:12px;">Real Web APIs Integrated</h3>
                        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;font-size:13px;color:var(--color-text-secondary);">
                            <div>• <strong>Real Drag & Drop:</strong> Drag tabs to reorder fluidly</div>
                            <div>• <strong>Real IndexedDB:</strong> Persistent history & bookmarks</div>
                            <div>• <strong>Real Web Share & Clipboard:</strong> Native system sharing</div>
                            <div>• <strong>Real Fullscreen & Print:</strong> Native browser APIs</div>
                            <div>• <strong>Real Blob File Export:</strong> Backup JSON anytime</div>
                            <div>• <strong>PWA & Offline:</strong> Service Worker caching</div>
                        </div>
                    </div>

                    <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);box-shadow:var(--shadow-card);">
                        <h3 style="font-size:16px;font-weight:600;margin-bottom:12px;">Keyboard Shortcuts Reference</h3>
                        <table style="width:100%;border-collapse:collapse;font-size:13px;color:var(--color-text-secondary);text-align:left;">
                            <tr style="border-bottom:1px solid var(--color-border-subtle);height:36px;">
                                <td><kbd>⌘T</kbd> / <kbd>Ctrl+T</kbd></td><td>Open a new tab</td>
                                <td><kbd>⌘W</kbd> / <kbd>Ctrl+W</kbd></td><td>Close active tab</td>
                            </tr>
                            <tr style="border-bottom:1px solid var(--color-border-subtle);height:36px;">
                                <td><kbd>⌘L</kbd> / <kbd>Ctrl+L</kbd></td><td>Focus address bar</td>
                                <td><kbd>⌘⇧T</kbd> / <kbd>Ctrl+Shift+T</kbd></td><td>Reopen closed tab</td>
                            </tr>
                            <tr style="border-bottom:1px solid var(--color-border-subtle);height:36px;">
                                <td><kbd>⌘F</kbd> / <kbd>Ctrl+F</kbd></td><td>Find on page</td>
                                <td><kbd>⌘D</kbd> / <kbd>Ctrl+D</kbd></td><td>Bookmark current page</td>
                            </tr>
                            <tr style="height:36px;">
                                <td><kbd>Alt+←</kbd> / <kbd>Alt+→</kbd></td><td>Back / Forward navigation</td>
                                <td><kbd>Konami Code</kbd></td><td>↑ ↑ ↓ ↓ ← → ← → B A</td>
                            </tr>
                        </table>
                    </div>
                </div>
            `;
        }

        /* About Page */
        async getAboutPage() {
            const histCount = await window.BiB.IndexedDB.count("history");
            const bmCount = await window.BiB.IndexedDB.count("bookmarks");
            const tabCount = window.BiB.Tabs ? window.BiB.Tabs.tabs.length : 1;

            return `
                <div class="page-wrapper">
                    <div class="page-header">
                        <h1 class="page-title">About BiB</h1>
                        <p class="page-subtitle">Designed to feel like a real browser product. No backend, no database, no build step.</p>
                    </div>

                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:var(--space-8);">
                        <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-5);text-align:center;">
                            <span style="font-size:28px;font-weight:700;color:var(--color-accent);">${tabCount}</span>
                            <span style="display:block;font-size:12px;color:var(--color-text-secondary);margin-top:4px;">Active Tabs</span>
                        </div>
                        <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-5);text-align:center;">
                            <span style="font-size:28px;font-weight:700;color:var(--color-text);">${histCount}</span>
                            <span style="display:block;font-size:12px;color:var(--color-text-secondary);margin-top:4px;">History Items</span>
                        </div>
                        <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-5);text-align:center;">
                            <span style="font-size:28px;font-weight:700;color:var(--color-text);">${bmCount}</span>
                            <span style="display:block;font-size:12px;color:var(--color-text-secondary);margin-top:4px;">Bookmarks</span>
                        </div>
                    </div>

                    <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);font-size:13.5px;color:var(--color-text-secondary);line-height:1.6;">
                        <h3 style="font-size:16px;font-weight:600;color:var(--color-text);margin-bottom:8px;">Architecture Philosophy</h3>
                        <p style="margin-bottom:12px;">BiB 2.0 demonstrates how rich client-side applications can achieve desktop-grade ergonomics using pure web primitives: custom CSS design tokens, standard Web APIs, IndexedDB storage, and strict-mode vanilla JavaScript.</p>
                        <p>100% static and compatible with GitHub Pages hosting.</p>
                    </div>
                </div>
            `;
        }

        /* Developer Tools Page */
        getDeveloperPage() {
            return `
                <div class="devtools-container">
                    <div class="devtools-tabs">
                        <button class="dt-tab-btn is-active" data-panel="console">Console</button>
                        <button class="dt-tab-btn" data-panel="elements">Elements</button>
                        <button class="dt-tab-btn" data-panel="network">Network</button>
                        <button class="dt-tab-btn" data-panel="storage">Storage</button>
                        <button class="dt-tab-btn" data-panel="performance">Performance</button>
                    </div>

                    <div class="dt-panel" id="dtPanelConsole">
                        <div class="terminal-box" id="terminalLogs">
                            <div class="terminal-line info">[BiB 2.0] Developer Console ready.</div>
                            <div class="terminal-line info">Type "help" to see available commands.</div>
                        </div>
                        <div class="terminal-prompt-row">
                            <span style="color:var(--color-accent);font-weight:600;">&gt;</span>
                            <input type="text" id="terminalInput" class="terminal-input" placeholder="Type command (help, tabs, history, bookmarks, whoami)..." autofocus>
                        </div>
                    </div>

                    <div class="dt-panel" id="dtPanelElements" style="display:none;">
                        <div style="font-size:12px;color:var(--color-text-secondary);margin-bottom:8px;">Simplified DOM Tree of active viewport:</div>
                        <pre id="domInspectorTree" style="background:var(--color-surface-secondary);padding:12px;border-radius:var(--radius-sm);overflow-x:auto;font-size:12px;color:var(--color-text);"></pre>
                    </div>

                    <div class="dt-panel" id="dtPanelNetwork" style="display:none;">
                        <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left;">
                            <tr style="border-bottom:1px solid var(--color-border);color:var(--color-text-tertiary);">
                                <th style="padding:6px;">Name</th><th>Status</th><th>Type</th><th>Size</th><th>Time</th>
                            </tr>
                            <tr style="border-bottom:1px solid var(--color-border-subtle);">
                                <td style="padding:6px;color:var(--color-accent);">index.html</td><td style="color:var(--color-success);">200 OK</td><td>document</td><td>6.2 KB</td><td>12ms</td>
                            </tr>
                            <tr style="border-bottom:1px solid var(--color-border-subtle);">
                                <td style="padding:6px;color:var(--color-accent);">tokens.css</td><td style="color:var(--color-success);">200 OK</td><td>stylesheet</td><td>3.8 KB</td><td>18ms</td>
                            </tr>
                            <tr style="border-bottom:1px solid var(--color-border-subtle);">
                                <td style="padding:6px;color:var(--color-accent);">app.js</td><td style="color:var(--color-success);">200 OK</td><td>script</td><td>42.5 KB</td><td>28ms</td>
                            </tr>
                        </table>
                    </div>

                    <div class="dt-panel" id="dtPanelStorage" style="display:none;">
                        <div id="storageTableWrap"></div>
                    </div>

                    <div class="dt-panel" id="dtPanelPerformance" style="display:none;">
                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">
                            <div style="background:var(--color-surface-secondary);padding:14px;border-radius:var(--radius-md);text-align:center;">
                                <div style="font-size:11px;color:var(--color-text-tertiary);">Navigation</div>
                                <div style="font-size:22px;font-weight:700;color:var(--color-accent);margin-top:4px;">18ms</div>
                            </div>
                            <div style="background:var(--color-surface-secondary);padding:14px;border-radius:var(--radius-md);text-align:center;">
                                <div style="font-size:11px;color:var(--color-text-tertiary);">DOM Ready</div>
                                <div style="font-size:22px;font-weight:700;color:var(--color-success);margin-top:4px;">32ms</div>
                            </div>
                            <div style="background:var(--color-surface-secondary);padding:14px;border-radius:var(--radius-md);text-align:center;">
                                <div style="font-size:11px;color:var(--color-text-tertiary);">Load Event</div>
                                <div style="font-size:22px;font-weight:700;color:var(--color-text);margin-top:4px;">45ms</div>
                            </div>
                            <div style="background:var(--color-surface-secondary);padding:14px;border-radius:var(--radius-md);text-align:center;">
                                <div style="font-size:11px;color:var(--color-text-tertiary);">First Paint</div>
                                <div style="font-size:22px;font-weight:700;color:var(--color-text);margin-top:4px;">24ms</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        /* History Page */
        async getHistoryPage() {
            const list = await window.BiB.History.getAll();
            const u = window.BiB.Utils;
            return `
                <div class="page-wrapper">
                    <div class="page-header" style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <h1 class="page-title">History</h1>
                            <p class="page-subtitle">View and manage your browsing history.</p>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <button class="btn btn-secondary" id="exportHistoryBtn">${u.getIcon("download")} Export</button>
                            <label class="btn btn-secondary" style="cursor:pointer;">
                                ${u.getIcon("upload")} Import
                                <input type="file" id="importHistoryFile" accept=".json" style="display:none;">
                            </label>
                            <button class="btn btn-danger" id="clearHistoryBtn">${u.getIcon("trash")} Clear</button>
                        </div>
                    </div>

                    <div style="margin-bottom:16px;">
                        <input type="text" id="historySearchInput" class="start-search-input" placeholder="Search history..." style="width:100%;height:38px;padding:0 12px;background:var(--color-surface-secondary);border:1px solid var(--color-border);border-radius:var(--radius-md);">
                    </div>

                    <div id="historyListContainer" class="recent-list" style="max-width:100%;">
                        ${this.renderHistoryRows(list)}
                    </div>
                </div>
            `;
        }

        renderHistoryRows(list) {
            const u = window.BiB.Utils;
            if (!list || list.length === 0) {
                return `<div style="padding:40px;text-align:center;color:var(--color-text-tertiary);">No browsing history found.</div>`;
            }
            return list.map(item => `
                <div class="recent-row" style="cursor:pointer;" data-nav="${item.url}">
                    <span>${u.getIcon("history")}</span>
                    <span class="recent-title">${u.escapeHtml(item.title)}</span>
                    <span class="recent-url">${u.escapeHtml(item.url)}</span>
                    <span style="font-size:11px;color:var(--color-text-tertiary);margin-left:8px;">${u.formatDate(item.timestamp)}</span>
                    <button class="btn-icon" data-del-hist="${item.id}" title="Remove" style="margin-left:6px;">${u.getIcon("close")}</button>
                </div>
            `).join("");
        }

        bindHistoryPage(container) {
            const search = container.querySelector("#historySearchInput");
            const listEl = container.querySelector("#historyListContainer");
            const exportBtn = container.querySelector("#exportHistoryBtn");
            const importFile = container.querySelector("#importHistoryFile");
            const clearBtn = container.querySelector("#clearHistoryBtn");

            if (search && listEl) {
                search.addEventListener("input", async () => {
                    const filtered = await window.BiB.History.getAll(search.value);
                    listEl.innerHTML = this.renderHistoryRows(filtered);
                    this.bindHistoryItemActions(container);
                });
            }

            if (exportBtn) {
                exportBtn.addEventListener("click", () => window.BiB.History.exportHistory());
            }

            if (importFile) {
                importFile.addEventListener("change", async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        try {
                            const data = await window.BiB.Utils.readJsonFile(file);
                            await window.BiB.History.importHistory(data);
                            const updated = await window.BiB.History.getAll();
                            listEl.innerHTML = this.renderHistoryRows(updated);
                            this.bindHistoryItemActions(container);
                        } catch (err) {
                            alert("Import failed: " + err.message);
                        }
                    }
                });
            }

            if (clearBtn) {
                clearBtn.addEventListener("click", async () => {
                    if (confirm("Clear all browsing history?")) {
                        await window.BiB.History.clearAll();
                        listEl.innerHTML = this.renderHistoryRows([]);
                    }
                });
            }

            this.bindHistoryItemActions(container);
        }

        bindHistoryItemActions(container) {
            container.querySelectorAll("[data-nav]").forEach(row => {
                row.addEventListener("click", (e) => {
                    if (e.target.closest("[data-del-hist]")) return;
                    const url = row.getAttribute("data-nav");
                    if (url) window.BiB.Navigation.navigate(url);
                });
            });

            container.querySelectorAll("[data-del-hist]").forEach(btn => {
                btn.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    const id = btn.getAttribute("data-del-hist");
                    await window.BiB.History.deleteEntry(id);
                    const row = btn.closest(".recent-row");
                    if (row) row.remove();
                });
            });
        }

        /* Bookmarks Page */
        async getBookmarksPage() {
            const list = await window.BiB.Bookmarks.getAll();
            const u = window.BiB.Utils;
            return `
                <div class="page-wrapper">
                    <div class="page-header" style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <h1 class="page-title">Bookmarks</h1>
                            <p class="page-subtitle">Your saved websites and quick links.</p>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <button class="btn btn-secondary" id="exportBmBtn">${u.getIcon("download")} Export</button>
                            <label class="btn btn-secondary" style="cursor:pointer;">
                                ${u.getIcon("upload")} Import
                                <input type="file" id="importBmFile" accept=".json" style="display:none;">
                            </label>
                        </div>
                    </div>

                    <div class="favorites-grid" style="grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));">
                        ${list.map(bm => `
                            <div class="favorite-item" style="padding:14px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);" data-nav="${bm.url}">
                                <div class="favorite-icon-box" style="margin-bottom:8px;">${u.getIcon(bm.favicon || "star")}</div>
                                <span class="favorite-title" style="font-size:13px;">${u.escapeHtml(bm.title)}</span>
                                <span style="font-size:11px;color:var(--color-text-tertiary);">${u.escapeHtml(bm.url)}</span>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        }

        bindBookmarksPage(container) {
            const exportBtn = container.querySelector("#exportBmBtn");
            const importFile = container.querySelector("#importBmFile");

            if (exportBtn) {
                exportBtn.addEventListener("click", () => window.BiB.Bookmarks.exportBookmarks());
            }

            if (importFile) {
                importFile.addEventListener("change", async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        try {
                            const data = await window.BiB.Utils.readJsonFile(file);
                            await window.BiB.Bookmarks.importBookmarks(data);
                            window.BiB.Browser.renderCurrentTab();
                        } catch (err) {
                            alert("Import failed: " + err.message);
                        }
                    }
                });
            }

            container.querySelectorAll("[data-nav]").forEach(el => {
                el.addEventListener("click", () => {
                    const url = el.getAttribute("data-nav");
                    if (url) window.BiB.Navigation.navigate(url);
                });
            });
        }

        /* Settings Page (Apple System Settings Layout) */
        getSettingsPage() {
            const currentTheme = window.BiB.Themes ? window.BiB.Themes.getTheme() : "light";
            const s = window.BiB.Settings.getAll();
            const u = window.BiB.Utils;

            return `
                <div class="settings-layout">
                    <div class="settings-sidebar">
                        <button class="settings-nav-item is-active" data-pane="general">${u.getIcon("settings")} General</button>
                        <button class="settings-nav-item" data-pane="appearance">${u.getIcon("sun")} Appearance</button>
                        <button class="settings-nav-item" data-pane="tabs">${u.getIcon("folder")} Tabs</button>
                        <button class="settings-nav-item" data-pane="privacy">${u.getIcon("shield")} Privacy</button>
                    </div>

                    <div class="settings-content">
                        <!-- General Pane -->
                        <div id="settingsPaneGeneral">
                            <h3 style="font-size:16px;font-weight:600;margin-bottom:14px;">General Settings</h3>
                            <div class="settings-row">
                                <div>
                                    <div class="settings-label-title">Startup Page</div>
                                    <div class="settings-label-desc">Open when launching new session</div>
                                </div>
                                <select id="setStartupPage" style="padding:4px 8px;border-radius:var(--radius-sm);border:1px solid var(--color-border);background:var(--color-surface);color:var(--color-text);">
                                    <option value="bib://home" ${s.startupPage === "bib://home" ? "selected" : ""}>Start Page</option>
                                    <option value="bib://welcome" ${s.startupPage === "bib://welcome" ? "selected" : ""}>Welcome Tour</option>
                                </select>
                            </div>
                            <div class="settings-row">
                                <div>
                                    <div class="settings-label-title">Default Search Engine</div>
                                    <div class="settings-label-desc">Engine for omnibox queries</div>
                                </div>
                                <select id="setSearchEngine" style="padding:4px 8px;border-radius:var(--radius-sm);border:1px solid var(--color-border);background:var(--color-surface);color:var(--color-text);">
                                    <option value="BiB Search" ${s.searchEngine === "BiB Search" ? "selected" : ""}>BiB Search</option>
                                    <option value="Google" ${s.searchEngine === "Google" ? "selected" : ""}>Google</option>
                                </select>
                            </div>
                        </div>

                        <!-- Appearance Pane -->
                        <div id="settingsPaneAppearance" style="display:none;">
                            <h3 style="font-size:16px;font-weight:600;margin-bottom:14px;">Appearance</h3>
                            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
                                <div class="favorite-item ${currentTheme === "light" ? "is-active" : ""}" data-set-theme="light" style="padding:14px;background:var(--color-surface-secondary);border:1px solid var(--color-border);">
                                    <div class="favorite-icon-box">${u.getIcon("sun")}</div>
                                    <span class="favorite-title">Light</span>
                                </div>
                                <div class="favorite-item ${currentTheme === "dark" ? "is-active" : ""}" data-set-theme="dark" style="padding:14px;background:var(--color-surface-secondary);border:1px solid var(--color-border);">
                                    <div class="favorite-icon-box">${u.getIcon("moon")}</div>
                                    <span class="favorite-title">Dark</span>
                                </div>
                                <div class="favorite-item ${currentTheme === "system" ? "is-active" : ""}" data-set-theme="system" style="padding:14px;background:var(--color-surface-secondary);border:1px solid var(--color-border);">
                                    <div class="favorite-icon-box">${u.getIcon("laptop")}</div>
                                    <span class="favorite-title">System</span>
                                </div>
                            </div>
                            <div class="settings-row">
                                <div>
                                    <div class="settings-label-title">Show Bookmark Bar</div>
                                    <div class="settings-label-desc">Display favorites below toolbar</div>
                                </div>
                                <input type="checkbox" id="setShowBmBar" ${s.showBookmarkBar ? "checked" : ""}>
                            </div>
                        </div>

                        <!-- Tabs Pane -->
                        <div id="settingsPaneTabs" style="display:none;">
                            <h3 style="font-size:16px;font-weight:600;margin-bottom:14px;">Tab Preferences</h3>
                            <div class="settings-row">
                                <div>
                                    <div class="settings-label-title">Tab Previews</div>
                                    <div class="settings-label-desc">Show card preview on hover</div>
                                </div>
                                <input type="checkbox" id="setShowPreviews" ${s.showTabPreviews ? "checked" : ""}>
                            </div>
                        </div>

                        <!-- Privacy Pane -->
                        <div id="settingsPanePrivacy" style="display:none;">
                            <h3 style="font-size:16px;font-weight:600;margin-bottom:14px;">Privacy & Local Data</h3>
                            <div class="settings-row">
                                <div>
                                    <div class="settings-label-title">Save Browsing History</div>
                                    <div class="settings-label-desc">Persist history to local IndexedDB</div>
                                </div>
                                <input type="checkbox" id="setSaveHist" ${s.saveHistory ? "checked" : ""}>
                            </div>
                            <div style="margin-top:20px;">
                                <button class="btn btn-danger" id="resetSettingsBtn">Reset All Data to Default</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        bindSettingsPage(container) {
            const tabs = container.querySelectorAll(".settings-nav-item");
            const panes = {
                general: container.querySelector("#settingsPaneGeneral"),
                appearance: container.querySelector("#settingsPaneAppearance"),
                tabs: container.querySelector("#settingsPaneTabs"),
                privacy: container.querySelector("#settingsPanePrivacy")
            };

            tabs.forEach(tab => {
                tab.addEventListener("click", () => {
                    tabs.forEach(t => t.classList.remove("is-active"));
                    tab.classList.add("is-active");
                    const target = tab.getAttribute("data-pane");

                    Object.keys(panes).forEach(p => {
                        if (panes[p]) panes[p].style.display = p === target ? "block" : "none";
                    });
                });
            });

            container.querySelectorAll("[data-set-theme]").forEach(el => {
                el.addEventListener("click", () => {
                    const t = el.getAttribute("data-set-theme");
                    if (window.BiB.Themes) window.BiB.Themes.setTheme(t);
                    window.BiB.Browser.renderCurrentTab();
                });
            });

            const showBmBar = container.querySelector("#setShowBmBar");
            if (showBmBar) {
                showBmBar.addEventListener("change", (e) => {
                    window.BiB.Settings.set("showBookmarkBar", e.target.checked);
                    window.BiB.Browser.toggleBookmarkBar(e.target.checked);
                });
            }

            const showPreviews = container.querySelector("#setShowPreviews");
            if (showPreviews) {
                showPreviews.addEventListener("change", (e) => {
                    window.BiB.Settings.set("showTabPreviews", e.target.checked);
                });
            }

            const resetBtn = container.querySelector("#resetSettingsBtn");
            if (resetBtn) {
                resetBtn.addEventListener("click", () => {
                    if (confirm("Reset all settings and clear local data?")) {
                        window.BiB.Storage.clear();
                        window.BiB.IndexedDB.clear("history");
                        window.BiB.IndexedDB.clear("bookmarks");
                        location.reload();
                    }
                });
            }
        }

        /* Downloads Page */
        async getDownloadsPage() {
            const list = await window.BiB.Downloads.getAll();
            const u = window.BiB.Utils;

            return `
                <div class="page-wrapper">
                    <div class="page-header" style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <h1 class="page-title">Downloads</h1>
                            <p class="page-subtitle">Exported files and simulated downloads.</p>
                        </div>
                        <button class="btn btn-secondary" id="clearDownloadsBtn">${u.getIcon("trash")} Clear</button>
                    </div>

                    <div class="recent-list" style="max-width:100%;">
                        ${list.length === 0 ? '<div style="padding:40px;text-align:center;color:var(--color-text-tertiary);">No downloads yet.</div>' : list.map(item => `
                            <div class="recent-row">
                                <span>${u.getIcon("download")}</span>
                                <span class="recent-title">${u.escapeHtml(item.filename)}</span>
                                <span style="font-size:11.5px;color:var(--color-success);font-weight:500;">${item.status}</span>
                                <span style="font-size:11.5px;color:var(--color-text-tertiary);margin-left:12px;">${u.formatBytes(item.size)}</span>
                                <span style="font-size:11px;color:var(--color-text-tertiary);margin-left:auto;">${u.formatDate(item.timestamp)}</span>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        }

        bindDownloadsPage(container) {
            const clearBtn = container.querySelector("#clearDownloadsBtn");
            if (clearBtn) {
                clearBtn.addEventListener("click", () => window.BiB.Downloads.clearAll());
            }
        }

        /* Games Page */
        getGamesPage() {
            return `
                <div class="page-wrapper">
                    <div class="page-header">
                        <h1 class="page-title">Arcade</h1>
                        <p class="page-subtitle">Minimalist JavaScript mini games to test your reflexes.</p>
                    </div>

                    <!-- Dot Game -->
                    <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);margin-bottom:var(--space-8);box-shadow:var(--shadow-card);">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <h3 style="font-size:16px;font-weight:600;">Click the Dot</h3>
                                <p style="font-size:13px;color:var(--color-text-secondary);">Click dots rapidly before the 30s timer runs out.</p>
                            </div>
                            <button class="btn btn-primary" id="startDotBtn">Start</button>
                        </div>

                        <div style="display:flex;gap:20px;margin-top:12px;font-size:13px;color:var(--color-text-secondary);">
                            <div>Score: <strong id="dotScore" style="color:var(--color-accent);">0</strong></div>
                            <div>Time: <strong id="dotTimer" style="color:var(--color-text);">30s</strong></div>
                            <div>Best: <strong id="dotBest" style="color:var(--color-text);">0</strong></div>
                        </div>

                        <div id="dotArena" style="position:relative;width:100%;height:260px;background:var(--color-surface-secondary);border:1px dashed var(--color-border);border-radius:var(--radius-md);margin-top:14px;overflow:hidden;cursor:crosshair;">
                            <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-tertiary);font-size:13px;">
                                Click "Start" to begin round
                            </div>
                        </div>
                    </div>

                    <!-- Dino Canvas -->
                    <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);box-shadow:var(--shadow-card);">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <h3 style="font-size:16px;font-weight:600;">Dino Runner</h3>
                                <p style="font-size:13px;color:var(--color-text-secondary);">Press Spacebar or Click canvas to jump.</p>
                            </div>
                            <button class="btn btn-primary" id="startDinoBtn">Play</button>
                        </div>

                        <div style="display:flex;justify-content:center;margin-top:14px;">
                            <canvas id="dinoCanvas" width="600" height="180" style="background:var(--color-surface-secondary);border-radius:var(--radius-md);border:1px solid var(--color-border);cursor:pointer;max-width:100%;"></canvas>
                        </div>
                    </div>
                </div>
            `;
        }

        /* Reader Mode */
        getReaderMode(tab) {
            return `
                <div class="reader-container">
                    <h1 class="reader-headline">${window.BiB.Utils.escapeHtml(tab.title || "Article")}</h1>
                    <div class="reader-byline">Safari Reader Mode • Clean Typography • ${window.BiB.Utils.escapeHtml(tab.url)}</div>
                    <div class="reader-body">
                        <p>Welcome to Reader Mode. By stripping navigation chrome, ads, and extraneous layout grids, Reader provides a comfortable, high-contrast reading experience reminiscent of Apple Safari.</p>
                        <p>Typography and line height are carefully calibrated for reading comfort, utilizing serif body text and generous paragraph margins.</p>
                        <p>Click the Reader button in the address bar anytime to toggle back to standard view.</p>
                    </div>
                </div>
            `;
        }

        /* Iframe Embedder with Safe Fallback */
        getIframeEmbed(url) {
            const u = window.BiB.Utils;
            return `
                <div style="width:100%;height:100%;position:relative;">
                    <iframe src="${url}" class="iframe-embed-wrapper" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" onerror="this.style.display='none';document.getElementById('embedFallback').style.display='flex';"></iframe>
                    <div id="embedFallback" class="embed-fallback-card" style="display:none;">
                        ${u.getIcon("shield")}
                        <h3 style="font-size:18px;font-weight:600;margin-bottom:6px;">Embedding Restricted</h3>
                        <p style="font-size:13.5px;color:var(--color-text-secondary);max-width:440px;line-height:1.5;margin-bottom:16px;">
                            This website cannot be embedded inside BiB due to browser security restrictions (such as <code>X-Frame-Options</code> or <code>Content-Security-Policy</code>).
                        </p>
                        <a href="${url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                            Open Externally ${u.getIcon("external-link")}
                        </a>
                    </div>
                </div>
            `;
        }

        /* Search Results Page */
        getSearchPage(query) {
            const data = window.BiB.Search ? window.BiB.Search.generateResults(query) : { links: [] };
            const u = window.BiB.Utils;

            return `
                <div class="page-wrapper">
                    <div style="border-bottom:1px solid var(--color-border);padding-bottom:16px;margin-bottom:24px;">
                        <span style="font-size:12px;color:var(--color-text-tertiary);">Search Results</span>
                        <h2 style="font-size:22px;font-weight:600;margin-top:2px;">"${u.escapeHtml(data.query)}"</h2>
                    </div>

                    ${data.isEasterEgg ? `
                        <div style="background:var(--color-surface-secondary);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:18px;margin-bottom:24px;">
                            <h3 style="font-size:16px;font-weight:600;color:var(--color-accent);margin-bottom:4px;">${data.title}</h3>
                            <p style="font-size:13.5px;color:var(--color-text-secondary);">${data.desc}</p>
                        </div>
                    ` : ""}

                    <div style="display:flex;flex-direction:column;gap:18px;">
                        ${data.links.map(l => `
                            <div style="cursor:pointer;" data-nav="${l.url}">
                                <div style="font-size:11.5px;color:var(--color-text-tertiary);">${u.escapeHtml(l.url)}</div>
                                <h3 style="font-size:16px;font-weight:600;color:var(--color-text-link);margin:2px 0 4px;">${u.escapeHtml(l.title)}</h3>
                                <p style="font-size:13px;color:var(--color-text-secondary);line-height:1.45;">${u.escapeHtml(l.snippet)}</p>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        }

        bindSearchPage(container) {
            container.querySelectorAll("[data-nav]").forEach(el => {
                el.addEventListener("click", () => {
                    const url = el.getAttribute("data-nav");
                    if (url) window.BiB.Navigation.navigate(url);
                });
            });
        }

        /* 404 Page */
        get404Page(url) {
            const u = window.BiB.Utils;
            return `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:80%;min-height:400px;text-align:center;padding:24px;">
                    <div style="font-size:52px;font-weight:800;color:var(--color-text-tertiary);margin-bottom:8px;">404</div>
                    <h2 style="font-size:20px;font-weight:600;margin-bottom:8px;">Page Not Found</h2>
                    <p style="font-size:14px;color:var(--color-text-secondary);max-width:420px;line-height:1.5;margin-bottom:20px;">
                        The address <code>${u.escapeHtml(url)}</code> is not registered inside the BiB simulated runtime.
                    </p>
                    <div style="display:flex;gap:10px;">
                        <button class="btn btn-primary" id="btn404Home">Start Page</button>
                        <button class="btn btn-secondary" id="btn404Back">Go Back</button>
                    </div>
                </div>
            `;
        }

        bind404Page(container) {
            const btnHome = container.querySelector("#btn404Home");
            const btnBack = container.querySelector("#btn404Back");
            if (btnHome) btnHome.addEventListener("click", () => window.BiB.Navigation.navigate("bib://home"));
            if (btnBack) btnBack.addEventListener("click", () => window.BiB.Navigation.back());
        }

        /* Privacy Page */
        getPrivacyPage() {
            return `
                <div class="page-wrapper" style="max-width:680px;">
                    <div class="page-header">
                        <h1 class="page-title">Privacy & Local Storage</h1>
                        <p class="page-subtitle">BiB does not transmit your personal data to remote servers.</p>
                    </div>

                    <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);font-size:13.5px;color:var(--color-text-secondary);line-height:1.6;">
                        <p style="margin-bottom:12px;">All browsing history, saved bookmarks, downloads records, and custom settings remain exclusively inside your browser's local sandbox (IndexedDB and localStorage).</p>
                        <p style="margin-bottom:12px;">You can export or erase this data anytime via the Settings or History panels.</p>
                        <p>No telemetry, no tracking cookies, and zero external server dependencies.</p>
                    </div>
                </div>
            `;
        }

        /* Performance Page */
        async getPerformancePage() {
            const histCount = await window.BiB.IndexedDB.count("history");
            const bmCount = await window.BiB.IndexedDB.count("bookmarks");
            const tabCount = window.BiB.Tabs ? window.BiB.Tabs.tabs.length : 1;

            return `
                <div class="page-wrapper">
                    <div class="page-header">
                        <h1 class="page-title">Performance Dashboard</h1>
                        <p class="page-subtitle">Real and simulated runtime performance metrics.</p>
                    </div>

                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;">
                        <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:16px;text-align:center;">
                            <div style="font-size:12px;color:var(--color-text-secondary);">Active Tabs</div>
                            <div style="font-size:24px;font-weight:700;color:var(--color-text);margin-top:4px;">${tabCount}</div>
                        </div>
                        <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:16px;text-align:center;">
                            <div style="font-size:12px;color:var(--color-text-secondary);">IndexedDB Records</div>
                            <div style="font-size:24px;font-weight:700;color:var(--color-accent);margin-top:4px;">${histCount + bmCount}</div>
                        </div>
                        <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:16px;text-align:center;">
                            <div style="font-size:12px;color:var(--color-text-secondary);">Estimated Memory</div>
                            <div style="font-size:24px;font-weight:700;color:var(--color-success);margin-top:4px;">~18 MB</div>
                        </div>
                    </div>
                </div>
            `;
        }

        /* Secret Chamber */
        getSecretPage() {
            return `
                <div style="position:relative;width:100%;height:100%;min-height:500px;background:#000000;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                    <canvas id="matrixSecretCanvas" style="position:absolute;inset:0;width:100%;height:100%;opacity:0.35;"></canvas>
                    <div style="position:relative;z-index:2;background:rgba(20,20,20,0.85);border:1px solid rgba(255,255,255,0.2);border-radius:var(--radius-lg);padding:32px;text-align:center;max-width:440px;color:#FFFFFF;">
                        <h2 style="font-size:22px;font-weight:700;margin-bottom:8px;">👾 Secret Chamber</h2>
                        <p style="font-size:13.5px;color:#A1A1A6;line-height:1.5;margin-bottom:20px;">
                            You entered the Konami code. You are currently running inside a browser inside another browser.
                        </p>
                        <button class="btn btn-primary" id="btnSecretReturn">Return to Start Page</button>
                    </div>
                </div>
            `;
        }

        bindSecretPage(container) {
            const canvas = container.querySelector("#matrixSecretCanvas");
            if (canvas) {
                const ctx = canvas.getContext("2d");
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
                const cols = Math.floor(canvas.width / 16);
                const drops = Array(cols).fill(1);

                const interval = setInterval(() => {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = "#0071E3";
                    ctx.font = "14px monospace";

                    drops.forEach((y, i) => {
                        const char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                        ctx.fillText(char, i * 16, y * 16);
                        if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
                        drops[i]++;
                    });
                }, 40);

                const returnBtn = container.querySelector("#btnSecretReturn");
                if (returnBtn) {
                    returnBtn.addEventListener("click", () => {
                        clearInterval(interval);
                        window.BiB.Navigation.navigate("bib://home");
                    });
                }
            }
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Renderer = new PageRenderer();
})(window);
