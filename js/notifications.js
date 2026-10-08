/**
 * BiB (Browser inside Browser) — Notification System
 * Polished toast notification manager
 */

class NotificationManager {
    constructor() {
        this.container = null;
        this._initContainer();
    }

    _initContainer() {
        let el = document.querySelector('.toast-container');
        if (!el) {
            el = document.createElement('div');
            el.className = 'toast-container';
            document.body.appendChild(el);
        }
        this.container = el;
    }

    show(message, type = 'info', icon = null, duration = 3000) {
        if (!this.container) this._initContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-enter ${type}`;

        const defaultIcons = {
            info: '💡',
            success: '✓',
            warning: '⚠️',
            error: '✕',
            bookmark: '★',
            theme: '🎨',
            tab: '🗂️'
        };

        const resolvedIcon = icon || defaultIcons[type] || '✨';

        toast.innerHTML = `
            <span class="toast-icon">${resolvedIcon}</span>
            <span class="toast-msg">${message}</span>
        `;

        // Click to dismiss immediately
        toast.addEventListener('click', () => {
            this._dismiss(toast);
        });

        this.container.appendChild(toast);

        // Auto dismiss timer
        const timer = setTimeout(() => {
            this._dismiss(toast);
        }, duration);

        toast._timer = timer;
        return toast;
    }

    _dismiss(toast) {
        if (!toast || toast._isDismissing) return;
        toast._isDismissing = true;
        clearTimeout(toast._timer);

        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 220);
    }
}

// Export singleton instance
window.notificationManager = new NotificationManager();
