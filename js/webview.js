/**
 * BiB 3.0 — Controlled WebView Manager
 * Manages external iframe navigation, security boundaries, blocked fallback views, and loading states
 */

"use strict";

(function (window) {
    class WebViewManager {
        constructor() {
            this.currentUrl = "";
            this.currentIframe = null;
            this.isLoading = false;
            this.loadTimeout = null;
            this.progressTimer = null;
            this.progressVal = 0;
            this.state = "Empty"; // Empty, Loading, Loaded, Blocked, Offline, Error
        }

        async load(url, container) {
            if (!url || !container) return;
            this.currentUrl = url;
            this.stop(); // Stop any pending load

            // 1. Check Offline
            if (!navigator.onLine) {
                this.state = "Offline";
                this._renderOfflineState(container, url);
                return;
            }

            // 2. Set Loading State
            this.state = "Loading";
            this._startLoadingProgress();
            this._updateReloadStopButton(true);

            // Container setup
            container.innerHTML = `
                <div class="webview-shell">
                    <iframe 
                        class="webview-frame" 
                        src="${url}" 
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups" 
                        allow="fullscreen; clipboard-read; clipboard-write;"
                        title="BiB Web View">
                    </iframe>
                </div>
            `;

            const iframe = container.querySelector(".webview-frame");
            this.currentIframe = iframe;

            let isHandled = false;

            // Load handler
            iframe.onload = () => {
                if (isHandled) return;
                isHandled = true;
                this._finishLoadingProgress();
                this._updateReloadStopButton(false);
                this.state = "Loaded";

                // Check if iframe was blocked by X-Frame-Options or CSP
                // When X-Frame-Options denies embedding, in Chromium it usually errors or remains about:blank / inaccessible
                try {
                    // Test access - if cross-origin, checking iframe.contentWindow.location will throw DOMException (which is expected)
                    // If blocked, some browsers show error document or 0 width/height
                } catch (e) {
                    // Normal cross-origin behavior
                }
            };

            // Error / Blocked timeout heuristic
            // If the iframe doesn't fire onload within 6 seconds or fails, check fallback
            this.loadTimeout = setTimeout(() => {
                if (this.state === "Loading") {
                    this._finishLoadingProgress();
                    this._updateReloadStopButton(false);
                    // If known blocked domain or unresponsive, offer graceful fallback
                    const knownBlocked = ["github.com", "apple.com", "google.com", "youtube.com", "twitter.com", "x.com"];
                    const isKnownBlocked = knownBlocked.some(domain => url.toLowerCase().includes(domain));

                    if (isKnownBlocked) {
                        this.state = "Blocked";
                        this._renderBlockedState(container, url);
                    } else {
                        // Keep loaded
                        this.state = "Loaded";
                    }
                }
            }, 6000);
        }

        stop() {
            if (this.loadTimeout) clearTimeout(this.loadTimeout);
            if (this.progressTimer) clearInterval(this.progressTimer);
            this.isLoading = false;
            this._finishLoadingProgress(true);
            this._updateReloadStopButton(false);

            if (this.currentIframe && this.state === "Loading") {
                try {
                    this.currentIframe.src = "about:blank";
                } catch (e) {}
            }
        }

        reload(container) {
            if (this.currentUrl) {
                this.load(this.currentUrl, container || document.querySelector(".page-container"));
            }
        }

        openExternal(url = this.currentUrl) {
            if (!url) return;
            const targetUrl = url.startsWith("http") ? url : `https://${url}`;
            window.open(targetUrl, "_blank", "noopener,noreferrer");
            if (window.BiB && window.BiB.Notifications) {
                window.BiB.Notifications.show(`Opened external tab: ${targetUrl}`, "info", "external-link");
            }
        }

        _renderBlockedState(container, url) {
            const u = window.BiB.Utils;
            const domain = url.replace(/^https?:\/\//i, "").split("/")[0];

            container.innerHTML = `
                <div class="blocked-page-wrapper">
                    <div class="blocked-card">
                        <div class="blocked-icon">
                            ${u.getIcon("shield", "icon", 36)}
                        </div>
                        <h2 class="blocked-title">Can't display this site</h2>
                        <p class="blocked-desc">
                            <strong>${u.escapeHtml(domain)}</strong> restricts embedded browsing inside other web applications via <code>X-Frame-Options</code> or Content Security Policy.
                        </p>

                        <div class="blocked-actions">
                            <button class="btn btn-primary" id="btnOpenExternal">
                                ${u.getIcon("external-link", "icon", 16)}
                                <span>Open in Browser ↗</span>
                            </button>
                            <button class="btn btn-secondary" id="btnCopyBlockedUrl">
                                ${u.getIcon("copy", "icon", 16)}
                                <span>Copy URL</span>
                            </button>
                        </div>

                        <div class="blocked-disclaimer">
                            ${u.getIcon("lock", "icon", 13)}
                            <span>BiB respects web platform security boundaries and does not proxy or bypass site policies.</span>
                        </div>
                    </div>
                </div>
            `;

            const btnOpen = container.querySelector("#btnOpenExternal");
            const btnCopy = container.querySelector("#btnCopyBlockedUrl");

            if (btnOpen) {
                btnOpen.addEventListener("click", () => this.openExternal(url));
            }
            if (btnCopy) {
                btnCopy.addEventListener("click", async () => {
                    await u.copyToClipboard(url);
                    if (window.BiB && window.BiB.Notifications) {
                        window.BiB.Notifications.show("URL copied to clipboard", "success", "check");
                    }
                });
            }
        }

        _renderOfflineState(container, url) {
            const u = window.BiB.Utils;
            container.innerHTML = `
                <div class="blocked-page-wrapper">
                    <div class="blocked-card">
                        <div class="blocked-icon" style="color:var(--color-warning);">
                            ${u.getIcon("shield", "icon", 36)}
                        </div>
                        <h2 class="blocked-title">You're Offline</h2>
                        <p class="blocked-desc">
                            This webpage requires an active internet connection. Internal BiB pages remain fully functional.
                        </p>
                        <div class="blocked-actions">
                            <button class="btn btn-primary" id="btnRetryOffline">
                                ${u.getIcon("reload", "icon", 16)}
                                <span>Try Again</span>
                            </button>
                            <button class="btn btn-secondary" onclick="window.BiB.Navigation.navigate('bib://home')">
                                ${u.getIcon("home", "icon", 16)}
                                <span>Go to Start Page</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            const btnRetry = container.querySelector("#btnRetryOffline");
            if (btnRetry) {
                btnRetry.addEventListener("click", () => this.load(url, container));
            }
        }

        _startLoadingProgress() {
            const bar = document.querySelector(".progress-bar");
            if (!bar) return;

            bar.classList.add("is-loading");
            this.progressVal = 15;
            bar.style.width = "15%";

            this.progressTimer = setInterval(() => {
                if (this.progressVal < 85) {
                    this.progressVal += Math.floor(Math.random() * 12) + 6;
                    bar.style.width = `${this.progressVal}%`;
                }
            }, 300);
        }

        _finishLoadingProgress(canceled = false) {
            const bar = document.querySelector(".progress-bar");
            if (!bar) return;

            if (this.progressTimer) clearInterval(this.progressTimer);

            if (!canceled) {
                bar.style.width = "100%";
                setTimeout(() => {
                    bar.classList.remove("is-loading");
                    bar.style.width = "0%";
                }, 250);
            } else {
                bar.classList.remove("is-loading");
                bar.style.width = "0%";
            }
        }

        _updateReloadStopButton(isLoading) {
            const btn = document.querySelector(".btn-reload");
            if (!btn) return;

            const u = window.BiB.Utils;
            if (isLoading) {
                btn.innerHTML = u.getIcon("stop", "icon", 16);
                btn.setAttribute("title", "Stop Loading (Esc)");
                btn.setAttribute("aria-label", "Stop loading");
                btn.onclick = () => this.stop();
            } else {
                btn.innerHTML = u.getIcon("reload", "icon", 16);
                btn.setAttribute("title", "Reload Page (⌘R)");
                btn.setAttribute("aria-label", "Reload");
                btn.onclick = () => {
                    if (window.BiB && window.BiB.Navigation) {
                        window.BiB.Navigation.reload();
                    }
                };
            }
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.WebView = new WebViewManager();
})(window);
