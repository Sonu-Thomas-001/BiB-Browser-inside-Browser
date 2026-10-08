/**
 * BiB 2.0 — Web Share & Clipboard Integration
 */

"use strict";

(function (window) {
    class ShareManager {
        async sharePage(tab) {
            if (!tab) return;
            const title = tab.title || "BiB";
            const url = tab.url || window.location.href;

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: title,
                        text: `Check out ${title} on BiB (Browser inside Browser)`,
                        url: url
                    });
                    if (window.BiB && window.BiB.Notifications) {
                        window.BiB.Notifications.show("Page shared successfully", "success", "share");
                    }
                    return;
                } catch (err) {
                    if (err.name === "AbortError") return; // User cancelled share sheet
                    console.warn("[BiB Share] Web Share failed, copying URL instead", err);
                }
            }

            // Fallback: Copy to Clipboard
            const copied = await window.BiB.Utils.copyToClipboard(url);
            if (copied && window.BiB && window.BiB.Notifications) {
                window.BiB.Notifications.show("Link copied to clipboard", "success", "copy");
            }
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Share = new ShareManager();
})(window);
