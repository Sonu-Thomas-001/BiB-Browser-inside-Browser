/**
 * BiB 3.0 — Central Command Registry & Command Palette
 * Inspired by Raycast, macOS Spotlight, and Linear (Cmd/Ctrl + K)
 */

"use strict";

(function (window) {
    class CommandRegistry {
        constructor() {
            this.commands = [];
            this.paletteEl = null;
            this.inputEl = null;
            this.listEl = null;
            this.isOpen = false;
            this.selectedIndex = 0;
            this.filteredCommands = [];
            this._initDefaultCommands();
        }

        _initDefaultCommands() {
            const B = () => window.BiB;

            this.register([
                // Tabs
                {
                    id: "new-tab",
                    title: "New Tab",
                    subtitle: "Open a fresh browsing tab",
                    shortcut: "⌘T",
                    category: "Tabs",
                    icon: "plus",
                    action: () => B().Tabs && B().Tabs.createTab("bib://home")
                },
                {
                    id: "close-tab",
                    title: "Close Active Tab",
                    subtitle: "Close currently active tab",
                    shortcut: "⌘W",
                    category: "Tabs",
                    icon: "close",
                    action: () => B().Tabs && B().Tabs.closeTab(B().Tabs.activeTabId)
                },
                {
                    id: "reopen-tab",
                    title: "Reopen Closed Tab",
                    subtitle: "Restore recently closed tab",
                    shortcut: "⌘⇧T",
                    category: "Tabs",
                    icon: "reload",
                    action: () => B().Tabs && B().Tabs.restoreLastClosedTab && B().Tabs.restoreLastClosedTab()
                },
                {
                    id: "duplicate-tab",
                    title: "Duplicate Active Tab",
                    subtitle: "Clone current tab and its history",
                    shortcut: "⌘D",
                    category: "Tabs",
                    icon: "copy",
                    action: () => B().Tabs && B().Tabs.duplicateTab && B().Tabs.duplicateTab(B().Tabs.activeTabId)
                },
                {
                    id: "pin-tab",
                    title: "Toggle Pin Active Tab",
                    subtitle: "Pin or unpin tab to tab bar",
                    shortcut: "⌥P",
                    category: "Tabs",
                    icon: "pin",
                    action: () => B().Tabs && B().Tabs.togglePinTab && B().Tabs.togglePinTab(B().Tabs.activeTabId)
                },
                {
                    id: "search-tabs",
                    title: "Search Tabs",
                    subtitle: "Find and switch to any open tab",
                    shortcut: "⌘⇧A",
                    category: "Tabs",
                    icon: "tabs",
                    action: () => B().Tabs && B().Tabs.openTabSearch && B().Tabs.openTabSearch()
                },
                {
                    id: "toggle-mute",
                    title: "Toggle Tab Audio Mute",
                    subtitle: "Mute or unmute active tab sound",
                    shortcut: "⌥M",
                    category: "Tabs",
                    icon: "volume",
                    action: () => B().Tabs && B().Tabs.toggleMuteTab && B().Tabs.toggleMuteTab(B().Tabs.activeTabId)
                },

                // Navigation
                {
                    id: "focus-omnibox",
                    title: "Focus Address Bar",
                    subtitle: "Search or enter website URL",
                    shortcut: "⌘L",
                    category: "Navigation",
                    icon: "search",
                    action: () => {
                        const input = document.querySelector(".url-input");
                        if (input) { input.focus(); input.select(); }
                    }
                },
                {
                    id: "reload-page",
                    title: "Reload Page",
                    subtitle: "Refresh current page content",
                    shortcut: "⌘R",
                    category: "Navigation",
                    icon: "reload",
                    action: () => B().Navigation && B().Navigation.reload()
                },
                {
                    id: "go-home",
                    title: "Go to Start Page",
                    subtitle: "Navigate to bib://home",
                    shortcut: "⌥H",
                    category: "Navigation",
                    icon: "home",
                    action: () => B().Navigation && B().Navigation.navigate("bib://home")
                },
                {
                    id: "find-in-page",
                    title: "Find in Page",
                    subtitle: "Search text inside current page",
                    shortcut: "⌘F",
                    category: "Navigation",
                    icon: "find",
                    action: () => {
                        const findBar = document.querySelector(".find-bar");
                        if (findBar) {
                            findBar.classList.add("is-visible");
                            const input = findBar.querySelector(".find-input");
                            if (input) { input.focus(); input.select(); }
                        }
                    }
                },

                // Productivity & Views
                {
                    id: "split-view",
                    title: "Toggle Split View",
                    subtitle: "Browse two pages side-by-side",
                    shortcut: "⌥S",
                    category: "Productivity",
                    icon: "split",
                    action: () => B().SplitView && B().SplitView.toggle()
                },
                {
                    id: "reader-mode",
                    title: "Toggle Reader Mode",
                    subtitle: "Distraction-free reading view",
                    shortcut: "⌥R",
                    category: "Productivity",
                    icon: "reader",
                    action: () => B().Reader && B().Reader.toggle()
                },
                {
                    id: "reading-list-add",
                    title: "Add to Reading List",
                    subtitle: "Save current page to offline reading list",
                    shortcut: "⌥D",
                    category: "Productivity",
                    icon: "reading-list",
                    action: () => B().ReadingList && B().ReadingList.addCurrentPage()
                },
                {
                    id: "open-file",
                    title: "Open Local File",
                    subtitle: "View HTML, TXT, Markdown, JSON, Image, or PDF",
                    shortcut: "⌘O",
                    category: "Productivity",
                    icon: "file",
                    action: () => B().FileViewer && B().FileViewer.promptOpen()
                },
                {
                    id: "new-window",
                    title: "New BiB Mini Window",
                    subtitle: "Spawn a floating, draggable browser window",
                    shortcut: "⌘N",
                    category: "Productivity",
                    icon: "window",
                    action: () => B().WindowManager && B().WindowManager.createWindow()
                },

                // Library
                {
                    id: "open-history",
                    title: "Open History",
                    subtitle: "View and filter browsing history",
                    shortcut: "⌘Y",
                    category: "Library",
                    icon: "history",
                    action: () => B().Navigation && B().Navigation.navigate("bib://history")
                },
                {
                    id: "open-bookmarks",
                    title: "Open Bookmarks",
                    subtitle: "View saved bookmarks & folders",
                    shortcut: "⌘B",
                    category: "Library",
                    icon: "bookmark",
                    action: () => B().Navigation && B().Navigation.navigate("bib://bookmarks")
                },
                {
                    id: "open-reading-list",
                    title: "Open Reading List",
                    subtitle: "View saved articles to read",
                    shortcut: "⌘⇧L",
                    category: "Library",
                    icon: "reading-list",
                    action: () => B().Navigation && B().Navigation.navigate("bib://reading-list")
                },
                {
                    id: "open-downloads",
                    title: "Open Downloads",
                    subtitle: "View downloaded files & exports",
                    shortcut: "⌘J",
                    category: "Library",
                    icon: "download",
                    action: () => B().Navigation && B().Navigation.navigate("bib://downloads")
                },

                // System & Appearance
                {
                    id: "toggle-theme",
                    title: "Toggle Dark / Light Mode",
                    subtitle: "Switch between Apple Light & Monterey Dark appearance",
                    shortcut: "⌥T",
                    category: "System",
                    icon: "sun",
                    action: () => B().Themes && B().Themes.cycle()
                },
                {
                    id: "fullscreen",
                    title: "Toggle Fullscreen",
                    subtitle: "Enter or exit real browser fullscreen",
                    shortcut: "F11",
                    category: "System",
                    icon: "fullscreen",
                    action: () => B().Fullscreen && B().Fullscreen.toggle()
                },
                {
                    id: "share-page",
                    title: "Share Page",
                    subtitle: "Web Share API or copy URL",
                    shortcut: "⌥⇧S",
                    category: "System",
                    icon: "share",
                    action: () => B().Share && B().Share.shareCurrentPage()
                },
                {
                    id: "print-page",
                    title: "Print Page",
                    subtitle: "Open native print dialog with clean styling",
                    shortcut: "⌘P",
                    category: "System",
                    icon: "print",
                    action: () => window.print()
                },
                {
                    id: "open-settings",
                    title: "Open Settings",
                    subtitle: "Configure search engines, startup, and privacy",
                    shortcut: "⌘,",
                    category: "System",
                    icon: "settings",
                    action: () => B().Navigation && B().Navigation.navigate("bib://settings")
                },
                {
                    id: "clear-data",
                    title: "Clear Browsing Data",
                    subtitle: "Clear history, bookmarks, or reading list",
                    shortcut: "⌘⇧⌫",
                    category: "System",
                    icon: "trash",
                    action: () => B().Navigation && B().Navigation.navigate("bib://privacy")
                },

                // Developer & Diagnostics
                {
                    id: "open-devtools",
                    title: "Developer Tools",
                    subtitle: "Console REPL, DOM inspector, storage & worker",
                    shortcut: "⌥⌘I",
                    category: "Developer",
                    icon: "terminal",
                    action: () => B().Navigation && B().Navigation.navigate("bib://developer")
                },
                {
                    id: "open-diagnostics",
                    title: "Browser Diagnostics",
                    subtitle: "Real Web Platform capabilities & feature inspection",
                    shortcut: "⌥⌘D",
                    category: "Developer",
                    icon: "cpu",
                    action: () => B().Navigation && B().Navigation.navigate("bib://diagnostics")
                },
                {
                    id: "open-experiments",
                    title: "Browser Experiments & Flags",
                    subtitle: "Toggle experimental features & appearance settings",
                    shortcut: "⌥⌘X",
                    category: "Developer",
                    icon: "sparkles",
                    action: () => B().Navigation && B().Navigation.navigate("bib://experiments")
                },
                {
                    id: "open-about",
                    title: "About BiB",
                    subtitle: "Version, credits, and architecture overview",
                    shortcut: "",
                    category: "System",
                    icon: "info",
                    action: () => B().Navigation && B().Navigation.navigate("bib://about")
                }
            ]);
        }

        register(cmds) {
            if (Array.isArray(cmds)) {
                this.commands.push(...cmds);
            } else {
                this.commands.push(cmds);
            }
        }

        getCommands() {
            return this.commands;
        }

        find(id) {
            return this.commands.find(c => c.id === id);
        }

        execute(id) {
            const cmd = this.find(id);
            if (cmd && typeof cmd.action === "function") {
                this.closePalette();
                cmd.action();
                return true;
            }
            return false;
        }

        initPaletteUI() {
            if (document.querySelector(".command-palette-backdrop")) return;

            const u = window.BiB.Utils;
            const container = document.createElement("div");
            container.className = "command-palette-backdrop";
            container.style.display = "none";
            container.innerHTML = `
                <div class="command-palette-dialog" role="dialog" aria-modal="true" aria-label="Command Palette">
                    <div class="command-palette-header">
                        <span class="command-palette-icon">${u.getIcon("command", "icon", 16)}</span>
                        <input type="text" class="command-palette-input" placeholder="Type a command or search..." spellcheck="false" autocomplete="off" aria-label="Command search">
                        <span class="command-palette-esc">ESC</span>
                    </div>
                    <div class="command-palette-list" role="listbox"></div>
                    <div class="command-palette-footer">
                        <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
                        <span><kbd>↵</kbd> to select</span>
                        <span><kbd>esc</kbd> to close</span>
                    </div>
                </div>
            `;

            document.body.appendChild(container);
            this.paletteEl = container;
            this.inputEl = container.querySelector(".command-palette-input");
            this.listEl = container.querySelector(".command-palette-list");

            // Event Listeners
            this.inputEl.addEventListener("input", () => this._handleInput());
            this.inputEl.addEventListener("keydown", (e) => this._handleKeyDown(e));

            container.addEventListener("click", (e) => {
                if (e.target === container) this.closePalette();
            });

            const dialog = container.querySelector(".command-palette-dialog");
            dialog.addEventListener("click", (e) => {
                const item = e.target.closest(".command-item");
                if (item) {
                    const id = item.getAttribute("data-command-id");
                    if (id) this.execute(id);
                }
            });
        }

        openPalette() {
            this.initPaletteUI();
            this.isOpen = true;
            this.paletteEl.style.display = "flex";
            this.paletteEl.classList.add("is-open");
            this.inputEl.value = "";
            this.selectedIndex = 0;
            this._renderList(this.commands);
            setTimeout(() => this.inputEl.focus(), 50);
        }

        closePalette() {
            if (!this.isOpen) return;
            this.isOpen = false;
            if (this.paletteEl) {
                this.paletteEl.classList.remove("is-open");
                this.paletteEl.style.display = "none";
            }
        }

        togglePalette() {
            if (this.isOpen) this.closePalette();
            else this.openPalette();
        }

        _handleInput() {
            const query = this.inputEl.value.trim().toLowerCase();
            if (!query) {
                this.filteredCommands = this.commands;
            } else {
                this.filteredCommands = this.commands.filter(c => {
                    return c.title.toLowerCase().includes(query) ||
                           c.subtitle.toLowerCase().includes(query) ||
                           c.category.toLowerCase().includes(query) ||
                           c.id.toLowerCase().includes(query);
                });
            }
            this.selectedIndex = 0;
            this._renderList(this.filteredCommands);
        }

        _handleKeyDown(e) {
            if (e.key === "Escape") {
                e.preventDefault();
                this.closePalette();
                return;
            }

            if (e.key === "ArrowDown") {
                e.preventDefault();
                if (this.filteredCommands.length > 0) {
                    this.selectedIndex = (this.selectedIndex + 1) % this.filteredCommands.length;
                    this._updateSelection();
                }
                return;
            }

            if (e.key === "ArrowUp") {
                e.preventDefault();
                if (this.filteredCommands.length > 0) {
                    this.selectedIndex = (this.selectedIndex - 1 + this.filteredCommands.length) % this.filteredCommands.length;
                    this._updateSelection();
                }
                return;
            }

            if (e.key === "Enter") {
                e.preventDefault();
                const cmd = this.filteredCommands[this.selectedIndex];
                if (cmd) {
                    this.execute(cmd.id);
                }
            }
        }

        _updateSelection() {
            const items = this.listEl.querySelectorAll(".command-item");
            items.forEach((item, idx) => {
                const isSelected = idx === this.selectedIndex;
                item.classList.toggle("is-selected", isSelected);
                if (isSelected) {
                    item.scrollIntoView({ block: "nearest", behavior: "smooth" });
                }
            });
        }

        _renderList(commands) {
            this.filteredCommands = commands;
            if (commands.length === 0) {
                this.listEl.innerHTML = `
                    <div class="command-empty">
                        <span>No commands matching "${window.BiB.Utils.escapeHtml(this.inputEl.value)}"</span>
                    </div>
                `;
                return;
            }

            const u = window.BiB.Utils;
            // Group by category
            const categories = {};
            commands.forEach(c => {
                if (!categories[c.category]) categories[c.category] = [];
                categories[c.category].push(c);
            });

            let html = "";
            let globalIndex = 0;

            for (const [catName, catCmds] of Object.entries(categories)) {
                html += `<div class="command-category-title">${catName}</div>`;
                for (const cmd of catCmds) {
                    const isSelected = globalIndex === this.selectedIndex;
                    html += `
                        <div class="command-item ${isSelected ? 'is-selected' : ''}" data-command-id="${cmd.id}" role="option" aria-selected="${isSelected}">
                            <span class="command-item-icon">${u.getIcon(cmd.icon || "command", "icon", 16)}</span>
                            <div class="command-item-info">
                                <span class="command-item-title">${u.escapeHtml(cmd.title)}</span>
                                <span class="command-item-sub">${u.escapeHtml(cmd.subtitle)}</span>
                            </div>
                            ${cmd.shortcut ? `<span class="command-item-shortcut">${cmd.shortcut}</span>` : ""}
                        </div>
                    `;
                    globalIndex++;
                }
            }

            this.listEl.innerHTML = html;
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Commands = new CommandRegistry();
})(window);
