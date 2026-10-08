/**
 * BiB 3.0 — Split View Manager
 * Side-by-side browsing with draggable divider, presets (50/50, 30/70, 70/30), and independent pane state
 */

"use strict";

(function (window) {
    class SplitViewManager {
        constructor() {
            this.isActive = false;
            this.ratio = 50; // percentage
            this.leftTabId = null;
            this.rightTabId = null;
            this.activePane = "left"; // "left" or "right"
            this.container = null;
            this.isDragging = false;
        }

        toggle() {
            if (this.isActive) this.disable();
            else this.enable();
        }

        enable(secondaryUrl = "bib://developer") {
            const tabs = window.BiB.Tabs.tabs;
            if (tabs.length === 0) return;

            this.isActive = true;
            this.leftTabId = window.BiB.Tabs.activeTabId;

            // Pick another tab or create one for right pane
            const otherTab = tabs.find(t => t.id !== this.leftTabId);
            if (otherTab) {
                this.rightTabId = otherTab.id;
            } else {
                const newTab = window.BiB.Tabs.createTab(secondaryUrl, false);
                this.rightTabId = newTab.id;
            }

            this.renderSplitUI();
            if (window.BiB && window.BiB.Notifications) {
                window.BiB.Notifications.show("Split View active (50/50)", "info", "split");
            }
        }

        disable() {
            if (!this.isActive) return;
            this.isActive = false;
            const viewport = document.querySelector(".viewport");
            if (viewport) {
                viewport.classList.remove("has-split-view");
                const splitContainer = viewport.querySelector(".split-view-container");
                if (splitContainer) splitContainer.remove();
            }

            if (window.BiB && window.BiB.Browser) {
                window.BiB.Browser.renderCurrentTab();
            }
        }

        setPreset(ratio) {
            this.ratio = Math.max(20, Math.min(80, ratio));
            const leftPane = document.querySelector(".split-pane-left");
            const rightPane = document.querySelector(".split-pane-right");
            if (leftPane && rightPane) {
                leftPane.style.flex = `0 0 ${this.ratio}%`;
                rightPane.style.flex = `0 0 ${100 - this.ratio}%`;
            }
        }

        renderSplitUI() {
            const viewport = document.querySelector(".viewport");
            if (!viewport) return;

            viewport.classList.add("has-split-view");
            let splitContainer = viewport.querySelector(".split-view-container");

            if (!splitContainer) {
                splitContainer = document.createElement("div");
                splitContainer.className = "split-view-container";
                viewport.appendChild(splitContainer);
            }

            const u = window.BiB.Utils;
            splitContainer.innerHTML = `
                <div class="split-pane split-pane-left ${this.activePane === 'left' ? 'is-active-pane' : ''}" style="flex: 0 0 ${this.ratio}%;">
                    <div class="split-pane-header">
                        <span class="split-pane-title">Primary View</span>
                        <div class="split-pane-controls">
                            <button class="btn-icon split-swap-btn" title="Swap Panes">${u.getIcon("reload", "icon", 13)}</button>
                        </div>
                    </div>
                    <div class="split-pane-content" id="splitPaneLeftContent"></div>
                </div>

                <div class="split-divider" title="Drag to resize split panes">
                    <div class="split-divider-handle"></div>
                </div>

                <div class="split-pane split-pane-right ${this.activePane === 'right' ? 'is-active-pane' : ''}" style="flex: 0 0 ${100 - this.ratio}%;">
                    <div class="split-pane-header">
                        <span class="split-pane-title">Secondary View</span>
                        <div class="split-pane-controls">
                            <button class="btn-icon split-close-btn" title="Close Split View">${u.getIcon("close", "icon", 13)}</button>
                        </div>
                    </div>
                    <div class="split-pane-content" id="splitPaneRightContent"></div>
                </div>
            `;

            // Bind divider drag
            this._bindDividerDrag(splitContainer);

            // Bind pane controls
            const swapBtn = splitContainer.querySelector(".split-swap-btn");
            const closeBtn = splitContainer.querySelector(".split-close-btn");

            if (swapBtn) swapBtn.addEventListener("click", () => this.swapPanes());
            if (closeBtn) closeBtn.addEventListener("click", () => this.disable());

            // Click pane to focus
            const leftPane = splitContainer.querySelector(".split-pane-left");
            const rightPane = splitContainer.querySelector(".split-pane-right");

            if (leftPane) {
                leftPane.addEventListener("click", () => {
                    this.activePane = "left";
                    leftPane.classList.add("is-active-pane");
                    if (rightPane) rightPane.classList.remove("is-active-pane");
                    if (window.BiB.Tabs) window.BiB.Tabs.switchTab(this.leftTabId);
                });
            }

            if (rightPane) {
                rightPane.addEventListener("click", () => {
                    this.activePane = "right";
                    rightPane.classList.add("is-active-pane");
                    if (leftPane) leftPane.classList.remove("is-active-pane");
                });
            }

            // Render contents in both panes
            this._renderPaneContents();
        }

        swapPanes() {
            const temp = this.leftTabId;
            this.leftTabId = this.rightTabId;
            this.rightTabId = temp;
            this._renderPaneContents();
        }

        _renderPaneContents() {
            const leftContainer = document.getElementById("splitPaneLeftContent");
            const rightContainer = document.getElementById("splitPaneRightContent");

            const leftTab = window.BiB.Tabs.getTab(this.leftTabId) || window.BiB.Tabs.getActiveTab();
            const rightTab = window.BiB.Tabs.getTab(this.rightTabId) || window.BiB.Tabs.tabs[1] || leftTab;

            if (leftContainer && leftTab) {
                window.BiB.Renderer.render(leftTab, leftContainer);
            }
            if (rightContainer && rightTab) {
                window.BiB.Renderer.render(rightTab, rightContainer);
            }
        }

        _bindDividerDrag(container) {
            const divider = container.querySelector(".split-divider");
            const leftPane = container.querySelector(".split-pane-left");
            const rightPane = container.querySelector(".split-pane-right");

            if (!divider) return;

            const onMouseMove = (e) => {
                if (!this.isDragging) return;
                const rect = container.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const percentage = (offsetX / rect.width) * 100;
                this.ratio = Math.max(20, Math.min(80, percentage));

                leftPane.style.flex = `0 0 ${this.ratio}%`;
                rightPane.style.flex = `0 0 ${100 - this.ratio}%`;
            };

            const onMouseUp = () => {
                if (this.isDragging) {
                    this.isDragging = false;
                    document.body.classList.remove("is-resizing-split");
                    window.removeEventListener("mousemove", onMouseMove);
                    window.removeEventListener("mouseup", onMouseUp);
                }
            };

            divider.addEventListener("mousedown", (e) => {
                e.preventDefault();
                this.isDragging = true;
                document.body.classList.add("is-resizing-split");
                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
            });
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.SplitView = new SplitViewManager();
})(window);
