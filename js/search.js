/**
 * BiB (Browser inside Browser) — Search & Omnibox Engine
 * Handles URL parsing, simulated search generation, and autocomplete suggestions
 */

class SearchEngine {
    constructor() {
        this.internalPages = [
            { title: 'Welcome Page', url: 'bib://welcome', icon: '🚀' },
            { title: 'Home Dashboard', url: 'bib://home', icon: '🏠' },
            { title: 'About BiB', url: 'bib://about', icon: 'ℹ️' },
            { title: 'Developer Console & DevTools', url: 'bib://developer', icon: '⚡' },
            { title: 'Browsing History', url: 'bib://history', icon: '📜' },
            { title: 'Saved Bookmarks', url: 'bib://bookmarks', icon: '⭐' },
            { title: 'Browser Settings', url: 'bib://settings', icon: '⚙️' },
            { title: 'Downloads Manager', url: 'bib://downloads', icon: '📥' },
            { title: 'Arcade Mini Games', url: 'bib://games', icon: '🎮' },
            { title: 'Secret Vault (Easter Egg)', url: 'bib://secret', icon: '👾' },
            { title: '404 Simulation', url: 'bib://404', icon: '🛸' },
            { title: 'Google Search Simulation', url: 'https://google.com', icon: '🔍' },
            { title: 'GitHub Repository Simulation', url: 'https://github.com', icon: '🐙' },
            { title: 'Example Domain', url: 'https://example.com', icon: '🌐' },
            { title: 'Tech News Feed', url: 'https://news.local', icon: '📰' },
            { title: 'Social Stream Feed', url: 'https://social.local', icon: '💬' }
        ];
    }

    normalizeInput(rawInput) {
        if (!rawInput) return 'bib://home';
        const trimmed = rawInput.trim();

        // 1. Direct bib:// protocol
        if (/^bib:\/\//i.test(trimmed)) {
            return trimmed.toLowerCase();
        }

        // 2. Direct http/https protocol
        if (/^https?:\/\//i.test(trimmed)) {
            return trimmed;
        }

        // 3. Known domain extensions or local domains
        const domainRegex = /^([a-zA-Z0-9-]+\.)+(com|org|net|io|dev|app|edu|gov|local)(:\d+)?(\/.*)?$/i;
        if (domainRegex.test(trimmed)) {
            return `https://${trimmed}`;
        }

        // 4. Fallback: treat as search query
        return `bib://search?q=${encodeURIComponent(trimmed)}`;
    }

    getSuggestions(query) {
        if (!query || query.trim().length === 0) {
            return [];
        }

        const q = query.toLowerCase().trim();
        const results = [];

        // Match internal pages
        this.internalPages.forEach(p => {
            if (p.url.toLowerCase().includes(q) || p.title.toLowerCase().includes(q)) {
                results.push({
                    title: p.title,
                    url: p.url,
                    icon: p.icon,
                    type: 'internal'
                });
            }
        });

        // Match bookmarks if available
        if (window.bookmarksManager) {
            window.bookmarksManager.getAll().forEach(bm => {
                if (bm.url.toLowerCase().includes(q) || bm.title.toLowerCase().includes(q)) {
                    if (!results.some(r => r.url.toLowerCase() === bm.url.toLowerCase())) {
                        results.push({
                            title: bm.title,
                            url: bm.url,
                            icon: bm.favicon || '⭐',
                            type: 'bookmark'
                        });
                    }
                }
            });
        }

        // Add Google / BiB Search suggestion
        results.push({
            title: `Search BiB for "${query}"`,
            url: `bib://search?q=${encodeURIComponent(query)}`,
            icon: '🔍',
            type: 'search'
        });

        return results.slice(0, 6);
    }

    generateSearchResults(query) {
        const cleanQuery = decodeURIComponent(query || '').trim();
        const lower = cleanQuery.toLowerCase();

        // Easter Egg searches
        if (lower === 'is this a real browser' || lower === 'is this a real browser?') {
            return {
                query: cleanQuery,
                isEasterEgg: true,
                specialTitle: 'Technically no. Emotionally? Absolutely.',
                specialDesc: 'BiB is a handcrafted browser simulation made with vanilla web technologies, living completely inside your browser. No Chromium engine, no electron overhead — pure front-end craftsmanship!',
                results: [
                    { title: 'The Philosophy of Browser inside Browser', url: 'bib://about', snippet: 'Read the architectural philosophy and technical breakdown behind BiB.' },
                    { title: 'Secret Easter Egg Vault', url: 'bib://secret', snippet: 'You unlocked a curious query. Try venturing deeper into the secret chamber.' }
                ]
            };
        }

        if (lower === 'whoami') {
            return {
                query: cleanQuery,
                isEasterEgg: true,
                specialTitle: 'Identity Discovered',
                specialDesc: 'You are currently an intelligent user piloting a browser simulation running inside another desktop browser. Inception level: 2.',
                results: [
                    { title: 'BiB Developer Console', url: 'bib://developer', snippet: 'Open the simulated terminal and test system commands like "whoami" and "sudo bib".' }
                ]
            };
        }

        // Contextual realistic search results
        const dynamicResults = [
            {
                title: `${cleanQuery} — Interactive Guide & Overview`,
                url: `bib://search/overview`,
                snippet: `Comprehensive simulated documentation, articles, and interactive demos regarding "${cleanQuery}". Tested in BiB simulated runtime.`
            },
            {
                title: `10 Creative Experiments & Ideas for ${cleanQuery}`,
                url: `bib://search/ideas`,
                snippet: `Discover top projects, curated resources, and step-by-step experiments built with modern HTML5, CSS3, and Vanilla JavaScript.`
            },
            {
                title: `Awesome ${cleanQuery} Community Resources (2026 Edition)`,
                url: `bib://search/community`,
                snippet: `Explore tutorials, open-source repositories, developer tools, and best practices curated by the community.`
            },
            {
                title: `BiB Developer Playground: Testing ${cleanQuery}`,
                url: `bib://developer`,
                snippet: `Launch the built-in Developer Console to inspect elements, monitor storage, and debug queries live.`
            }
        ];

        return {
            query: cleanQuery,
            isEasterEgg: false,
            results: dynamicResults
        };
    }
}

// Export singleton instance
window.searchEngine = new SearchEngine();
