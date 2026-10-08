/**
 * BiB 3.0 — Multi-Window Manager
 * Draggable, resizable internal floating browser windows and Picture-in-Picture tab simulation
 */

"use strict";

(function (window) {
    class WindowManager {
        constructor() {
            this.windows = [];
            this.activeWindowId = null;
            this.nextZIndex = 1100;
            this.container = null;
        }

        init() {
            let container = document.querySelector(".floating-windows-layer");
            if (!container) {
                container = document.createElement("div");
                container.className = "floating-windows-layer";
                document.body.appendChild(container);
            }
            this.container = container;
        }

        createWindow(url = "bib://developer", title = "Mini BiB Window") {
            this.init();
            const id = `win_${Date.now()}`;
            const u = window.BiB.Utils;

            const winObj = {
                id,
                url,
                title,
                x: 80 + (this.windows.length * 30),
                y: 80 + (this.windows.length * 30),
                width: 580,
                height: 420,
                isMinimized: false,
                isMaximized: false
            };

            this.windows.push(winObj);

            const winEl = document.createElement("div");
            winEl.className = "bib-mini-window";
            winEl.id = id;
            winEl.style.left = `${winObj.x}px`;
            winEl.style.top = `${winObj.y}px`;
            winEl.style.width = `${winObj.width}px`;
            winEl.style.height = `${winObj.height}px`;
            winEl.style.zIndex = ++this.nextZIndex;

            winEl.innerHTML = `
                <div class="mini-window-header">
                    <div class="mini-traffic-lights">
                        <span class="mini-traffic-dot close" title="Close Window"></span>
                        <span class="mini-traffic-dot min" title="Minimize Window"></span>
                        <span class="mini-traffic-dot max" title="Maximize Window"></span>
                    </div>
                    <span class="mini-window-title">${u.escapeHtml(title)}</span>
                    <div class="mini-window-url-badge">${u.escapeHtml(url)}</div>
                </div>
                <div class="mini-window-content"></div>
                <div class="mini-window-resize-handle"></div>
            `;

            this.container.appendChild(winEl);
            this._bindWindowEvents(winEl, winObj);

            // Render content
            const contentEl = winEl.querySelector(".mini-window-content");
            const tempTab = { id: `tab_${id}`, url, title, isReaderMode: false, zoom: 100 };
            if (window.BiB.Renderer) {
                window.BiB.Renderer.render(tempTab, contentEl);
            }

            this.focusWindow(id);
            if (window.BiB.Notifications) {
                window.BiB.Notifications.show(`Spawned mini-window: ${url}`, "info", "window");
            }
            return winObj;
        }

        closeWindow(id) {
            const idx = this.windows.findIndex(w => w.id === id);
            if (idx === -1) return;
            this.windows.splice(idx, 1);
            const el = document.getElementById(id);
            if (el) el.remove();
        }

        focusWindow(id) {
            this.activeWindowId = id;
            const el = document.getElementById(id);
            if (el) {
                el.style.zIndex = ++this.nextZIndex;
                document.querySelectorAll(".bib-mini-window").forEach(w => w.classList.remove("is-focused"));
                el.classList.add("is-focused");
            }
        }

        toggleMaximize(id) {
            const win = this.windows.find(w => w.id === id);
            const el = document.getElementById(id);
            if (!win || !el) return;

            win.isMaximized = !win.isMaximized;
            if (win.isMaximized) {
                el.classList.add("is-maximized");
            } else {
                el.classList.remove("is-maximized");
            }
        }

        _bindWindowEvents(winEl, winObj) {
            const header = winEl.querySelector(".mini-window-header");
            const closeBtn = winEl.querySelector(".mini-traffic-dot.close");
            const maxBtn = winEl.querySelector(".mini-traffic-dot.max");
            const minBtn = winEl.querySelector(".mini-traffic-dot.min");
            const resizeHandle = winEl.querySelector(".mini-window-resize-handle");

            // Focus on mousedown
            winEl.addEventListener("mousedown", () => this.focusWindow(winObj.id));

            // Controls
            if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); this.closeWindow(winObj.id); };
            if (maxBtn) maxBtn.onclick = (e) => { e.stopPropagation(); this.toggleMaximize(winObj.id); };
            if (minBtn) minBtn.onclick = (e) => {
                e.stopPropagation();
                winEl.classList.toggle("is-minimized");
            };

            // Draggable
            let isDragging = false;
            let startX, startY, origLeft, origTop;

            header.addEventListener("mousedown", (e) => {
                if (e.target.closest(".mini-traffic-dot")) return;
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                origLeft = winEl.offsetLeft;
                origTop = winEl.offsetTop;

                const onMouseMove = (ev) => {
                    if (!isDragging || winObj.isMaximized) return;
                    const dx = ev.clientX - startX;
                    const dy = ev.clientY - startY;
                    winEl.style.left = `${Math.max(10, origLeft + dx)}px`;
                    winEl.style.top = `${Math.max(10, origTop + dy)}px`;
                };

                const onMouseUp = () => {
                    isDragging = false;
                    window.removeEventListener("mousemove", onMouseMove);
                    window.removeEventListener("mouseup", onMouseUp);
                };

                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
            });

            // Resizable
            let isResizing = false;
            let initW, initH, initX, initY;

            resizeHandle.addEventListener("mousedown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                isResizing = true;
                initW = winEl.offsetWidth;
                initH = winEl.offsetHeight;
                initX = e.clientX;
                initY = e.clientY;

                const onResizeMove = (ev) => {
                    if (!isResizing || winObj.isMaximized) return;
                    const nw = Math.max(320, initW + (ev.clientX - initX));
                    const nh = Math.max(200, initH + (ev.clientY - initY));
                    winEl.style.width = `${nw}px`;
                    winEl.style.height = `${nh}px`;
                };

                const onResizeUp = () => {
                    isResizing = false;
                    window.removeEventListener("mousemove", onResizeMove);
                    window.removeEventListener("mouseup", onResizeUp);
                };

                window.addEventListener("mousemove", onResizeMove);
                window.addEventListener("mouseup", onResizeUp);
            });
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.WindowManager = new WindowManager();
})(window);
