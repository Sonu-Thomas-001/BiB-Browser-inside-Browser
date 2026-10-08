/**
 * BiB 2.0 — Browser inside Browser
 * Utility Functions & SVG Icon System
 * Strict mode, zero external libraries.
 */

"use strict";

(function (window) {
    // SF Symbols / Apple-inspired SVG Icon Registry (16x16 / 20x20 viewBox, 1.75 stroke-width)
    const ICONS = {
        "arrow-left": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12.5 15L7.5 10L12.5 5"/></svg>',
        "arrow-right": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 15L12.5 10L7.5 5"/></svg>',
        "reload": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 4V8H12.5"/><path d="M3.5 16V12H7.5"/><path d="M5.5 8A6 6 0 0 1 15.5 6.5L16.5 8"/><path d="M14.5 12A6 6 0 0 1 4.5 13.5L3.5 12"/></svg>',
        "plus": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4V16M4 10H16"/></svg>',
        "close": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6L6 14M6 6L14 14"/></svg>',
        "search": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="5.5"/><path d="M13.5 13.5L17 17"/></svg>',
        "star": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="10 2.5 12.3 7.3 17.5 8 13.7 11.7 14.6 17 10 14.5 5.4 17 6.3 11.7 2.5 8 7.7 7.3 10 2.5"/></svg>',
        "star-filled": '<svg viewBox="0 0 20 20" fill="currentColor"><polygon points="10 2.5 12.3 7.3 17.5 8 13.7 11.7 14.6 17 10 14.5 5.4 17 6.3 11.7 2.5 8 7.7 7.3 10 2.5"/></svg>',
        "bookmark": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4C5 2.9 5.9 2 7 2H13C14.1 2 15 2.9 15 4V18L10 14.5L5 18V4Z"/></svg>',
        "settings": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="3"/><path d="M16.2 12.4A1.2 1.2 0 0 0 17 13.5L17.5 14.3A1.4 1.4 0 0 1 16.1 16.2L15.2 16A1.2 1.2 0 0 0 13.9 16.6L13.5 17.4A1.4 1.4 0 0 1 11.2 18H10.8A1.4 1.4 0 0 1 8.5 17.4L8.1 16.6A1.2 1.2 0 0 0 6.8 16L5.9 16.2A1.4 1.4 0 0 1 4.5 14.3L5 13.5A1.2 1.2 0 0 0 4.8 12.4L4.1 11.8A1.4 1.4 0 0 1 4.1 9.2L4.8 8.6A1.2 1.2 0 0 0 5 7.5L4.5 6.7A1.4 1.4 0 0 1 5.9 4.8L6.8 5A1.2 1.2 0 0 0 8.1 4.4L8.5 3.6A1.4 1.4 0 0 1 10.8 3H11.2A1.4 1.4 0 0 1 13.5 3.6L13.9 4.4A1.2 1.2 0 0 0 15.2 5L16.1 4.8A1.4 1.4 0 0 1 17.5 6.7L17 7.5A1.2 1.2 0 0 0 16.2 8.6L16.9 9.2A1.4 1.4 0 0 1 16.9 11.8L16.2 12.4Z"/></svg>',
        "download": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3V13M10 13L6.5 9.5M10 13L13.5 9.5M4 17H16"/></svg>',
        "history": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><polyline points="10 6 10 10 13 12"/></svg>',
        "share": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="5" r="2.5"/><circle cx="5" cy="10" r="2.5"/><circle cx="15" cy="15" r="2.5"/><line x1="7.2" y1="8.9" x2="12.8" y2="6.1"/><line x1="7.2" y1="11.1" x2="12.8" y2="13.9"/></svg>',
        "print": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7V3H15V7"/><path d="M5 14H4C2.9 14 2 13.1 2 12V9C2 7.9 2.9 7 4 7H16C17.1 7 18 7.9 18 9V12C18 13.1 17.1 14 16 14H15"/><rect x="5" y="11" width="10" height="6" rx="1"/></svg>',
        "more": '<svg viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="1.5"/><circle cx="5" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/></svg>',
        "folder": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 5.5C2.5 4.4 3.4 3.5 4.5 3.5H7.5L9.5 6H15.5C16.6 6 17.5 6.9 17.5 8V14.5C17.5 15.6 16.6 16.5 15.5 16.5H4.5C3.4 16.5 2.5 15.6 2.5 14.5V5.5Z"/></svg>',
        "lock": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="8.5" width="11" height="8.5" rx="2"/><path d="M7 8.5V6C7 4.3 8.3 3 10 3C11.7 3 13 4.3 13 6V8.5"/></svg>',
        "check": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4.5 10.5 8.5 14.5 15.5 6"/></svg>',
        "terminal": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="4.5 6.5 8.5 10 4.5 13.5"/><line x1="10.5" y1="14.5" x2="15.5" y2="14.5"/></svg>',
        "game": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="14" height="9" rx="3"/><line x1="6.5" y1="10.5" x2="8.5" y2="10.5"/><line x1="7.5" y1="9.5" x2="7.5" y2="11.5"/><circle cx="13" cy="10" r="0.8" fill="currentColor"/><circle cx="14.5" cy="11.5" r="0.8" fill="currentColor"/></svg>',
        "reader": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="5.5" x2="16" y2="5.5"/><line x1="4" y1="9.5" x2="16" y2="9.5"/><line x1="4" y1="13.5" x2="11" y2="13.5"/></svg>',
        "fullscreen": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 3 17 3 17 7"/><polyline points="7 17 3 17 3 13"/><polyline points="17 13 17 17 13 17"/><polyline points="3 7 3 3 7 3"/></svg>',
        "exit-fullscreen": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 8 8 8 8 4"/><polyline points="16 12 12 12 12 16"/><polyline points="8 16 8 12 4 12"/><polyline points="12 4 12 8 16 8"/></svg>',
        "copy": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="9" height="10" rx="1.5"/><path d="M4 13V4.5C4 3.7 4.7 3 5.5 3H12"/></svg>',
        "external-link": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 10.5V15.5C14 16.3 13.3 17 12.5 17H4.5C3.7 17 3 16.3 3 15.5V7.5C3 6.7 3.7 6 4.5 6H9.5"/><polyline points="12 3 17 3 17 8"/><line x1="8.5" y1="11.5" x2="16.5" y2="3.5"/></svg>',
        "shield": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2.5L3.5 5.5V10.5C3.5 14.5 6.5 17.5 10 18.5C13.5 17.5 16.5 14.5 16.5 10.5V5.5L10 2.5Z"/></svg>',
        "trash": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 5.5 16.5 5.5"/><path d="M6.5 5.5V3.5C6.5 2.7 7.2 2 8 2H12C12.8 2 13.5 2.7 13.5 3.5V5.5"/><path d="M15 5.5V16C15 16.8 14.3 17.5 13.5 17.5H6.5C5.7 17.5 5 16.8 5 16V5.5"/></svg>',
        "upload": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13V3M10 3L6.5 6.5M10 3L13.5 6.5M4 17H16"/></svg>',
        "find": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="8.5" cy="8.5" r="4.5"/><path d="M12 12L16 16"/><line x1="6" y1="8.5" x2="11" y2="8.5"/></svg>',
        "chevron-up": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 12.5 10 7.5 15 12.5"/></svg>',
        "chevron-down": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 7.5 10 12.5 15 7.5"/></svg>',
        "sun": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="3.5"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="10" y1="16" x2="10" y2="18"/><line x1="2" y1="10" x2="4" y2="10"/><line x1="16" y1="10" x2="18" y2="10"/><line x1="4.3" y1="4.3" x2="5.7" y2="5.7"/><line x1="14.3" y1="14.3" x2="15.7" y2="15.7"/><line x1="4.3" y1="15.7" x2="5.7" y2="14.3"/><line x1="14.3" y1="5.7" x2="15.7" y2="4.3"/></svg>',
        "moon": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 12.8A7 7 0 1 1 9.2 3.5 5.5 5.5 0 0 0 16.5 12.8Z"/></svg>',
        "laptop": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="13" height="8.5" rx="1"/><path d="M2 15.5H18"/></svg>'
    };

    const Utils = {
        getIcon(name, className = "icon", size = 18) {
            const svg = ICONS[name] || ICONS["search"];
            if (!className && !size) return svg;
            return svg.replace('<svg ', `<svg class="${className}" width="${size}" height="${size}" aria-hidden="true" `);
        },

        createElement(tag, className = "", innerHTML = "", attributes = {}) {
            const el = document.createElement(tag);
            if (className) el.className = className;
            if (innerHTML) el.innerHTML = innerHTML;
            for (const [key, val] of Object.entries(attributes)) {
                el.setAttribute(key, val);
            }
            return el;
        },

        formatDate(timestamp) {
            if (!timestamp) return "";
            const d = new Date(timestamp);
            const now = new Date();
            const isToday = d.toDateString() === now.toDateString();
            if (isToday) {
                return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
            }
            return d.toLocaleDateString([], { month: "short", day: "numeric" });
        },

        formatFullDate(timestamp) {
            if (!timestamp) return "";
            return new Date(timestamp).toLocaleString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
            });
        },

        formatBytes(bytes, decimals = 1) {
            if (!bytes || bytes === 0) return "0 B";
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ["B", "KB", "MB", "GB"];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
        },

        async copyToClipboard(text) {
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(text);
                    return true;
                }
            } catch (err) {
                console.warn("[BiB Clipboard] Async clipboard failed, falling back", err);
            }

            // Fallback for older browsers or sandboxes
            try {
                const textarea = document.createElement("textarea");
                textarea.value = text;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                const successful = document.execCommand("copy");
                document.body.removeChild(textarea);
                return successful;
            } catch (err) {
                console.error("[BiB Clipboard] Copy failed", err);
                return false;
            }
        },

        downloadBlob(blob, filename) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 200);
        },

        downloadJson(data, filename) {
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
            this.downloadBlob(blob, filename);
        },

        readJsonFile(file) {
            return new Promise((resolve, reject) => {
                if (!file) return reject(new Error("No file specified"));
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const parsed = JSON.parse(e.target.result);
                        resolve(parsed);
                    } catch (err) {
                        reject(new Error("File does not contain valid JSON"));
                    }
                };
                reader.onerror = () => reject(new Error("Failed to read file"));
                reader.readAsText(file);
            });
        },

        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        escapeHtml(str) {
            if (!str) return "";
            return str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
    };

    window.BiB = window.BiB || {};
    window.BiB.Utils = Utils;
})(window);
