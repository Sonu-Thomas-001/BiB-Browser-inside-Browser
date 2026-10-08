/**
 * BiB 2.0 — Application Bootstrapper
 * Initializes managers, mounts default tabs, registers service worker for PWA
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Theme Engine (Light Mode default)
    if (window.BiB && window.BiB.Themes) {
        window.BiB.Themes.init();
    }

    // 2. Initialize Tab Container
    const tabContainer = document.querySelector(".tab-bar-container");
    if (window.BiB && window.BiB.Tabs && tabContainer) {
        window.BiB.Tabs.init(tabContainer);
    }

    // 3. Initialize Browser UI Coordinator
    if (window.BiB && window.BiB.Browser) {
        window.BiB.Browser.init();
    }

    // 4. Create Initial Tabs
    if (window.BiB && window.BiB.Tabs) {
        window.BiB.Tabs.createTab("bib://home", true, false, "Projects");
        window.BiB.Tabs.createTab("bib://welcome", false, false, "Work");
        window.BiB.Tabs.createTab("bib://developer", false, false, "Work");
    }

    // 5. Mobile Bottom Navigation Listeners
    const mobileHome = document.querySelector("#mobileNavHome");
    const mobileTabs = document.querySelector("#mobileNavTabs");
    const mobileBm = document.querySelector("#mobileNavBm");
    const mobileMenu = document.querySelector("#mobileNavMenu");

    if (mobileHome) mobileHome.addEventListener("click", () => window.BiB.Navigation.navigate("bib://home"));
    if (mobileTabs) mobileTabs.addEventListener("click", () => window.BiB.Tabs.createTab("bib://home"));
    if (mobileBm) mobileBm.addEventListener("click", () => window.BiB.Navigation.navigate("bib://bookmarks"));
    if (mobileMenu) {
        mobileMenu.addEventListener("click", (e) => {
            const menu = document.querySelector(".dropdown-menu");
            if (menu) menu.classList.toggle("is-open");
        });
    }

    // 6. Register PWA Service Worker (relative scope for GitHub Pages)
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
        navigator.serviceWorker.register("./sw.js", { scope: "./" })
            .then(reg => {
                reg.update();
                console.log("[BiB PWA] Service Worker registered & checked for updates");
            })
            .catch(err => console.log("[BiB PWA] SW registration note", err));
    }
});
