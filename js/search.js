/**
 * BiB 2.0 — Search Engine & Query Normalizer
 * Omnibox suggestion provider and deterministic offline search results
 */

"use strict";

(function (window) {
    const INTERNAL_PAGES = [
        { title: "Start Page", url: "bib://home", icon: "search" },
        { title: "Welcome Tour", url: "bib://welcome", icon: "info" },
        { title: "Developer Tools", url: "bib://developer", icon: "terminal" },
        { title: "Browsing History", url: "bib://history", icon: "history" },
        { title: "Saved Bookmarks", url: "bib://bookmarks", icon: "star" },
        { title: "Downloads Manager", url: "bib://downloads", icon: "download" },
        { title: "Arcade Games", url: "bib://games", icon: "game" },
        { title: "Browser Settings", url: "bib://settings", icon: "settings" },
        { title: "Privacy & Data", url: "bib://privacy", icon: "shield" },
        { title: "Performance Metrics", url: "bib://performance", icon: "terminal" },
        { title: "Secret Chamber", url: "bib://secret", icon: "terminal" },
        { title: "404 Error Page", url: "bib://404", icon: "close" }
    ];

    class SearchEngine {
        normalizeInput(raw) {
            if (!raw) return "bib://home";
            const trimmed = raw.trim();

            if (/^bib:\/\//i.test(trimmed)) {
                return trimmed.toLowerCase();
            }

            if (/^https?:\/\//i.test(trimmed)) {
                return trimmed;
            }

            const domainPattern = /^([a-zA-Z0-9-]+\.)+(com|org|net|io|dev|app|edu|gov|local)(:\d+)?(\/.*)?$/i;
            if (domainPattern.test(trimmed)) {
                return `https://${trimmed}`;
            }

            return `bib://search?q=${encodeURIComponent(trimmed)}`;
        }

        async getSuggestions(query) {
            if (!query || !query.trim()) {
                // Show default recent items when focused empty
                const suggestions = [];
                if (window.BiB && window.BiB.History) {
                    const recent = (await window.BiB.History.getAll()).slice(0, 4);
                    recent.forEach(r => suggestions.push({
                        title: r.title,
                        url: r.url,
                        icon: "history",
                        section: "Recent"
                    }));
                }
                return suggestions;
            }

            const q = query.toLowerCase().trim();
            const results = [];

            // 1. Search Query entry
            results.push({
                title: `Search BiB for "${query}"`,
                url: `bib://search?q=${encodeURIComponent(query)}`,
                icon: "search",
                section: "Search"
            });

            // 2. Internal page matches
            INTERNAL_PAGES.forEach(p => {
                if (p.url.toLowerCase().includes(q) || p.title.toLowerCase().includes(q)) {
                    results.push({
                        title: p.title,
                        url: p.url,
                        icon: p.icon,
                        section: "Pages"
                    });
                }
            });

            // 3. Bookmarks matches
            if (window.BiB && window.BiB.Bookmarks) {
                const bms = await window.BiB.Bookmarks.getAll();
                bms.forEach(b => {
                    if (b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q)) {
                        if (!results.some(r => r.url.toLowerCase() === b.url.toLowerCase())) {
                            results.push({
                                title: b.title,
                                url: b.url,
                                icon: "star",
                                section: "Bookmarks"
                            });
                        }
                    }
                });
            }

            return results.slice(0, 7);
        }

        generateResults(query) {
            const clean = decodeURIComponent(query || "").trim();
            const lower = clean.toLowerCase();

            // Easter eggs
            if (lower === "is this a real browser" || lower === "is this a real browser?") {
                return {
                    query: clean,
                    isEasterEgg: true,
                    title: "Technically no. Emotionally? Absolutely.",
                    desc: "BiB is a meticulously handcrafted browser simulation living completely inside your browser. Pure front-end craftsmanship.",
                    links: [
                        { title: "Learn more in BiB Architecture", url: "bib://welcome", snippet: "Read the architectural principles behind BiB." }
                    ]
                };
            }

            if (lower === "whoami") {
                return {
                    query: clean,
                    isEasterEgg: true,
                    title: "Identity Verified",
                    desc: "You are piloting BiB 2.0 — a browser running inside another browser.",
                    links: [
                        { title: "Open Developer Console", url: "bib://developer", snippet: "Run whoami, help, and tabs commands directly." }
                    ]
                };
            }

            // Deterministic offline search results
            return {
                query: clean,
                isEasterEgg: false,
                links: [
                    {
                        title: `${clean} — Complete Guide & Overview`,
                        url: `https://example.com/${encodeURIComponent(clean)}`,
                        snippet: `Learn everything about ${clean} with comprehensive interactive documentation and reference materials.`
                    },
                    {
                        title: `Best Practices and Patterns for ${clean}`,
                        url: `https://example.com/best-practices`,
                        snippet: `Explore modern architecture, performance tips, and client-side implementation examples.`
                    },
                    {
                        title: `Interactive Experiments with ${clean}`,
                        url: `bib://developer`,
                        snippet: `Launch the built-in Developer Tools to test and inspect runtime behavior.`
                    }
                ]
            };
        }
    }

    window.BiB = window.BiB || {};
    window.BiB.Search = new SearchEngine();
})(window);
