/**
 * BiB 2.0 — Built-in Developer Tools
 * Elements, Console REPL, Simulated Network, Storage inspection, and Performance metrics
 */

"use strict";

(function (window) {
    class DeveloperToolsManager {
        constructor() {
            this.container = null;
        }

        init(containerEl) {
            this.container = containerEl;
            this.bindTabs();
            this.bindConsole();
            this.renderStorage();
        }

        bindTabs() {
            if (!this.container) return;
            const buttons = this.container.querySelectorAll(".dt-tab-btn");
            const panels = {
                console: this.container.querySelector("#dtPanelConsole"),
                elements: this.container.querySelector("#dtPanelElements"),
                network: this.container.querySelector("#dtPanelNetwork"),
                storage: this.container.querySelector("#dtPanelStorage"),
                performance: this.container.querySelector("#dtPanelPerformance")
            };

            buttons.forEach(btn => {
                btn.addEventListener("click", () => {
                    buttons.forEach(b => b.classList.remove("is-active"));
                    btn.classList.add("is-active");
                    const target = btn.getAttribute("data-panel");

                    Object.keys(panels).forEach(p => {
                        if (panels[p]) panels[p].style.display = p === target ? "block" : "none";
                    });

                    if (target === "elements") this.renderElements();
                    if (target === "storage") this.renderStorage();
                });
            });
        }

        bindConsole() {
            const input = this.container.querySelector("#terminalInput");
            const logBox = this.container.querySelector("#terminalLogs");
            if (!input || !logBox) return;

            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    const cmd = input.value.trim();
                    if (!cmd) return;

                    // Log user command
                    const userLine = document.createElement("div");
                    userLine.className = "terminal-line cmd";
                    userLine.textContent = `> ${cmd}`;
                    logBox.appendChild(userLine);

                    input.value = "";
                    this.executeCommand(cmd, logBox);
                    logBox.scrollTop = logBox.scrollHeight;
                }
            });
        }

        executeCommand(raw, logBox) {
            const parts = raw.split(" ");
            const cmd = parts[0].toLowerCase();
            const arg = parts.slice(1).join(" ");

            const print = (text, type = "info") => {
                const line = document.createElement("div");
                line.className = `terminal-line ${type}`;
                line.innerHTML = text;
                logBox.appendChild(line);
            };

            switch (cmd) {
                case "help":
                    print("Available Commands:<br>" +
                          "• <strong>tabs</strong> — List open tabs<br>" +
                          "• <strong>history</strong> — View recent history<br>" +
                          "• <strong>bookmarks</strong> — View bookmarks<br>" +
                          "• <strong>theme [light|dark|system]</strong> — Set theme<br>" +
                          "• <strong>whoami</strong> — Identity check<br>" +
                          "• <strong>sudo bib</strong> — Root permissions<br>" +
                          "• <strong>clear</strong> — Clear terminal screen");
                    break;
                case "tabs":
                    if (window.BiB && window.BiB.Tabs) {
                        const tabs = window.BiB.Tabs.tabs;
                        print(`Open tabs (${tabs.length}):`);
                        tabs.forEach((t, i) => print(`[${i + 1}] ${t.title} — ${t.url}`));
                    }
                    break;
                case "history":
                    if (window.BiB && window.BiB.History) {
                        window.BiB.History.getAll().then(list => {
                            print(`Recent history items (${list.length}):`);
                            list.slice(0, 5).forEach(h => print(`• ${h.title} (${h.url})`));
                        });
                    }
                    break;
                case "bookmarks":
                    if (window.BiB && window.BiB.Bookmarks) {
                        window.BiB.Bookmarks.getAll().then(list => {
                            print(`Saved bookmarks (${list.length}):`);
                            list.forEach(b => print(`★ ${b.title} (${b.url})`));
                        });
                    }
                    break;
                case "theme":
                    if (window.BiB && window.BiB.Themes && arg) {
                        window.BiB.Themes.setTheme(arg);
                        print(`Applied theme: ${arg}`, "success");
                    } else {
                        print("Usage: theme [light | dark | system]", "error");
                    }
                    break;
                case "whoami":
                    print("You are currently inside a browser inside another browser.", "success");
                    break;
                case "sudo":
                    if (arg === "bib") {
                        print("Nice try.<br>You already have root access.<br>You're inside a browser inside a browser.<br>What more do you want?", "info");
                    } else {
                        print(`sudo: ${arg}: command not recognized`, "error");
                    }
                    break;
                case "clear":
                    logBox.innerHTML = "";
                    break;
                default:
                    print(`bib: command not found: "${cmd}". Type "help" for a list of commands.`, "error");
                    break;
            }
        }

        renderElements() {
            const tree = this.container.querySelector("#domInspectorTree");
            if (!tree) return;
            const activePage = document.querySelector(".page-container");
            if (activePage) {
                tree.textContent = activePage.innerHTML.slice(0, 1800) + "\n... [truncated for display]";
            }
        }

        async renderStorage() {
            const wrap = this.container.querySelector("#storageTableWrap");
            if (!wrap) return;

            let rows = "";
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k.startsWith("bib_v2_")) {
                    const v = localStorage.getItem(k);
                    rows += `
                        <tr style="border-bottom:1px solid var(--color-border-subtle);">
                            <td style="padding:6px;font-weight:600;color:var(--color-accent);">${k}</td>
                            <td style="padding:6px;max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--color-text-secondary);">${v}</td>
                        </tr>
                    `;
                }
            }

            const histCount = await window.BiB.IndexedDB.count("history");
            const bmCount = await window.BiB.IndexedDB.count("bookmarks");
            const dlCount = await window.BiB.IndexedDB.count("downloads");

            wrap.innerHTML = `
                <div style="margin-bottom:14px;padding:10px;background:var(--color-surface-secondary);border-radius:var(--radius-md);font-size:12px;">
                    <strong>IndexedDB Stores:</strong> History: ${histCount} items | Bookmarks: ${bmCount} items | Downloads: ${dlCount} items
                </div>
                <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left;">
                    <tr style="border-bottom:1px solid var(--color-border);color:var(--color-text-tertiary);">
                        <th style="padding:6px;">localStorage Key</th><th>Value</th>
                    </tr>
                    ${rows || '<tr><td colspan="2" style="padding:10px;color:var(--color-text-tertiary);">No keys stored</td></tr>'}
                </table>
            `;
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.DeveloperTools = new DeveloperToolsManager();
})(window);
