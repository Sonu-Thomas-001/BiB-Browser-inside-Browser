/**
 * BiB 3.0 — Local File System Viewer
 * Uses standard HTML File API to load, inspect, and render local files (HTML, TXT, MD, JSON, Images, PDF)
 */

"use strict";

(function (window) {
    class FileViewerManager {
        constructor() {
            this.loadedFiles = new Map(); // url -> { name, type, size, content, blobUrl }
            this.imageRotation = 0;
            this.imageZoom = 100;
        }

        promptOpen() {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".html,.htm,.txt,.md,.json,.png,.jpg,.jpeg,.gif,.svg,.webp,.pdf";
            input.style.display = "none";
            document.body.appendChild(input);

            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.loadFile(file);
                }
                document.body.removeChild(input);
            };

            input.click();
        }

        async loadFile(file) {
            const u = window.BiB.Utils;
            const virtualUrl = `file://local/${encodeURIComponent(file.name)}`;
            const isImage = file.type.startsWith("image/");
            const isPdf = file.type === "application/pdf";
            let content = null;
            let blobUrl = URL.createObjectURL(file);

            if (!isImage && !isPdf) {
                content = await file.text();
            }

            this.loadedFiles.set(virtualUrl, {
                name: file.name,
                type: file.type || "text/plain",
                size: file.size,
                lastModified: file.lastModified,
                content,
                blobUrl
            });

            // Create or navigate to tab
            const existingTab = window.BiB.Tabs.tabs.find(t => t.url === virtualUrl);
            if (existingTab) {
                window.BiB.Tabs.switchTab(existingTab.id);
            } else {
                window.BiB.Tabs.createTab(virtualUrl, true);
            }

            if (window.BiB.Notifications) {
                window.BiB.Notifications.show(`Opened file: ${file.name} (${u.formatBytes(file.size)})`, "success", "file");
            }
        }

        render(virtualUrl, container) {
            const fileData = this.loadedFiles.get(virtualUrl);
            const u = window.BiB.Utils;

            if (!fileData) {
                container.innerHTML = `
                    <div class="file-viewer-wrapper">
                        <div class="file-empty-card">
                            <span class="file-empty-icon">${u.getIcon("file", "icon", 40)}</span>
                            <h3>No File Loaded</h3>
                            <p>Open a local HTML, Markdown, JSON, Image, or Text file.</p>
                            <button class="btn btn-primary" onclick="window.BiB.FileViewer.promptOpen()">
                                ${u.getIcon("upload", "icon", 16)}
                                <span>Choose Local File...</span>
                            </button>
                        </div>
                    </div>
                `;
                return;
            }

            const { name, type, size, content, blobUrl } = fileData;
            const ext = name.split(".").pop().toLowerCase();

            // 1. IMAGE VIEWER
            if (type.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext)) {
                this.imageZoom = 100;
                this.imageRotation = 0;
                container.innerHTML = `
                    <div class="image-viewer-container">
                        <div class="image-toolbar">
                            <span class="image-filename">${u.escapeHtml(name)} <small>(${u.formatBytes(size)})</small></span>
                            <div class="image-toolbar-actions">
                                <button class="btn-icon" id="btnImgZoomOut" title="Zoom Out (–)">${u.getIcon("chevron-down", "icon", 14)}</button>
                                <span class="image-zoom-val" id="imgZoomVal">100%</span>
                                <button class="btn-icon" id="btnImgZoomIn" title="Zoom In (+)">${u.getIcon("chevron-up", "icon", 14)}</button>
                                <button class="btn-icon" id="btnImgFit" title="Fit to View">Fit</button>
                                <button class="btn-icon" id="btnImgRotate" title="Rotate 90°">${u.getIcon("reload", "icon", 14)}</button>
                                <button class="btn-icon" id="btnImgDl" title="Download Image">${u.getIcon("download", "icon", 14)}</button>
                            </div>
                        </div>
                        <div class="image-canvas-wrapper">
                            <img src="${blobUrl}" alt="${u.escapeHtml(name)}" class="viewer-img" id="viewerTargetImg">
                        </div>
                    </div>
                `;

                this._bindImageViewer(container, blobUrl, name);
                return;
            }

            // 2. JSON VIEWER
            if (ext === "json" || type === "application/json") {
                let formattedJson = content;
                try {
                    const parsed = JSON.parse(content);
                    formattedJson = JSON.stringify(parsed, null, 2);
                } catch (e) {}

                container.innerHTML = `
                    <div class="document-viewer-container">
                        <div class="doc-header">
                            <span class="doc-badge">JSON Document</span>
                            <span class="doc-name">${u.escapeHtml(name)}</span>
                            <span class="doc-size">${u.formatBytes(size)}</span>
                        </div>
                        <div class="doc-code-block">
                            <pre><code>${u.escapeHtml(formattedJson)}</code></pre>
                        </div>
                    </div>
                `;
                return;
            }

            // 3. HTML VIEWER
            if (ext === "html" || ext === "htm") {
                container.innerHTML = `
                    <div class="html-viewer-container">
                        <div class="doc-header">
                            <span class="doc-badge">Local HTML</span>
                            <span class="doc-name">${u.escapeHtml(name)}</span>
                        </div>
                        <iframe class="html-viewer-frame" sandbox="allow-scripts" srcdoc="${u.escapeHtml(content)}" title="Local HTML View"></iframe>
                    </div>
                `;
                return;
            }

            // 4. MARKDOWN & PLAIN TEXT
            container.innerHTML = `
                <div class="document-viewer-container">
                    <div class="doc-header">
                        <span class="doc-badge">${ext.toUpperCase()} Text</span>
                        <span class="doc-name">${u.escapeHtml(name)}</span>
                        <span class="doc-size">${u.formatBytes(size)}</span>
                    </div>
                    <div class="doc-text-body">
                        <pre>${u.escapeHtml(content)}</pre>
                    </div>
                </div>
            `;
        }

        _bindImageViewer(container, blobUrl, name) {
            const img = container.querySelector("#viewerTargetImg");
            const zoomVal = container.querySelector("#imgZoomVal");
            const btnIn = container.querySelector("#btnImgZoomIn");
            const btnOut = container.querySelector("#btnImgZoomOut");
            const btnFit = container.querySelector("#btnImgFit");
            const btnRot = container.querySelector("#btnImgRotate");
            const btnDl = container.querySelector("#btnImgDl");

            const updateTransform = () => {
                if (img) {
                    img.style.transform = `scale(${this.imageZoom / 100}) rotate(${this.imageRotation}deg)`;
                }
                if (zoomVal) {
                    zoomVal.textContent = `${this.imageZoom}%`;
                }
            };

            if (btnIn) btnIn.onclick = () => { this.imageZoom = Math.min(400, this.imageZoom + 25); updateTransform(); };
            if (btnOut) btnOut.onclick = () => { this.imageZoom = Math.max(25, this.imageZoom - 25); updateTransform(); };
            if (btnFit) btnFit.onclick = () => { this.imageZoom = 100; this.imageRotation = 0; updateTransform(); };
            if (btnRot) btnRot.onclick = () => { this.imageRotation = (this.imageRotation + 90) % 360; updateTransform(); };
            if (btnDl) btnDl.onclick = () => {
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = name;
                a.click();
            };
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.FileViewer = new FileViewerManager();
})(window);
