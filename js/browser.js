/**
 * BiB (Browser inside Browser) — Browser Coordinator
 * Coordinates window controls, omnibox, simulated pages, and modals
 */

class BrowserApp {
    constructor() {
        this.currentZoom = 100;
        this.pageContainer = null;
        this.zoomLevels = [80, 90, 100, 110, 125];
        this.simulatedMemory = 42;
    }

    init() {
        this.pageContainer = document.querySelector('.page-container');
        this.bindWindowControls();
        this.bindToolbar();
        this.bindOmnibox();
        this.bindMenu();
        this.bindModals();
        this.initSettings();
        this.startMemoryTicker();
    }

    /* ==========================================================================
       Window Controls & Actions
       ========================================================================== */
    bindWindowControls() {
        const btnClose = document.querySelector('.control-btn.close');
        const btnMin = document.querySelector('.control-btn.minimize');
        const btnMax = document.querySelector('.control-btn.maximize');
        const browserWindow = document.querySelector('.browser-window');
        const restoreBar = document.querySelector('.desktop-restore-bar');
        const noticeEl = document.querySelector('.window-notice');

        // Playful close refusal
        if (btnClose) {
            btnClose.addEventListener('click', () => {
                browserWindow.classList.remove('window-shake');
                void browserWindow.offsetWidth; // trigger reflow
                browserWindow.classList.add('window-shake');

                if (noticeEl) {
                    noticeEl.classList.add('is-visible');
                    setTimeout(() => noticeEl.classList.remove('is-visible'), 2800);
                }

                if (window.notificationManager) {
                    window.notificationManager.show('Nice try 😄 BiB refuses to close itself.', 'warning', '🛡️', 2500);
                }
            });
        }

        // Minimize window
        if (btnMin) {
            btnMin.addEventListener('click', () => {
                browserWindow.classList.add('minimized');
                setTimeout(() => {
                    browserWindow.style.display = 'none';
                    if (restoreBar) restoreBar.style.display = 'inline-flex';
                }, 300);
            });
        }

        // Restore window from dock
        if (restoreBar) {
            restoreBar.addEventListener('click', () => {
                browserWindow.style.display = 'flex';
                browserWindow.classList.remove('minimized');
                browserWindow.classList.add('restoring');
                restoreBar.style.display = 'none';
                setTimeout(() => browserWindow.classList.remove('restoring'), 350);
            });
        }

        // Maximize / Toggle fullscreen window
        if (btnMax) {
            btnMax.addEventListener('click', () => {
                browserWindow.classList.toggle('is-maximized');
            });
        }
    }

    /* ==========================================================================
       Toolbar Navigation Actions
       ========================================================================== */
    bindToolbar() {
        const btnBack = document.querySelector('.btn-back');
        const btnForward = document.querySelector('.btn-forward');
        const btnReload = document.querySelector('.btn-reload');
        const btnHome = document.querySelector('.btn-home');
        const btnNewTab = document.querySelector('.new-tab-btn');
        const starBtn = document.querySelector('.star-btn');
        const secBadge = document.querySelector('.security-badge');
        const devToolsBtn = document.querySelector('.devtools-btn');
        const themeBtn = document.querySelector('.theme-toggle-btn');
        const downloadsBtn = document.querySelector('.downloads-btn');

        if (btnBack) btnBack.addEventListener('click', () => window.navigationEngine.back());
        if (btnForward) btnForward.addEventListener('click', () => window.navigationEngine.forward());
        if (btnReload) btnReload.addEventListener('click', () => window.navigationEngine.reload());
        if (btnHome) btnHome.addEventListener('click', () => window.navigationEngine.navigate('bib://home'));
        if (btnNewTab) btnNewTab.addEventListener('click', () => window.tabManager.createTab('bib://welcome'));

        if (starBtn) {
            starBtn.addEventListener('click', () => {
                const activeTab = window.tabManager ? window.tabManager.getActiveTab() : null;
                if (activeTab && window.bookmarksManager) {
                    window.bookmarksManager.toggleBookmark(activeTab);
                }
            });
        }

        if (secBadge) {
            secBadge.addEventListener('click', () => this.showSecurityModal());
        }

        if (devToolsBtn) {
            devToolsBtn.addEventListener('click', () => window.navigationEngine.navigate('bib://developer'));
        }

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                if (window.themeManager) window.themeManager.cycleTheme();
            });
        }

        if (downloadsBtn) {
            downloadsBtn.addEventListener('click', () => window.navigationEngine.navigate('bib://downloads'));
        }
    }

    /* ==========================================================================
       Omnibox & Autocomplete Dropdown
       ========================================================================== */
    bindOmnibox() {
        const input = document.querySelector('.url-input');
        const dropdown = document.querySelector('.omnibox-dropdown');
        if (!input || !dropdown) return;

        input.addEventListener('focus', () => {
            input.select();
            this.updateSuggestions(input.value);
        });

        input.addEventListener('input', () => {
            this.updateSuggestions(input.value);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                dropdown.classList.remove('is-open');
                window.navigationEngine.navigate(input.value);
                input.blur();
            } else if (e.key === 'Escape') {
                dropdown.classList.remove('is-open');
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.omnibox-wrapper')) {
                dropdown.classList.remove('is-open');
            }
        });
    }

    updateSuggestions(val) {
        const dropdown = document.querySelector('.omnibox-dropdown');
        if (!dropdown || !window.searchEngine) return;

        const suggestions = window.searchEngine.getSuggestions(val);
        if (suggestions.length === 0) {
            dropdown.classList.remove('is-open');
            return;
        }

        dropdown.innerHTML = '';
        suggestions.forEach(item => {
            const row = document.createElement('div');
            row.className = 'suggestion-item';
            row.innerHTML = `
                <span class="suggestion-icon">${item.icon}</span>
                <span class="suggestion-title">${item.title}</span>
                <span class="suggestion-url">${item.url}</span>
            `;
            row.addEventListener('click', () => {
                dropdown.classList.remove('is-open');
                window.navigationEngine.navigate(item.url);
            });
            dropdown.appendChild(row);
        });

        dropdown.classList.add('is-open');
    }

    /* ==========================================================================
       Dropdown Menu & Submenus
       ========================================================================== */
    bindMenu() {
        const menuBtn = document.querySelector('.menu-btn');
        const menu = document.querySelector('.browser-menu');
        if (!menuBtn || !menu) return;

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('is-open');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-btn') && !e.target.closest('.browser-menu')) {
                menu.classList.remove('is-open');
            }
        });

        // Menu actions
        menu.querySelectorAll('[data-menu-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-menu-action');
                this.executeMenuAction(action);
                menu.classList.remove('is-open');
            });
        });

        // Theme sub-options
        menu.querySelectorAll('[data-theme-option]').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const theme = opt.getAttribute('data-theme-option');
                if (window.themeManager) window.themeManager.setTheme(theme);
                menu.classList.remove('is-open');
            });
        });

        // Zoom Buttons
        const zoomIn = menu.querySelector('#zoomInBtn');
        const zoomOut = menu.querySelector('#zoomOutBtn');
        const zoomReset = menu.querySelector('#zoomResetBtn');

        if (zoomIn) zoomIn.addEventListener('click', (e) => { e.stopPropagation(); this.changeZoom(10); });
        if (zoomOut) zoomOut.addEventListener('click', (e) => { e.stopPropagation(); this.changeZoom(-10); });
        if (zoomReset) zoomReset.addEventListener('click', (e) => { e.stopPropagation(); this.setZoom(100); });
    }

    executeMenuAction(action) {
        switch (action) {
            case 'new-tab':
                window.tabManager.createTab('bib://welcome');
                break;
            case 'new-window':
                if (window.notificationManager) {
                    window.notificationManager.show('Spawning parallel simulated session...', 'info', '🪟');
                }
                window.tabManager.createTab('bib://home');
                break;
            case 'reopen-tab':
                window.tabManager.reopenClosedTab();
                break;
            case 'history':
                window.navigationEngine.navigate('bib://history');
                break;
            case 'bookmarks':
                window.navigationEngine.navigate('bib://bookmarks');
                break;
            case 'downloads':
                window.navigationEngine.navigate('bib://downloads');
                break;
            case 'games':
                window.navigationEngine.navigate('bib://games');
                break;
            case 'devtools':
                window.navigationEngine.navigate('bib://developer');
                break;
            case 'settings':
                window.navigationEngine.navigate('bib://settings');
                break;
            case 'about':
                window.navigationEngine.navigate('bib://about');
                break;
            case 'print':
                if (window.notificationManager) {
                    window.notificationManager.show('Simulated print job sent to virtual PDF spooler', 'success', '🖨️');
                }
                break;
            case 'view-source':
                this.showViewSourceModal();
                break;
        }
    }

    changeZoom(delta) {
        const newZoom = Math.min(150, Math.max(60, this.currentZoom + delta));
        this.setZoom(newZoom);
    }

    setZoom(val) {
        this.currentZoom = val;
        if (this.pageContainer) {
            this.pageContainer.style.zoom = `${this.currentZoom}%`;
        }
        const zoomValEl = document.querySelector('#menuZoomVal');
        if (zoomValEl) zoomValEl.textContent = `${this.currentZoom}%`;
        this.updateStatusBar();
    }

    toggleBookmarkBar() {
        const bar = document.querySelector('.bookmark-bar');
        if (!bar) return;

        const isHidden = bar.classList.toggle('is-hidden');
        window.storageManager.set('show_bookmark_bar', !isHidden);

        if (window.notificationManager) {
            window.notificationManager.show(isHidden ? 'Bookmark bar hidden' : 'Bookmark bar visible', 'info');
        }
    }

    initSettings() {
        const showBar = window.storageManager.get('show_bookmark_bar', true);
        const bar = document.querySelector('.bookmark-bar');
        if (bar && !showBar) {
            bar.classList.add('is-hidden');
        }
    }

    /* ==========================================================================
       Status Bar Updates
       ========================================================================== */
    updateStatusBar() {
        const tabsCountEl = document.querySelector('.status-tabs-count');
        const zoomEl = document.querySelector('.status-zoom');
        const ramEl = document.querySelector('.status-ram');

        if (tabsCountEl && window.tabManager) {
            const count = window.tabManager.tabs.length;
            const activeIdx = window.tabManager.tabs.findIndex(t => t.id === window.tabManager.activeTabId) + 1;
            tabsCountEl.textContent = `Tab ${activeIdx || 1} of ${count}`;
        }

        if (zoomEl) {
            zoomEl.textContent = `${this.currentZoom}%`;
        }

        if (ramEl) {
            ramEl.textContent = `RAM: ${this.simulatedMemory} MB`;
        }
    }

    startMemoryTicker() {
        setInterval(() => {
            const tabCount = window.tabManager ? window.tabManager.tabs.length : 1;
            this.simulatedMemory = Math.min(95, Math.max(28, 25 + tabCount * 7 + Math.floor(Math.random() * 5)));
            this.updateStatusBar();
        }, 4000);
    }

    /* ==========================================================================
       Modals (Security Info, View Source)
       ========================================================================== */
    bindModals() {
        const modalBackdrop = document.querySelector('.modal-backdrop');
        const modalCloseBtn = document.querySelector('.modal-close-btn');

        if (modalCloseBtn && modalBackdrop) {
            modalCloseBtn.addEventListener('click', () => {
                modalBackdrop.classList.remove('is-open');
            });
        }

        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', (e) => {
                if (e.target === modalBackdrop) {
                    modalBackdrop.classList.remove('is-open');
                }
            });
        }

        window.addEventListener('bib:close-overlays', () => {
            if (modalBackdrop) modalBackdrop.classList.remove('is-open');
            const menu = document.querySelector('.browser-menu');
            if (menu) menu.classList.remove('is-open');
        });
    }

    showSecurityModal() {
        const backdrop = document.querySelector('.modal-backdrop');
        const title = document.querySelector('.modal-title');
        const body = document.querySelector('.modal-body');
        const footer = document.querySelector('.modal-footer');

        if (!backdrop || !title || !body) return;

        title.innerHTML = `<span>🔒</span> Connection Security & Privacy`;
        body.innerHTML = `
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
                <div style="font-size:36px;color:#10b981;">🛡️</div>
                <div>
                    <h4 style="font-size:16px;color:var(--text-primary);margin-bottom:4px;">Secure BiB Client Sandbox</h4>
                    <p style="font-size:13px;color:var(--text-secondary);">Your current connection is completely isolated inside the browser runtime.</p>
                </div>
            </div>
            <p style="margin-bottom:12px;"><strong>Certificate Authority:</strong> BiB Simulated Root CA (Quantum-Safe 4096-bit)</p>
            <p style="margin-bottom:12px;"><strong>Encryption:</strong> TLS 1.3 / AES-256-GCM Virtual Cipher</p>
            <p style="margin-bottom:12px;"><strong>Telemetry:</strong> 0 trackers, 0 ads, 100% Client-Side Local Storage.</p>
            <div style="background:var(--bg-surface-2);padding:12px;border-radius:var(--radius-sm);border:1px solid var(--card-border);font-size:12.5px;">
                All bookmarks, history entries, and themes are safely stored locally in your browser's localStorage.
            </div>
        `;

        if (footer) {
            footer.innerHTML = `<button class="bib-btn bib-btn-primary" onclick="document.querySelector('.modal-backdrop').classList.remove('is-open')">Done</button>`;
        }

        backdrop.classList.add('is-open');
    }

    showViewSourceModal() {
        const backdrop = document.querySelector('.modal-backdrop');
        const title = document.querySelector('.modal-title');
        const body = document.querySelector('.modal-body');
        const footer = document.querySelector('.modal-footer');

        if (!backdrop || !title || !body) return;

        const activeTab = window.tabManager ? window.tabManager.getActiveTab() : null;
        const currentHtml = this.pageContainer ? this.pageContainer.innerHTML : '<div></div>';

        title.innerHTML = `<span>📄</span> Page Source: ${activeTab ? activeTab.url : 'bib://source'}`;
        
        // Escape HTML for display
        const escapedHtml = currentHtml
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        body.innerHTML = `
            <div class="code-pre-box">${escapedHtml}</div>
        `;

        if (footer) {
            footer.innerHTML = `
                <button class="bib-btn bib-btn-secondary" id="copySourceBtn">Copy Source</button>
                <button class="bib-btn bib-btn-primary" onclick="document.querySelector('.modal-backdrop').classList.remove('is-open')">Close</button>
            `;

            const copyBtn = footer.querySelector('#copySourceBtn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(currentHtml);
                    if (window.notificationManager) {
                        window.notificationManager.show('Page HTML copied to clipboard', 'success');
                    }
                });
            }
        }

        backdrop.classList.add('is-open');
    }

    /* ==========================================================================
       Simulated Web Pages Generator
       ========================================================================== */
    renderCurrentTab() {
        if (!this.pageContainer || !window.tabManager) return;
        const activeTab = window.tabManager.getActiveTab();
        if (!activeTab) return;

        const url = activeTab.url.toLowerCase();

        if (url === 'bib://home') {
            this.pageContainer.innerHTML = this.getPageHome();
            this.attachHomeListeners();
            activeTab.title = 'Home Dashboard';
            activeTab.favicon = '🏠';
        } else if (url === 'bib://welcome') {
            this.pageContainer.innerHTML = this.getPageWelcome();
            this.attachWelcomeListeners();
            activeTab.title = 'BiB Welcome';
            activeTab.favicon = '🚀';
        } else if (url === 'bib://about') {
            this.pageContainer.innerHTML = this.getPageAbout();
            this.attachAboutListeners();
            activeTab.title = 'About BiB';
            activeTab.favicon = 'ℹ️';
        } else if (url === 'bib://developer') {
            this.pageContainer.innerHTML = this.getPageDeveloper();
            this.attachDeveloperListeners();
            activeTab.title = 'Developer Console';
            activeTab.favicon = '⚡';
        } else if (url === 'bib://history') {
            this.pageContainer.innerHTML = this.getPageHistory();
            this.attachHistoryListeners();
            activeTab.title = 'Browsing History';
            activeTab.favicon = '📜';
        } else if (url === 'bib://bookmarks') {
            this.pageContainer.innerHTML = this.getPageBookmarks();
            this.attachBookmarksListeners();
            activeTab.title = 'Bookmarks Manager';
            activeTab.favicon = '⭐';
        } else if (url === 'bib://settings') {
            this.pageContainer.innerHTML = this.getPageSettings();
            this.attachSettingsListeners();
            activeTab.title = 'Browser Settings';
            activeTab.favicon = '⚙️';
        } else if (url === 'bib://downloads') {
            this.pageContainer.innerHTML = this.getPageDownloads();
            this.attachDownloadsListeners();
            activeTab.title = 'Downloads Manager';
            activeTab.favicon = '📥';
        } else if (url === 'bib://games') {
            this.pageContainer.innerHTML = this.getPageGames();
            this.attachGamesListeners();
            activeTab.title = 'Arcade Mini Games';
            activeTab.favicon = '🎮';
        } else if (url === 'bib://secret') {
            this.pageContainer.innerHTML = this.getPageSecret();
            this.attachSecretListeners();
            activeTab.title = 'BiB Secret Chamber';
            activeTab.favicon = '👾';
        } else if (url.startsWith('bib://search')) {
            const params = new URLSearchParams(activeTab.url.split('?')[1] || '');
            const q = params.get('q') || '';
            this.pageContainer.innerHTML = this.getPageSearch(q);
            this.attachSearchListeners();
            activeTab.title = `Search: ${q || 'Results'}`;
            activeTab.favicon = '🔍';
        } else if (url.includes('google.com')) {
            this.pageContainer.innerHTML = this.getPageGoogle();
            this.attachGoogleListeners();
            activeTab.title = 'Google Search';
            activeTab.favicon = '🔍';
        } else if (url.includes('github.com')) {
            this.pageContainer.innerHTML = this.getPageGithub();
            this.attachGithubListeners();
            activeTab.title = 'GitHub: Antigravity/BiB';
            activeTab.favicon = '🐙';
        } else if (url.includes('example.com')) {
            this.pageContainer.innerHTML = this.getPageExample();
            activeTab.title = 'Example Domain';
            activeTab.favicon = '🌐';
        } else if (url.includes('news.local')) {
            this.pageContainer.innerHTML = this.getPageNews();
            this.attachNewsListeners();
            activeTab.title = 'BiB Tech News';
            activeTab.favicon = '📰';
        } else if (url.includes('social.local')) {
            this.pageContainer.innerHTML = this.getPageSocial();
            this.attachSocialListeners();
            activeTab.title = 'BiB Social Stream';
            activeTab.favicon = '💬';
        } else {
            this.pageContainer.innerHTML = this.getPage404(activeTab.url);
            this.attach404Listeners();
            activeTab.title = '404 - Page Escaped';
            activeTab.favicon = '🛸';
        }

        // Attach global hover link handlers for status bar
        this.pageContainer.querySelectorAll('a, [data-href]').forEach(el => {
            el.addEventListener('mouseenter', () => {
                const href = el.getAttribute('href') || el.getAttribute('data-href');
                const hoverEl = document.querySelector('.status-link-hover');
                if (hoverEl && href) hoverEl.textContent = href;
            });
            el.addEventListener('mouseleave', () => {
                const hoverEl = document.querySelector('.status-link-hover');
                if (hoverEl) hoverEl.textContent = '';
            });
        });
    }

    /* Page Templates */
    getPageHome() {
        return `
            <div class="page-wrapper">
                <div class="home-hero">
                    <div class="home-logo-wrap">
                        <svg class="home-logo-svg" viewBox="0 0 80 80" fill="none">
                            <rect x="8" y="8" width="64" height="64" rx="14" stroke="currentColor" stroke-width="4" stroke-opacity="0.9" fill="var(--bg-surface-2)"/>
                            <rect x="20" y="20" width="40" height="40" rx="8" stroke="var(--accent)" stroke-width="3" fill="var(--bg-surface-3)"/>
                            <circle cx="28" cy="28" r="2.5" fill="#ff5f56"/>
                            <circle cx="36" cy="28" r="2.5" fill="#ffbd2e"/>
                            <circle cx="44" cy="28" r="2.5" fill="#27c93f"/>
                        </svg>
                    </div>
                    <h1 class="home-hero-title">Welcome to BiB</h1>
                    <p class="home-hero-desc">Browser inside Browser. A miniature, futuristic browser simulation running completely client-side in vanilla web code.</p>

                    <div class="home-search-box">
                        <input type="text" id="homeSearchInput" class="home-search-input" placeholder="Search the simulated web or type an address...">
                        <button id="homeSearchBtn" class="home-search-submit" title="Search">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        </button>
                    </div>

                    <div class="quick-tiles-grid">
                        <div class="quick-tile" data-href="bib://welcome">
                            <span class="quick-tile-icon">🚀</span>
                            <span class="quick-tile-name">Welcome</span>
                        </div>
                        <div class="quick-tile" data-href="bib://developer">
                            <span class="quick-tile-icon">⚡</span>
                            <span class="quick-tile-name">DevTools</span>
                        </div>
                        <div class="quick-tile" data-href="bib://games">
                            <span class="quick-tile-icon">🎮</span>
                            <span class="quick-tile-name">Arcade</span>
                        </div>
                        <div class="quick-tile" data-href="bib://bookmarks">
                            <span class="quick-tile-icon">⭐</span>
                            <span class="quick-tile-name">Bookmarks</span>
                        </div>
                        <div class="quick-tile" data-href="bib://history">
                            <span class="quick-tile-icon">📜</span>
                            <span class="quick-tile-name">History</span>
                        </div>
                        <div class="quick-tile" data-href="https://github.com">
                            <span class="quick-tile-icon">🐙</span>
                            <span class="quick-tile-name">GitHub</span>
                        </div>
                    </div>
                </div>

                <div class="card-grid">
                    <div class="bib-card">
                        <div class="bib-card-icon">⚡</div>
                        <h3 class="bib-card-title">Interactive DevTools</h3>
                        <p class="bib-card-desc">Execute commands in the simulated terminal console, inspect local storage, and inspect live DOM trees.</p>
                        <button class="bib-btn bib-btn-primary" data-href="bib://developer">Open Console →</button>
                    </div>

                    <div class="bib-card">
                        <div class="bib-card-icon">🎮</div>
                        <h3 class="bib-card-title">Play Mini Games</h3>
                        <p class="bib-card-desc">Play the HTML5 Canvas Dino Runner or test your reflex agility with Click the Dot.</p>
                        <button class="bib-btn bib-btn-primary" data-href="bib://games">Play Games →</button>
                    </div>

                    <div class="bib-card">
                        <div class="bib-card-icon">🎨</div>
                        <h3 class="bib-card-title">Dynamic Themes</h3>
                        <p class="bib-card-desc">Toggle between Light, Dark Slate, Deep Midnight, and Cyberpunk Neon appearances.</p>
                        <button class="bib-btn bib-btn-secondary" data-href="bib://settings">Customize Theme →</button>
                    </div>
                </div>
            </div>
        `;
    }

    attachHomeListeners() {
        const input = document.getElementById('homeSearchInput');
        const btn = document.getElementById('homeSearchBtn');

        const doSearch = () => {
            if (input && input.value.trim()) {
                window.navigationEngine.navigate(input.value.trim());
            }
        };

        if (btn) btn.addEventListener('click', doSearch);
        if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });

        this.pageContainer.querySelectorAll('[data-href]').forEach(el => {
            el.addEventListener('click', () => {
                const href = el.getAttribute('data-href');
                if (href) window.navigationEngine.navigate(href);
            });
        });
    }

    getPageWelcome() {
        return `
            <div class="page-wrapper">
                <div class="page-header">
                    <h1 class="page-title">Welcome to BiB 🌀</h1>
                    <p class="page-subtitle">A fully interactive miniature web browser engineered entirely in vanilla web technology. No frameworks, no build step, pure front-end craftsmanship.</p>
                </div>

                <div class="card-grid" style="margin-bottom: 30px;">
                    <div class="bib-card">
                        <div class="bib-card-icon">🗂️</div>
                        <h3 class="bib-card-title">Multi-Tab Architecture</h3>
                        <p class="bib-card-desc">Create tabs, close them, right-click to pin or duplicate, and restore closed tabs with Ctrl+Shift+T.</p>
                        <button class="bib-btn bib-btn-secondary" id="welcomeNewTabBtn">Open New Tab</button>
                    </div>
                    <div class="bib-card">
                        <div class="bib-card-icon">🧭</div>
                        <h3 class="bib-card-title">Simulated Navigation</h3>
                        <p class="bib-card-desc">Type queries into the omnibox, try simulated domains like github.com, or view custom bib:// internal pages.</p>
                        <button class="bib-btn bib-btn-secondary" data-href="bib://home">Go to Home</button>
                    </div>
                    <div class="bib-card">
                        <div class="bib-card-icon">⌨️</div>
                        <h3 class="bib-card-title">Keyboard Shortcuts</h3>
                        <p class="bib-card-desc">Enjoy standard browser shortcuts: Ctrl+T, Ctrl+W, Ctrl+L, Ctrl+R, Alt+Left, Alt+Right, and Konami code!</p>
                        <button class="bib-btn bib-btn-secondary" data-href="bib://developer">DevTools REPL</button>
                    </div>
                </div>

                <div class="bib-card" style="padding:28px;">
                    <h3 style="font-size:18px;margin-bottom:14px;color:var(--text-primary);">Essential Keyboard Shortcuts Reference</h3>
                    <table style="width:100%;border-collapse:collapse;font-size:13px;color:var(--text-secondary);">
                        <tr style="border-bottom:1px solid var(--card-border);height:36px;">
                            <td><strong>Ctrl / Cmd + T</strong></td><td>Open a new tab</td>
                            <td><strong>Ctrl / Cmd + W</strong></td><td>Close current tab</td>
                        </tr>
                        <tr style="border-bottom:1px solid var(--card-border);height:36px;">
                            <td><strong>Ctrl / Cmd + L</strong></td><td>Focus omnibox address bar</td>
                            <td><strong>Ctrl / Cmd + Shift + T</strong></td><td>Reopen last closed tab</td>
                        </tr>
                        <tr style="border-bottom:1px solid var(--card-border);height:36px;">
                            <td><strong>Ctrl / Cmd + R</strong></td><td>Reload simulated tab</td>
                            <td><strong>Ctrl / Cmd + D</strong></td><td>Toggle page bookmark</td>
                        </tr>
                        <tr style="height:36px;">
                            <td><strong>Alt + ← / →</strong></td><td>Back / Forward navigation</td>
                            <td><strong>Konami Code</strong></td><td>↑ ↑ ↓ ↓ ← → ← → B A (Secret!)</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
    }

    attachWelcomeListeners() {
        const newTabBtn = document.getElementById('welcomeNewTabBtn');
        if (newTabBtn) newTabBtn.addEventListener('click', () => window.tabManager.createTab('bib://home'));

        this.pageContainer.querySelectorAll('[data-href]').forEach(el => {
            el.addEventListener('click', () => {
                const href = el.getAttribute('data-href');
                if (href) window.navigationEngine.navigate(href);
            });
        });
    }

    getPageAbout() {
        const tabCount = window.tabManager ? window.tabManager.tabs.length : 1;
        const bmCount = window.bookmarksManager ? window.bookmarksManager.getAll().length : 0;
        const histCount = window.historyManager ? window.historyManager.getAll().length : 0;

        return `
            <div class="page-wrapper">
                <div class="page-header">
                    <h1 class="page-title">About BiB</h1>
                    <p class="page-subtitle">BiB is a browser simulation built entirely with HTML5, CSS3, and vanilla JavaScript. No backend. No database. No build step. Just imagination.</p>
                </div>

                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px;">
                    <div class="bib-card" style="text-align:center;padding:20px;">
                        <span style="font-size:32px;font-weight:700;color:var(--accent);">${tabCount}</span>
                        <span style="font-size:12px;color:var(--text-muted);display:block;margin-top:4px;">Active Tabs</span>
                    </div>
                    <div class="bib-card" style="text-align:center;padding:20px;">
                        <span style="font-size:32px;font-weight:700;color:var(--accent-secondary);">${bmCount}</span>
                        <span style="font-size:12px;color:var(--text-muted);display:block;margin-top:4px;">Saved Bookmarks</span>
                    </div>
                    <div class="bib-card" style="text-align:center;padding:20px;">
                        <span style="font-size:32px;font-weight:700;color:#10b981;">${histCount}</span>
                        <span style="font-size:12px;color:var(--text-muted);display:block;margin-top:4px;">History Items</span>
                    </div>
                    <div class="bib-card" style="text-align:center;padding:20px;">
                        <span style="font-size:32px;font-weight:700;color:#38bdf8;">v1.0</span>
                        <span style="font-size:12px;color:var(--text-muted);display:block;margin-top:4px;">Engine Edition</span>
                    </div>
                </div>

                <div class="bib-card" style="padding:28px;margin-bottom:24px;">
                    <h3 style="font-size:18px;margin-bottom:12px;color:var(--text-primary);">Technical Specifications</h3>
                    <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;font-size:14px;color:var(--text-secondary);">
                        <li>✓ <strong>Markup & Structure:</strong> HTML5 Semantic elements</li>
                        <li>✓ <strong>Styling & Design:</strong> Pure Vanilla CSS3 with Custom Variables, Glassmorphism & Keyframe Animations</li>
                        <li>✓ <strong>Scripting:</strong> Vanilla ES6+ Object-Oriented Architecture (Zero external libraries)</li>
                        <li>✓ <strong>Persistence:</strong> LocalStorage Manager with memory fallback</li>
                        <li>✓ <strong>Audio Engine:</strong> Synthesized Web Audio API sound effects</li>
                        <li>✓ <strong>Deployment:</strong> 100% static GitHub Pages compatible</li>
                    </ul>
                </div>
            </div>
        `;
    }

    attachAboutListeners() {}

    getPageDeveloper() {
        return `
            <div class="devtools-container">
                <div class="devtools-nav">
                    <button class="dt-tab is-active" data-panel="console">Console</button>
                    <button class="dt-tab" data-panel="dom">DOM Elements</button>
                    <button class="dt-tab" data-panel="storage">Storage</button>
                    <button class="dt-tab" data-panel="network">Network</button>
                    <button class="dt-tab" data-panel="performance">Performance</button>
                </div>

                <!-- Console Panel -->
                <div class="dt-body" id="dtPanelConsole">
                    <div class="terminal-logs" id="terminalLogs">
                        <div class="log-entry info">[BiB Kernel] Initializing browser simulation environment...</div>
                        <div class="log-entry success">[BiB Kernel] Tab manager ready. Memory: OK.</div>
                        <div class="log-entry success">[BiB Kernel] Navigation engine ready.</div>
                        <div class="log-entry info">[BiB Kernel] Type "help" to see available terminal commands.</div>
                    </div>
                    <div class="terminal-prompt-row">
                        <span class="terminal-prompt-symbol">&gt;</span>
                        <input type="text" id="terminalInput" class="terminal-input" placeholder="Type a command (help, tabs, history, bookmarks, whoami, sudo bib)..." autofocus>
                    </div>
                </div>

                <!-- DOM Panel -->
                <div class="dt-body" id="dtPanelDom" style="display:none;">
                    <div style="font-size:13px;color:#94a3b8;margin-bottom:10px;">Virtual DOM Inspector for current tab:</div>
                    <div class="code-pre-box" id="domInspectorTree">&lt;div class="browser-window"&gt;...&lt;/div&gt;</div>
                </div>

                <!-- Storage Panel -->
                <div class="dt-body" id="dtPanelStorage" style="display:none;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                        <span style="font-size:13px;color:#94a3b8;">Active LocalStorage Items:</span>
                        <button class="bib-btn bib-btn-secondary" id="clearStorageBtn" style="padding:4px 10px;font-size:11px;">Clear Storage</button>
                    </div>
                    <div id="storageTableWrap"></div>
                </div>

                <!-- Network Panel -->
                <div class="dt-body" id="dtPanelNetwork" style="display:none;">
                    <table style="width:100%;border-collapse:collapse;font-size:12px;color:#cbd5e1;">
                        <tr style="border-bottom:1px solid #1e293b;text-align:left;color:#94a3b8;">
                            <th style="padding:6px;">Name</th><th>Status</th><th>Type</th><th>Size</th><th>Time</th>
                        </tr>
                        <tr style="border-bottom:1px solid #1e293b;">
                            <td style="padding:6px;color:#38bdf8;">index.html</td><td style="color:#34d399;">200 OK</td><td>document</td><td>4.2 KB</td><td>14ms</td>
                        </tr>
                        <tr style="border-bottom:1px solid #1e293b;">
                            <td style="padding:6px;color:#38bdf8;">main.css</td><td style="color:#34d399;">200 OK</td><td>stylesheet</td><td>18.5 KB</td><td>28ms</td>
                        </tr>
                        <tr style="border-bottom:1px solid #1e293b;">
                            <td style="padding:6px;color:#38bdf8;">app.js</td><td style="color:#34d399;">200 OK</td><td>script</td><td>32.1 KB</td><td>42ms</td>
                        </tr>
                    </table>
                </div>

                <!-- Performance Panel -->
                <div class="dt-body" id="dtPanelPerformance" style="display:none;">
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;">
                        <div class="bib-card" style="padding:16px;text-align:center;">
                            <h4 style="font-size:12px;color:#94a3b8;">Simulated FPS</h4>
                            <p style="font-size:26px;color:#34d399;font-weight:700;margin-top:6px;">60.0</p>
                        </div>
                        <div class="bib-card" style="padding:16px;text-align:center;">
                            <h4 style="font-size:12px;color:#94a3b8;">DOM Node Count</h4>
                            <p style="font-size:26px;color:#38bdf8;font-weight:700;margin-top:6px;">148</p>
                        </div>
                        <div class="bib-card" style="padding:16px;text-align:center;">
                            <h4 style="font-size:12px;color:#94a3b8;">JS Heap Memory</h4>
                            <p style="font-size:26px;color:#a855f7;font-weight:700;margin-top:6px;">8.4 MB</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachDeveloperListeners() {
        const tabs = this.pageContainer.querySelectorAll('.dt-tab');
        const panels = {
            console: this.pageContainer.querySelector('#dtPanelConsole'),
            dom: this.pageContainer.querySelector('#dtPanelDom'),
            storage: this.pageContainer.querySelector('#dtPanelStorage'),
            network: this.pageContainer.querySelector('#dtPanelNetwork'),
            performance: this.pageContainer.querySelector('#dtPanelPerformance')
        };

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('is-active'));
                tab.classList.add('is-active');
                const target = tab.getAttribute('data-panel');

                Object.keys(panels).forEach(p => {
                    if (panels[p]) panels[p].style.display = p === target ? 'block' : 'none';
                });

                if (target === 'dom') this.renderDevDomTree();
                if (target === 'storage') this.renderDevStorageTable();
            });
        });

        // Console REPL
        const input = this.pageContainer.querySelector('#terminalInput');
        const logs = this.pageContainer.querySelector('#terminalLogs');

        if (input && logs) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const cmd = input.value.trim();
                    if (!cmd) return;

                    // Append user command log
                    const cmdRow = document.createElement('div');
                    cmdRow.className = 'log-entry cmd';
                    cmdRow.textContent = `> ${cmd}`;
                    logs.appendChild(cmdRow);

                    input.value = '';
                    this.executeConsoleCommand(cmd, logs);
                    logs.scrollTop = logs.scrollHeight;
                }
            });
        }
    }

    executeConsoleCommand(rawCmd, logsEl) {
        const parts = rawCmd.split(' ');
        const cmd = parts[0].toLowerCase();
        const arg = parts.slice(1).join(' ');

        const print = (text, type = 'info') => {
            const row = document.createElement('div');
            row.className = `log-entry ${type}`;
            row.innerHTML = text;
            logsEl.appendChild(row);
        };

        switch (cmd) {
            case 'help':
                print('Available commands:<br>' +
                      '• <strong>tabs</strong> — List all open tabs<br>' +
                      '• <strong>history</strong> — Show recent browsing history<br>' +
                      '• <strong>bookmarks</strong> — List saved bookmarks<br>' +
                      '• <strong>clear</strong> — Clear terminal screen<br>' +
                      '• <strong>whoami</strong> — Inception identity check<br>' +
                      '• <strong>sudo bib</strong> — Request elevated simulation privileges<br>' +
                      '• <strong>theme [dark|light|midnight|cyber]</strong> — Switch theme<br>' +
                      '• <strong>navigate [url]</strong> — Navigate to address');
                break;
            case 'tabs':
                if (window.tabManager) {
                    print(`Open tabs (${window.tabManager.tabs.length}):`);
                    window.tabManager.tabs.forEach((t, i) => {
                        print(`[${i + 1}] ${t.title} — ${t.url}`);
                    });
                }
                break;
            case 'history':
                if (window.historyManager) {
                    const list = window.historyManager.getAll().slice(0, 5);
                    print(`Recent history items (${list.length}):`);
                    list.forEach(h => print(`• ${h.title} (${h.url})`));
                }
                break;
            case 'bookmarks':
                if (window.bookmarksManager) {
                    const list = window.bookmarksManager.getAll();
                    print(`Saved bookmarks (${list.length}):`);
                    list.forEach(b => print(`★ ${b.title} — ${b.url}`));
                }
                break;
            case 'clear':
                logsEl.innerHTML = '';
                break;
            case 'whoami':
                print('You are currently inside a browser inside another browser.', 'success');
                break;
            case 'sudo':
                if (arg === 'bib') {
                    print('Nice try.<br>You already have root access.<br>You\'re inside a browser inside a browser.<br>What more do you want?', 'warn');
                } else {
                    print(`sudo: ${arg}: command not recognized`, 'error');
                }
                break;
            case 'theme':
                if (window.themeManager && arg) {
                    window.themeManager.setTheme(arg);
                    print(`Applied theme: ${arg}`, 'success');
                } else {
                    print('Usage: theme [dark | light | midnight | cyber]', 'warn');
                }
                break;
            case 'navigate':
                if (window.navigationEngine && arg) {
                    window.navigationEngine.navigate(arg);
                    print(`Navigating to ${arg}...`, 'success');
                } else {
                    print('Usage: navigate [url]', 'warn');
                }
                break;
            default:
                print(`bib: command not found: "${cmd}". Type "help" for a list of commands.`, 'error');
                break;
        }
    }

    renderDevDomTree() {
        const treeEl = this.pageContainer.querySelector('#domInspectorTree');
        if (!treeEl) return;
        const root = document.querySelector('.browser-window');
        if (root) {
            treeEl.textContent = root.outerHTML.slice(0, 2000) + '\n... [truncated]';
        }
    }

    renderDevStorageTable() {
        const wrap = this.pageContainer.querySelector('#storageTableWrap');
        if (!wrap) return;

        let rows = '';
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            const v = localStorage.getItem(k);
            rows += `
                <tr style="border-bottom:1px solid #1e293b;">
                    <td style="padding:6px;color:#38bdf8;font-weight:600;">${k}</td>
                    <td style="padding:6px;color:#94a3b8;max-width:380px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${v}</td>
                </tr>
            `;
        }

        wrap.innerHTML = `
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <tr style="border-bottom:1px solid #1e293b;text-align:left;color:#94a3b8;">
                    <th style="padding:6px;">Key</th><th>Value</th>
                </tr>
                ${rows || '<tr><td colspan="2" style="padding:10px;color:#64748b;">No storage keys found</td></tr>'}
            </table>
        `;

        const clearBtn = this.pageContainer.querySelector('#clearStorageBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (window.storageManager) window.storageManager.clear();
                this.renderDevStorageTable();
            });
        }
    }

    getPageHistory() {
        const list = window.historyManager ? window.historyManager.getAll() : [];
        return `
            <div class="page-wrapper">
                <div class="page-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                    <div>
                        <h1 class="page-title" style="margin-bottom:4px;text-align:left;">Browsing History 📜</h1>
                        <p class="page-subtitle" style="text-align:left;">View, search, or clear your past visited destinations.</p>
                    </div>
                    <button class="bib-btn bib-btn-secondary" id="clearAllHistoryBtn" style="color:var(--danger);">Clear History</button>
                </div>

                <div style="margin-bottom:20px;">
                    <input type="text" id="historySearchInput" class="home-search-input" placeholder="Search history..." style="height:40px;font-size:13.5px;">
                </div>

                <div id="historyListContainer" style="display:flex;flex-direction:column;gap:8px;">
                    ${this.renderHistoryItems(list)}
                </div>
            </div>
        `;
    }

    renderHistoryItems(list) {
        if (list.length === 0) {
            return `<div style="text-align:center;padding:40px;color:var(--text-muted);">No history records found.</div>`;
        }

        return list.map(item => {
            const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `
                <div class="bib-card" style="padding:12px 16px;flex-direction:row;align-items:center;gap:12px;cursor:pointer;" data-hist-url="${item.url}">
                    <span style="font-size:16px;">${item.favicon || '📄'}</span>
                    <div style="flex:1;overflow:hidden;">
                        <h4 style="font-size:14px;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.title}</h4>
                        <span style="font-size:12px;color:var(--text-muted);">${item.url}</span>
                    </div>
                    <span style="font-size:12px;color:var(--text-muted);">${timeStr}</span>
                    <button class="modal-close-btn" data-delete-hist="${item.id}" title="Remove entry" style="font-size:13px;">✕</button>
                </div>
            `;
        }).join('');
    }

    attachHistoryListeners() {
        const input = document.getElementById('historySearchInput');
        const container = document.getElementById('historyListContainer');
        const clearBtn = document.getElementById('clearAllHistoryBtn');

        if (input && container) {
            input.addEventListener('input', () => {
                const filtered = window.historyManager.getAll(input.value);
                container.innerHTML = this.renderHistoryItems(filtered);
                this.bindHistoryItemActions();
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                window.historyManager.clearHistory();
                if (container) container.innerHTML = this.renderHistoryItems([]);
            });
        }

        this.bindHistoryItemActions();
    }

    bindHistoryItemActions() {
        this.pageContainer.querySelectorAll('[data-hist-url]').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('[data-delete-hist]')) return;
                const url = card.getAttribute('data-hist-url');
                if (url) window.navigationEngine.navigate(url);
            });
        });

        this.pageContainer.querySelectorAll('[data-delete-hist]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-delete-hist');
                if (window.historyManager) {
                    window.historyManager.deleteEntry(id);
                    const card = btn.closest('[data-hist-url]');
                    if (card) card.remove();
                }
            });
        });
    }

    getPageBookmarks() {
        const bookmarks = window.bookmarksManager ? window.bookmarksManager.getAll() : [];
        return `
            <div class="page-wrapper">
                <div class="page-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                    <div>
                        <h1 class="page-title" style="margin-bottom:4px;text-align:left;">Bookmarks ⭐</h1>
                        <p class="page-subtitle" style="text-align:left;">Quick access to your favorite simulated destinations.</p>
                    </div>
                </div>

                <div class="card-grid" id="bookmarksGrid">
                    ${bookmarks.map(bm => `
                        <div class="bib-card" style="position:relative;">
                            <span style="font-size:28px;margin-bottom:12px;">${bm.favicon || '⭐'}</span>
                            <h3 class="bib-card-title">${bm.title}</h3>
                            <p class="bib-card-desc" style="font-family:var(--font-mono);font-size:12px;">${bm.url}</p>
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;">
                                <button class="bib-btn bib-btn-primary" data-open-bm="${bm.url}" style="padding:6px 14px;font-size:12.5px;">Open →</button>
                                <button class="modal-close-btn" data-remove-bm="${bm.url}" title="Remove bookmark">✕</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    attachBookmarksListeners() {
        this.pageContainer.querySelectorAll('[data-open-bm]').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.getAttribute('data-open-bm');
                if (url) window.navigationEngine.navigate(url);
            });
        });

        this.pageContainer.querySelectorAll('[data-remove-bm]').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.getAttribute('data-remove-bm');
                if (window.bookmarksManager) {
                    window.bookmarksManager.removeBookmark(url);
                    this.renderCurrentTab();
                }
            });
        });
    }

    getPageSettings() {
        const currentTheme = window.themeManager ? window.themeManager.getTheme() : 'dark';
        const showBar = window.storageManager.get('show_bookmark_bar', true);

        return `
            <div class="page-wrapper" style="max-width:760px;">
                <div class="page-header" style="text-align:left;margin-bottom:28px;">
                    <h1 class="page-title">Settings ⚙️</h1>
                    <p class="page-subtitle">Configure theme appearance, browser behaviors, and local storage.</p>
                </div>

                <!-- Theme Selection -->
                <div class="bib-card" style="padding:24px;margin-bottom:20px;">
                    <h3 style="font-size:17px;margin-bottom:8px;color:var(--text-primary);">Appearance & Themes</h3>
                    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;">Select the color palette for BiB.</p>
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
                        <div class="bib-btn ${currentTheme === 'dark' ? 'bib-btn-primary' : 'bib-btn-secondary'}" data-set-theme="dark" style="cursor:pointer;text-align:center;">Dark Slate</div>
                        <div class="bib-btn ${currentTheme === 'light' ? 'bib-btn-primary' : 'bib-btn-secondary'}" data-set-theme="light" style="cursor:pointer;text-align:center;">Clean Light</div>
                        <div class="bib-btn ${currentTheme === 'midnight' ? 'bib-btn-primary' : 'bib-btn-secondary'}" data-set-theme="midnight" style="cursor:pointer;text-align:center;">Midnight</div>
                        <div class="bib-btn ${currentTheme === 'cyber' ? 'bib-btn-primary' : 'bib-btn-secondary'}" data-set-theme="cyber" style="cursor:pointer;text-align:center;">Cyber Neon</div>
                    </div>
                </div>

                <!-- Browser Behavior -->
                <div class="bib-card" style="padding:24px;margin-bottom:20px;">
                    <h3 style="font-size:17px;margin-bottom:16px;color:var(--text-primary);">Browser Behaviors</h3>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--card-border);">
                        <div>
                            <strong style="color:var(--text-primary);font-size:14px;">Show Bookmark Bar</strong>
                            <p style="font-size:12.5px;color:var(--text-secondary);">Display bookmarks strip underneath the address bar.</p>
                        </div>
                        <button class="bib-btn bib-btn-secondary" id="toggleSettingsBmBar">${showBar ? 'Hide Bar' : 'Show Bar'}</button>
                    </div>
                </div>

                <!-- Privacy & Storage Reset -->
                <div class="bib-card" style="padding:24px;">
                    <h3 style="font-size:17px;margin-bottom:8px;color:var(--text-primary);">Privacy & Storage Reset</h3>
                    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;">Erase local storage, bookmarks, and history back to default state.</p>
                    <button class="bib-btn bib-btn-secondary" id="resetAllDataBtn" style="color:var(--danger);border-color:var(--danger);">Reset All Data</button>
                </div>
            </div>
        `;
    }

    attachSettingsListeners() {
        this.pageContainer.querySelectorAll('[data-set-theme]').forEach(btn => {
            btn.addEventListener('click', () => {
                const t = btn.getAttribute('data-set-theme');
                if (window.themeManager) window.themeManager.setTheme(t);
                this.renderCurrentTab();
            });
        });

        const toggleBarBtn = document.getElementById('toggleSettingsBmBar');
        if (toggleBarBtn) {
            toggleBarBtn.addEventListener('click', () => {
                this.toggleBookmarkBar();
                this.renderCurrentTab();
            });
        }

        const resetBtn = document.getElementById('resetAllDataBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset all BiB settings, bookmarks, and history?')) {
                    if (window.storageManager) window.storageManager.clear();
                    location.reload();
                }
            });
        }
    }

    getPageDownloads() {
        return `
            <div class="page-wrapper" style="max-width:800px;">
                <div class="page-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                    <div>
                        <h1 class="page-title" style="margin-bottom:4px;text-align:left;">Downloads Manager 📥</h1>
                        <p class="page-subtitle" style="text-align:left;">Simulate downloading wallpapers and source files.</p>
                    </div>
                    <button class="bib-btn bib-btn-primary" id="triggerDownloadBtn">+ Simulate Download</button>
                </div>

                <div id="downloadsListWrap">
                    <div class="download-item-card">
                        <span style="font-size:28px;">🖼️</span>
                        <div style="flex:1;">
                            <h4 style="font-size:14px;color:var(--text-primary);">bib-aurora-wallpaper.png</h4>
                            <span style="font-size:12px;color:#10b981;">Completed • 3.4 MB</span>
                        </div>
                    </div>
                    <div class="download-item-card">
                        <span style="font-size:28px;">📦</span>
                        <div style="flex:1;">
                            <h4 style="font-size:14px;color:var(--text-primary);">BiB-v1.0-Source.zip</h4>
                            <span style="font-size:12px;color:#10b981;">Completed • 120 KB</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachDownloadsListeners() {
        const btn = document.getElementById('triggerDownloadBtn');
        const wrap = document.getElementById('downloadsListWrap');

        if (btn && wrap) {
            btn.addEventListener('click', () => {
                const card = document.createElement('div');
                card.className = 'download-item-card';
                card.innerHTML = `
                    <span style="font-size:28px;">🚀</span>
                    <div style="flex:1;">
                        <h4 style="font-size:14px;color:var(--text-primary);">BiB-Quantum-Extension.pkg</h4>
                        <div class="download-progress-bar-bg">
                            <div class="download-progress-fill" style="width:10%;"></div>
                        </div>
                        <span class="dl-status-text" style="font-size:11px;color:var(--text-muted);display:block;margin-top:4px;">Downloading (10%)...</span>
                    </div>
                `;
                wrap.prepend(card);

                const fill = card.querySelector('.download-progress-fill');
                const text = card.querySelector('.dl-status-text');

                let pct = 10;
                const timer = setInterval(() => {
                    pct += 20;
                    if (fill) fill.style.width = `${pct}%`;
                    if (text) text.textContent = `Downloading (${pct}%)...`;

                    if (pct >= 100) {
                        clearInterval(timer);
                        if (text) {
                            text.textContent = 'Completed • 5.1 MB';
                            text.style.color = '#10b981';
                        }
                        if (window.notificationManager) {
                            window.notificationManager.show('Download finished: BiB-Quantum-Extension.pkg', 'success', '📥');
                        }
                    }
                }, 400);
            });
        }
    }

    getPageGames() {
        return `
            <div class="games-container">
                <div class="page-header">
                    <h1 class="page-title">BiB Arcade 🎮</h1>
                    <p class="page-subtitle">Built-in JavaScript mini games designed to test your reflexes and rhythm.</p>
                </div>

                <!-- Game 1: Click the Dot -->
                <div class="game-card-box">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <h3 style="font-size:18px;color:var(--text-primary);margin-bottom:4px;">🎯 Game 1: Click the Dot (Reflex Trainer)</h3>
                            <p style="font-size:13px;color:var(--text-secondary);">Click targets quickly before the 30-second timer runs out!</p>
                        </div>
                        <button class="bib-btn bib-btn-primary" id="startDotGameBtn">Start Game</button>
                    </div>

                    <div style="display:flex;gap:24px;margin-top:14px;font-size:13px;color:var(--text-secondary);">
                        <div>Score: <strong id="dotScore" style="color:var(--accent);">0</strong></div>
                        <div>Time: <strong id="dotTimer" style="color:#f59e0b;">30s</strong></div>
                        <div>Combo: <strong id="dotCombo" style="color:#10b981;">0x</strong></div>
                        <div>Best: <strong id="dotHighScore" style="color:var(--text-primary);">0</strong></div>
                    </div>

                    <div class="dot-arena" id="dotArena">
                        <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:14px;">
                            Click "Start Game" to spawn targets!
                        </div>
                    </div>
                </div>

                <!-- Game 2: Browser Dino Runner -->
                <div class="game-card-box">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <h3 style="font-size:18px;color:var(--text-primary);margin-bottom:4px;">🦖 Game 2: Browser Dino Runner</h3>
                            <p style="font-size:13px;color:var(--text-secondary);">Press Spacebar or Click canvas to jump over oncoming cacti obstacles.</p>
                        </div>
                        <button class="bib-btn bib-btn-primary" id="startDinoBtn">Play Runner</button>
                    </div>

                    <div style="display:flex;gap:24px;margin-top:14px;font-size:13px;color:var(--text-secondary);">
                        <div>Score: <strong id="dinoScore" style="color:var(--accent);">0</strong></div>
                        <div>High Score: <strong id="dinoHighScore" style="color:var(--text-primary);">0</strong></div>
                    </div>

                    <div class="dino-arena">
                        <canvas id="dinoCanvas" width="640" height="180"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    attachGamesListeners() {
        if (window.miniGamesManager) {
            window.miniGamesManager.initDotGame();
            window.miniGamesManager.initDinoGame();
        }
    }

    getPageSecret() {
        return `
            <div style="position:relative;width:100%;height:100%;min-height:550px;background:#030712;overflow:hidden;display:flex;align-items:center;justify-content:center;color:#00ffcc;">
                <canvas id="matrixCanvas" style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:0.35;pointer-events:none;"></canvas>
                <div class="bib-card" style="position:relative;z-index:2;background:rgba(3,7,18,0.9);border:1px solid #00ffcc;box-shadow:0 0 25px rgba(0,255,204,0.3);max-width:540px;text-align:center;">
                    <h2 style="font-size:26px;color:#00ffcc;margin-bottom:12px;">👾 BiB Secret Chamber</h2>
                    <p style="font-size:14px;color:#f0fdf4;line-height:1.6;margin-bottom:20px;">
                        Congratulations, netrunner! You unlocked the classified chamber of BiB.<br>
                        <em>"There is no browser engine. Only DOM."</em>
                    </p>
                    <div style="display:flex;justify-content:center;gap:12px;">
                        <button class="bib-btn bib-btn-primary" data-href="bib://developer">Open Terminal</button>
                        <button class="bib-btn bib-btn-secondary" data-href="bib://home">Return Home</button>
                    </div>
                </div>
            </div>
        `;
    }

    attachSecretListeners() {
        const canvas = document.getElementById('matrixCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        const letters = '0123456789ABCDEFBiB';
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array(columns).fill(1);

        const drawMatrix = () => {
            ctx.fillStyle = 'rgba(3, 7, 18, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00ffcc';
            ctx.font = `${fontSize}px monospace`;

            drops.forEach((y, i) => {
                const char = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(char, i * fontSize, y * fontSize);
                if (y * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            });
        };

        const interval = setInterval(drawMatrix, 35);
        this.pageContainer.querySelectorAll('[data-href]').forEach(el => {
            el.addEventListener('click', () => {
                clearInterval(interval);
                const href = el.getAttribute('data-href');
                if (href) window.navigationEngine.navigate(href);
            });
        });
    }

    getPageSearch(q) {
        const searchData = window.searchEngine ? window.searchEngine.generateSearchResults(q) : { results: [] };
        return `
            <div class="page-wrapper">
                <div style="border-bottom:1px solid var(--card-border);padding-bottom:20px;margin-bottom:24px;">
                    <span style="font-size:13px;color:var(--text-muted);">BiB Simulated Search Engine</span>
                    <h2 style="font-size:24px;color:var(--text-primary);margin-top:4px;">Results for "${searchData.query}"</h2>
                </div>

                ${searchData.isEasterEgg ? `
                    <div class="bib-card" style="border-color:var(--accent);background:var(--bg-surface-2);margin-bottom:24px;">
                        <h3 style="font-size:18px;color:var(--accent);margin-bottom:8px;">${searchData.specialTitle}</h3>
                        <p style="font-size:14px;color:var(--text-primary);">${searchData.specialDesc}</p>
                    </div>
                ` : ''}

                <div style="display:flex;flex-direction:column;gap:18px;">
                    ${searchData.results.map((res, i) => `
                        <div class="search-result-item" style="cursor:pointer;" data-href="${res.url}">
                            <span style="font-size:12px;color:var(--accent);font-family:var(--font-mono);">${res.url}</span>
                            <h3 style="font-size:18px;color:var(--text-link);margin:4px 0 6px;">${res.title}</h3>
                            <p style="font-size:13.5px;color:var(--text-secondary);line-height:1.5;">${res.snippet}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    attachSearchListeners() {
        this.pageContainer.querySelectorAll('[data-href]').forEach(el => {
            el.addEventListener('click', () => {
                const href = el.getAttribute('data-href');
                if (href) window.navigationEngine.navigate(href);
            });
        });
    }

    getPageGoogle() {
        return `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:500px;padding:20px;">
                <h1 style="font-size:62px;font-weight:700;letter-spacing:-2px;margin-bottom:24px;">
                    <span style="color:#4285f4;">G</span><span style="color:#ea4335;">o</span><span style="color:#fbbc05;">o</span><span style="color:#4285f4;">g</span><span style="color:#34a853;">l</span><span style="color:#ea4335;">e</span>
                </h1>
                <div style="width:100%;max-width:560px;">
                    <input type="text" id="fakeGoogleInput" class="home-search-input" placeholder="Search Google or type a URL" style="height:48px;">
                    <div style="display:flex;justify-content:center;gap:12px;margin-top:20px;">
                        <button class="bib-btn bib-btn-secondary" id="fakeGoogleSearch">Google Search</button>
                        <button class="bib-btn bib-btn-secondary" id="fakeGoogleLucky">I'm Feeling Lucky</button>
                    </div>
                </div>
            </div>
        `;
    }

    attachGoogleListeners() {
        const input = document.getElementById('fakeGoogleInput');
        const searchBtn = document.getElementById('fakeGoogleSearch');
        const luckyBtn = document.getElementById('fakeGoogleLucky');

        const submit = (q) => {
            if (q) window.navigationEngine.navigate(q);
        };

        if (searchBtn && input) searchBtn.addEventListener('click', () => submit(input.value));
        if (luckyBtn) luckyBtn.addEventListener('click', () => submit('bib://games'));
        if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(input.value); });
    }

    getPageGithub() {
        return `
            <div class="page-wrapper" style="max-width:960px;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                    <span style="font-size:36px;">🐙</span>
                    <div>
                        <h2 style="font-size:20px;color:var(--text-primary);">antigravity / <strong>bib</strong> <span style="font-size:11px;padding:2px 8px;border-radius:12px;border:1px solid var(--card-border);color:var(--text-muted);">Public</span></h2>
                        <p style="font-size:13px;color:var(--text-secondary);">🌀 Browser inside Browser — A miniature browser simulation built with HTML, CSS & vanilla JS.</p>
                    </div>
                </div>

                <div class="bib-card" style="padding:24px;margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--card-border);padding-bottom:12px;margin-bottom:14px;">
                        <span style="font-size:13px;font-weight:600;color:var(--text-primary);">README.md</span>
                        <span style="font-size:12px;color:var(--text-muted);">MIT License</span>
                    </div>
                    <div style="font-size:13.5px;color:var(--text-secondary);line-height:1.6;">
                        <h3 style="font-size:18px;color:var(--text-primary);margin-bottom:8px;"># BiB — Browser inside Browser</h3>
                        <p style="margin-bottom:10px;">A lightweight, zero-dependency browser simulation showcasing tabs, omnibox search, dynamic themes, and interactive devtools.</p>
                        <p>Deployable straight to GitHub Pages without any bundler or build steps.</p>
                    </div>
                </div>
            </div>
        `;
    }

    attachGithubListeners() {}

    getPageExample() {
        return `
            <div style="max-width:600px;margin:80px auto;padding:30px;background:var(--bg-surface-1);border-radius:var(--radius-md);border:1px solid var(--card-border);">
                <h1 style="font-size:24px;color:var(--text-primary);margin-bottom:12px;">Example Domain</h1>
                <p style="font-size:14px;color:var(--text-secondary);line-height:1.6;margin-bottom:16px;">
                    This domain is established to be used for illustrative examples in documents. You may use this domain in examples without prior coordination or asking for permission.
                </p>
                <a href="bib://home" style="color:var(--accent);font-size:13px;">More information...</a>
            </div>
        `;
    }

    getPageNews() {
        return `
            <div class="page-wrapper">
                <div class="page-header" style="text-align:left;border-bottom:1px solid var(--card-border);padding-bottom:16px;">
                    <h1 class="page-title">BiB Tech Daily 📰</h1>
                    <p class="page-subtitle">Simulated trending stories across web engineering and design.</p>
                </div>
                <div style="display:flex;flex-direction:column;gap:16px;margin-top:20px;">
                    <div class="bib-card" style="cursor:pointer;" data-href="bib://about">
                        <span style="font-size:12px;color:var(--accent);">FEATURED • 12 MIN AGO</span>
                        <h3 class="bib-card-title" style="margin-top:6px;">Vanilla JS Experiencing Massive Renaissance in 2026</h3>
                        <p class="bib-card-desc">Modern browsers now offer robust native APIs eliminating the need for bulky front-end frameworks in lightweight creative tools.</p>
                    </div>
                    <div class="bib-card" style="cursor:pointer;" data-href="bib://developer">
                        <span style="font-size:12px;color:#10b981;">DEV TOOLS • 1 HOUR AGO</span>
                        <h3 class="bib-card-title" style="margin-top:6px;">Why Browser inside Browser Architectures are Trending</h3>
                        <p class="bib-card-desc">Simulating operating systems and browsers inside client runtimes offers playful educational insights.</p>
                    </div>
                </div>
            </div>
        `;
    }

    attachNewsListeners() {
        this.pageContainer.querySelectorAll('[data-href]').forEach(el => {
            el.addEventListener('click', () => {
                const href = el.getAttribute('data-href');
                if (href) window.navigationEngine.navigate(href);
            });
        });
    }

    getPageSocial() {
        return `
            <div class="page-wrapper" style="max-width:680px;">
                <div class="page-header" style="text-align:left;border-bottom:1px solid var(--card-border);padding-bottom:14px;">
                    <h1 class="page-title">BiB Social Stream 💬</h1>
                    <p class="page-subtitle">Live simulated microblog updates.</p>
                </div>
                <div style="display:flex;flex-direction:column;gap:14px;margin-top:20px;">
                    <div class="bib-card">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                            <span style="font-size:24px;">🤖</span>
                            <div>
                                <strong style="font-size:14px;color:var(--text-primary);">Ada Lovelace @ada</strong>
                                <span style="font-size:12px;color:var(--text-muted);display:block;">2m ago</span>
                            </div>
                        </div>
                        <p style="font-size:14px;color:var(--text-secondary);line-height:1.5;">Just tested BiB! The tab switching animations and DevTools terminal feel shockingly smooth for pure vanilla JS.</p>
                    </div>
                </div>
            </div>
        `;
    }

    attachSocialListeners() {}

    getPage404(url) {
        return `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:500px;text-align:center;padding:24px;">
                <span style="font-size:64px;margin-bottom:16px;">🛸</span>
                <h1 style="font-size:36px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">404 — Page Escaped</h1>
                <p style="font-size:15px;color:var(--text-secondary);max-width:440px;line-height:1.5;margin-bottom:24px;">
                    The requested address <code style="color:var(--accent);font-family:var(--font-mono);">${url}</code> does not exist inside the BiB simulated universe.
                </p>
                <div style="display:flex;gap:12px;">
                    <button class="bib-btn bib-btn-primary" id="btn404Home">Go to Home</button>
                    <button class="bib-btn bib-btn-secondary" id="btn404Back">Go Back</button>
                </div>
            </div>
        `;
    }

    attach404Listeners() {
        const btnHome = document.getElementById('btn404Home');
        const btnBack = document.getElementById('btn404Back');

        if (btnHome) btnHome.addEventListener('click', () => window.navigationEngine.navigate('bib://home'));
        if (btnBack) btnBack.addEventListener('click', () => window.navigationEngine.back());
    }
}

// Export singleton instance
window.browserApp = new BrowserApp();
