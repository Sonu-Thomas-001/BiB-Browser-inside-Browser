/**
 * BiB 2.0 — Context Menu Manager
 * Clean right-click menus for tabs, links, and webpage viewports
 */

"use strict";

(function (window) {
    class ContextMenuManager {
        constructor() {
            this.menu = null;
            this.init();
        }

        init() {
            this.createMenu();
            document.addEventListener("contextmenu", (e) => this.handleContextMenu(e));
            document.addEventListener("click", () => this.hide());
            window.addEventListener("bib:close-overlays", () => this.hide());
        }

        createMenu() {
            this.menu = document.createElement("div");
            this.menu.className = "context-menu";
            document.body.appendChild(this.menu);
        }

        handleContextMenu(e) {
            const browserWindow = e.target.closest(".browser-window");
            if (!browserWindow) return; // Allow native context menu outside BiB

            e.preventDefault();

            const tabEl = e.target.closest(".tab");
            const linkEl = e.target.closest("a") || e.target.closest("[data-href]");

            if (tabEl) {
                this.renderTabMenu(tabEl);
            } else if (linkEl) {
                this.renderLinkMenu(linkEl);
            } else {
                this.renderPageMenu();
            }

            this.show(e.clientX, e.clientY);
        }

        renderTabMenu(tabEl) {
            const tabId = tabEl.getAttribute("data-tab-id");
            const tab = window.BiB && window.BiB.Tabs ? window.BiB.Tabs.getTab(tabId) : null;
            const isPinned = tab ? tab.isPinned : false;

            const u = window.BiB.Utils;
            this.menu.innerHTML = `
                <button class="menu-item" data-action="new-tab">
                    <span class="menu-left">${u.getIcon("plus")} New Tab</span>
                    <span class="menu-shortcut">⌘T</span>
                </button>
                <button class="menu-item" data-action="duplicate-tab" data-tab-id="${tabId}">
                    <span class="menu-left">${u.getIcon("copy")} Duplicate Tab</span>
                </button>
                <button class="menu-item" data-action="reload-tab" data-tab-id="${tabId}">
                    <span class="menu-left">${u.getIcon("reload")} Reload</span>
                    <span class="menu-shortcut">⌘R</span>
                </button>
                <button class="menu-item" data-action="toggle-pin" data-tab-id="${tabId}">
                    <span class="menu-left">${u.getIcon("bookmark")} ${isPinned ? "Unpin Tab" : "Pin Tab"}</span>
                </button>
                <div class="menu-divider"></div>
                <button class="menu-item" data-action="close-tab" data-tab-id="${tabId}">
                    <span class="menu-left">${u.getIcon("close")} Close Tab</span>
                    <span class="menu-shortcut">⌘W</span>
                </button>
                <button class="menu-item" data-action="close-others" data-tab-id="${tabId}">
                    <span class="menu-left">${u.getIcon("close")} Close Other Tabs</span>
                </button>
                <button class="menu-item" data-action="close-right" data-tab-id="${tabId}">
                    <span class="menu-left">${u.getIcon("arrow-right")} Close Tabs to Right</span>
                </button>
            `;
            this.bindActions();
        }

        renderLinkMenu(linkEl) {
            const href = linkEl.getAttribute("href") || linkEl.getAttribute("data-href");
            const u = window.BiB.Utils;
            this.menu.innerHTML = `
                <button class="menu-item" data-action="open-link" data-url="${href}">
                    <span class="menu-left">${u.getIcon("external-link")} Open Link</span>
                </button>
                <button class="menu-item" data-action="open-link-new-tab" data-url="${href}">
                    <span class="menu-left">${u.getIcon("plus")} Open in New Tab</span>
                </button>
                <div class="menu-divider"></div>
                <button class="menu-item" data-action="copy-link" data-url="${href}">
                    <span class="menu-left">${u.getIcon("copy")} Copy Link Address</span>
                </button>
                <button class="menu-item" data-action="bookmark-link" data-url="${href}">
                    <span class="menu-left">${u.getIcon("star")} Bookmark Link</span>
                </button>
            `;
            this.bindActions();
        }

        renderPageMenu() {
            const u = window.BiB.Utils;
            this.menu.innerHTML = `
                <button class="menu-item" data-action="nav-back">
                    <span class="menu-left">${u.getIcon("arrow-left")} Back</span>
                    <span class="menu-shortcut">Alt+←</span>
                </button>
                <button class="menu-item" data-action="nav-forward">
                    <span class="menu-left">${u.getIcon("arrow-right")} Forward</span>
                    <span class="menu-shortcut">Alt+→</span>
                </button>
                <button class="menu-item" data-action="nav-reload">
                    <span class="menu-left">${u.getIcon("reload")} Reload</span>
                    <span class="menu-shortcut">⌘R</span>
                </button>
                <div class="menu-divider"></div>
                <button class="menu-item" data-action="save-page">
                    <span class="menu-left">${u.getIcon("download")} Save Page As...</span>
                </button>
                <button class="menu-item" data-action="print-page">
                    <span class="menu-left">${u.getIcon("print")} Print</span>
                    <span class="menu-shortcut">⌘P</span>
                </button>
                <button class="menu-item" data-action="view-source">
                    <span class="menu-left">${u.getIcon("terminal")} View Source</span>
                </button>
                <button class="menu-item" data-action="inspect">
                    <span class="menu-left">${u.getIcon("settings")} Inspect Element</span>
                </button>
            `;
            this.bindActions();
        }

        bindActions() {
            this.menu.querySelectorAll(".menu-item").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const action = btn.getAttribute("data-action");
                    const tabId = btn.getAttribute("data-tab-id");
                    const url = btn.getAttribute("data-url");
                    this.executeAction(action, { tabId, url });
                    this.hide();
                });
            });
        }

        executeAction(action, data) {
            const tabs = window.BiB.Tabs;
            const nav = window.BiB.Navigation;

            switch (action) {
                case "new-tab":
                    if (tabs) tabs.createTab("bib://home");
                    break;
                case "duplicate-tab":
                    if (tabs) tabs.duplicateTab(data.tabId);
                    break;
                case "reload-tab":
                    if (tabs) tabs.switchTab(data.tabId);
                    if (nav) nav.reload();
                    break;
                case "toggle-pin":
                    if (tabs) tabs.togglePin(data.tabId);
                    break;
                case "close-tab":
                    if (tabs) tabs.closeTab(data.tabId);
                    break;
                case "close-others":
                    if (tabs) tabs.closeOthers(data.tabId);
                    break;
                case "close-right":
                    if (tabs) tabs.closeRight(data.tabId);
                    break;
                case "open-link":
                    if (nav && data.url) nav.navigate(data.url);
                    break;
                case "open-link-new-tab":
                    if (tabs && data.url) tabs.createTab(data.url);
                    break;
                case "copy-link":
                    if (data.url) window.BiB.Utils.copyToClipboard(data.url);
                    break;
                case "bookmark-link":
                    if (data.url && window.BiB.Bookmarks) {
                        window.BiB.Bookmarks.toggleBookmark({ title: data.url, url: data.url });
                    }
                    break;
                case "nav-back":
                    if (nav) nav.back();
                    break;
                case "nav-forward":
                    if (nav) nav.forward();
                    break;
                case "nav-reload":
                    if (nav) nav.reload();
                    break;
                case "save-page":
                    const active = tabs ? tabs.getActiveTab() : null;
                    if (active && window.BiB.Downloads) {
                        const content = document.querySelector(".page-container") ? document.querySelector(".page-container").innerHTML : "";
                        window.BiB.Downloads.exportFile(content, `${active.title || "page"}.html`, "text/html");
                    }
                    break;
                case "print-page":
                    window.print();
                    break;
                case "view-source":
                    if (window.BiB.Browser) window.BiB.Browser.showViewSource();
                    break;
                case "inspect":
                    if (tabs) tabs.createTab("bib://developer");
                    break;
            }
        }

        show(x, y) {
            this.menu.classList.add("is-visible");
            const rect = this.menu.getBoundingClientRect();
            let posX = x;
            let posY = y;

            if (posX + rect.width > window.innerWidth) {
                posX = window.innerWidth - rect.width - 8;
            }
            if (posY + rect.height > window.innerHeight) {
                posY = window.innerHeight - rect.height - 8;
            }

            this.menu.style.left = `${posX}px`;
            this.menu.style.top = `${posY}px`;
        }

        hide() {
            if (this.menu) {
                this.menu.classList.remove("is-visible");
            }
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.ContextMenu = new ContextMenuManager();
})(window);
