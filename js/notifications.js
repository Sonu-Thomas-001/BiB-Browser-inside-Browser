/**
 * BiB 2.0 — Notifications Manager
 * Apple-style clean floating toast pill notifications
 */

"use strict";

(function (window) {
    class NotificationManager {
        constructor() {
            this.container = null;
            this._init();
        }

        _init() {
            let el = document.querySelector(".toast-container");
            if (!el) {
                el = document.createElement("div");
                el.className = "toast-container";
                document.body.appendChild(el);
            }
            this.container = el;
        }

        show(message, type = "info", iconName = null, duration = 2800) {
            if (!this.container) this._init();

            const toast = document.createElement("div");
            toast.className = `toast toast-in ${type}`;

            const defaultIcons = {
                info: "info",
                success: "check",
                warning: "shield",
                error: "close"
            };

            const resolvedIconName = iconName || defaultIcons[type] || "info";
            const iconSvg = window.BiB && window.BiB.Utils ? window.BiB.Utils.getIcon(resolvedIconName) : "";

            toast.innerHTML = `
                <span class="toast-icon">${iconSvg}</span>
                <span class="toast-message">${message}</span>
            `;

            toast.addEventListener("click", () => this.dismiss(toast));

            this.container.appendChild(toast);

            const timer = setTimeout(() => {
                this.dismiss(toast);
            }, duration);

            toast._timer = timer;
            return toast;
        }

        dismiss(toast) {
            if (!toast || toast._isDismissing) return;
            toast._isDismissing = true;
            clearTimeout(toast._timer);

            toast.classList.remove("toast-in");
            toast.classList.add("toast-out");

            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 180);
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Notifications = new NotificationManager();
})(window);
