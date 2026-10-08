# BiB

### Browser inside Browser

> **A tiny browser living inside your browser.**

[Live Demo](https://sonu-thomas-001.github.io/BiB-Browser-inside-Browser/) • [GitHub Repository](https://github.com/Sonu-Thomas-001/BiB-Browser-inside-Browser)

---

BiB isn't a browser engine.

It's an exploration of how much of a browser experience can be recreated using the Web Platform.

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Zero Frameworks](https://img.shields.io/badge/Frameworks-Zero-green.svg)](https://github.com)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blueviolet.svg)](https://pages.github.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-orange.svg)](manifest.json)
[![Web Platform](https://img.shields.io/badge/Web%20Platform-APIs-purple.svg)](https://developer.mozilla.org)

**BiB 3.0** is an ambitious, client-side browser shell experiment crafted with the aesthetic quality of **Apple, Safari, macOS, Linear, and Arc**. It demonstrates how desktop-grade browser architecture—multi-tab managers, tab groups, smart omnibox autocomplete, Safari Reader mode with typography customization, split-pane view, floating mini-windows, local file inspection, background Web Workers, and real IndexedDB storage—can be implemented purely with **HTML5, CSS3, and strict-mode Vanilla JavaScript with zero dependencies and no build step**.

---

## 🧭 Core Architectural Philosophy

The application strictly distinguishes between **REAL** capabilities (executed via native browser APIs) and **SIMULATED** features (recreated due to web security boundaries):

### Feature Matrix

| Feature | Category | Implementation | Description |
| :--- | :--- | :--- | :--- |
| **Multi-tab Management** | Real | BiB DOM Architecture | HTML5 drag-and-drop, tab pinning, tab groups, audio mute toggles |
| **Tab Search** | Real | BiB Controller | Instant fuzzy search modal (<kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>A</kbd>) |
| **History Storage** | Real | IndexedDB API | Structured client-side storage with JSON export/import |
| **Bookmarks & Folders** | Real | IndexedDB API | Persistent bookmark database with folder categorization |
| **Reading List** | Real | IndexedDB API | Offline reading queue with unread/read state |
| **Downloads Manager** | Real | Blob & File APIs | Real blob exports, download history, and file triggers |
| **Clipboard Copying** | Real | Clipboard API | Asynchronous `navigator.clipboard.writeText` |
| **System Share** | Real | Web Share API | Native OS share sheet with clipboard fallback |
| **Fullscreen Mode** | Real | Fullscreen API | True hardware fullscreen presentation |
| **PWA & Offline** | Real | Service Worker API | Network-first caching with offline capability |
| **Local File Viewer** | Real | File API | Safe inspection of HTML, TXT, JSON, MD, images, and PDFs |
| **Search Engine** | Real/Hybrid | BiB Search & URL | Omnibox parsing with direct external navigation |
| **External Websites** | Real/Sandboxed | `<iframe>` & WebViews | Controlled iframe rendering with fallback cards for `X-Frame-Options` |
| **Split View** | Real | BiB Layout Engine | Side-by-side resizable split panes with independent navigation |
| **Floating Windows** | Real | Window Manager | Multi-window desktop simulation with drag, resize, and PiP mode |
| **Reader Mode** | Real | BiB DOM Transformer | Distraction-free typography with White, Sepia, Dark, Black themes |
| **Diagnostics** | Real | Capability Detection | Dynamic inspection of host browser's active Web Platform APIs |
| **Multi-threading** | Real | Web Worker API | True background CPU prime-number calculation on separate thread |
| **Process Manager** | Simulated | BiB Mock Engine | Visualized tabs and resource allocation |
| **Network Waterfall** | Simulated | BiB Mock Engine | Demonstration network timings and HTTP status breakdown |
| **Memory Statistics** | Simulated | BiB Mock Engine | Simulated engine heap size |
| **Browser Engine** | *Not Implemented* | N/A | BiB runs on the host browser's engine (Blink/WebKit/Gecko) |

---

## 🎨 Apple-Level Design System

- **Restrained Glassmorphism**: High-end macOS translucent surfaces (`rgba(255, 255, 255, 0.75)` with `backdrop-filter: blur(24px) saturate(180%)`), fine 1px borders, and soft elevation shadows.
- **3-Level Depth System**: Level 1 (flat workspace content), Level 2 (floating split panes, mini-windows, toolbars), and Level 3 (Command Palette and tab search modals).
- **Apple Typography**: Native system font stack (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif`).
- **Liquid Glass Spring Curves**: Spring-like easing curves (`cubic-bezier(0.16, 1, 0.3, 1)`) for micro-interactions without gratuitous motion.
- **Accessibility & Reduced Motion**: Full `prefers-reduced-motion` compliance, ARIA landmarks, focus trapping, and semantic HTML5.

---

## 🚀 Key Highlights & Capabilities

### 1. Smart Omnibox & External WebView Navigation
- Enter standard URLs (`https://example.com`, `https://wikipedia.org`) to browse inside BiB.
- **Smart Fallback Experience**: Sites protected by `X-Frame-Options: SAMEORIGIN` or CSP frame-ancestors gracefully present a polished fallback card with **Open in Browser ↗** and **Copy URL**.
- Live autocomplete with categorised history, bookmarks, open tabs, and web search suggestions.

### 2. Central Command Palette (<kbd>⌘</kbd> + <kbd>K</kbd>)
- Raycast & Spotlight-inspired universal command center.
- Search and trigger tabs, history, bookmarks, split view, reader mode, theme toggles, diagnostics, and developer tools with full keyboard navigation (<kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>↵</kbd>).

### 3. Multi-Pane Split View (<kbd>⌥</kbd> + <kbd>S</kbd>)
- Browse two websites or internal documents side-by-side.
- Smooth draggable divider with 50/50, 30/70, and 70/30 ratios.
- Independent navigation stacks, zoom levels, and URLs for each pane.

### 4. Floating Mini-Windows & Window Manager (<kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>N</kbd>)
- Internal desktop windowing environment.
- Drag, resize, minimize, maximize, and focus multiple floating browser surfaces.
- Mini Picture-in-Picture browser simulation.

### 5. Reader Mode with Typography Drawer (<kbd>⌥</kbd> + <kbd>R</kbd>)
- Floating `Aa` controls drawer.
- 4 color themes: **White**, **Sepia**, **Dark**, and **Black**.
- Font switching (System Sans, Serif, Monospace) and dynamic font sizing.

### 6. Local File Viewer (<kbd>⌘</kbd> + <kbd>O</kbd>)
- Safely open local files via `<input type="file">`.
- Formatted, syntax-highlighted JSON viewer.
- Full document text reader.
- Interactive Image Viewer with smooth zoom, rotate, fit-to-screen, and blob download.

### 7. Real Web Worker Multi-Threading (`bib://developer`)
- Executes intensive prime number search in a detached Web Worker thread.
- Main UI remains 100% fluid with 0 frame drops during computation.
- Measures real execution duration and verifies Web Platform multi-threading.

### 8. Real-Time Browser Diagnostics (`bib://diagnostics`)
- Live feature detection checking: Clipboard API, Web Share, Fullscreen, IndexedDB, Service Workers, File API, Web Workers, WebGL, WebRTC, Battery API, and Network Information API.

---

## ⌨️ Universal Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> | **Command Palette** |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>⇧</kbd> + <kbd>A</kbd> | **Search Open Tabs** |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>T</kbd> | **New Tab** |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>W</kbd> | **Close Active Tab** |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>⇧</kbd> + <kbd>T</kbd> | **Reopen Closed Tab** |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>L</kbd> | **Focus Omnibox (Select URL)** |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>R</kbd> | **Reload Current Page** |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>D</kbd> | **Bookmark Page** |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>O</kbd> | **Open Local File** |
| <kbd>⌥</kbd> + <kbd>S</kbd> | **Toggle Split View** |
| <kbd>⌥</kbd> + <kbd>R</kbd> | **Toggle Reader Mode** |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>⇧</kbd> + <kbd>N</kbd> | **New Floating Window** |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>F</kbd> | **Find in Page** |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>+</kbd> / <kbd>-</kbd> / <kbd>0</kbd> | **Zoom In / Out / Reset** |
| <kbd>Alt</kbd> + <kbd>←</kbd> / <kbd>→</kbd> | **Back / Forward** |
| <kbd>Esc</kbd> | **Close Overlays / Modals** |
| **Konami Code** | <kbd>↑</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd><kbd>←</kbd><kbd>→</kbd><kbd>B</kbd><kbd>A</kbd> unlocks Secret Chamber |

---

## 📂 Project Architecture

```text
bib/
│
├── index.html              # Main application shell & desktop workspace
├── manifest.json           # PWA installation manifest
├── sw.js                   # Service Worker (Network-first offline cache)
├── README.md               # Documentation & specifications
├── LICENSE                 # MIT License
│
├── css/
│   ├── tokens.css          # Apple-inspired 3-level depth tokens & color palettes
│   ├── base.css            # Base resets & typography
│   ├── components.css      # Core buttons, popovers, and status bar
│   ├── glass.css           # Restrained glassmorphism, command palette, split view, windows
│   ├── browser.css         # Browser chrome, tab groups, omnibox
│   ├── pages.css           # Internal bib:// page styling & layout
│   ├── animations.css      # Spring transitions & reduced motion rules
│   ├── themes.css          # Light, Dark, and System color overrides
│   └── responsive.css      # Mobile iOS Safari layout adaptations
│
└── js/
    ├── utils.js            # SVG icon library & date/number formatters
    ├── storage.js          # Synchronous localStorage manager with fallbacks
    ├── indexeddb.js        # BiB_Database_v3 structured IndexedDB manager
    ├── experiments.js      # FeatureFlags persistence system
    ├── notifications.js    # Floating macOS toast notifications
    ├── themes.js           # Light, Dark, System appearance controller
    ├── fullscreen.js       # Native Fullscreen API integration
    ├── share.js            # Web Share & Clipboard API
    ├── downloads.js        # Real Blob file download manager
    ├── history.js          # IndexedDB browsing history
    ├── bookmarks.js        # IndexedDB bookmarks & favorite folders
    ├── reading-list.js     # IndexedDB offline reading queue
    ├── search.js           # Omnibox normalizer & autocomplete provider
    ├── settings.js         # Settings manager & JSON backup
    ├── commands.js         # Central Command Registry & Command Palette (⌘K)
    ├── keyboard.js         # Global keyboard shortcut dispatcher
    ├── context-menu.js     # Custom right-click context menus
    ├── games.js            # Reflex Arcade & Canvas Dino games
    ├── developer-tools.js  # Console REPL, DOM Inspector, Network, Web Worker Demo
    ├── webview.js          # Controlled iframe WebView manager & blocked fallback
    ├── reader.js           # Safari Reader view controller with typography drawer
    ├── file-viewer.js      # Local file viewer (HTML, TXT, JSON, MD, Image, PDF)
    ├── split-view.js       # Side-by-side resizable split view manager
    ├── window-manager.js   # Multi-window draggable floating window OS layer
    ├── renderer.js         # Page routing & internal bib:// page templates
    ├── tabs.js             # Advanced tab manager, tab groups, pinning, muting, session
    ├── navigation.js       # Navigation engine & progress indicators
    ├── browser.js          # Browser UI orchestrator & link hover status
    └── app.js              # Application bootstrapper & session restore prompt
```

---

## 🔒 Privacy & Security Model

- **Zero Analytics**: BiB contains no trackers, telemetry, or remote telemetry endpoints.
- **Client-Side Only**: Browsing history, bookmarks, reading lists, and site preferences remain strictly inside your browser's private local storage.
- **Security Respect**: BiB never attempts to bypass CSP, CORS, or X-Frame-Options. It operates in full compliance with the modern Web Security Model.

---

## 🚀 Running Locally

Because BiB requires **no build step, no Node server, and no npm packages**, you can run it instantly:

```bash
# Using Python built-in server
python -m http.server 8080
```

Open `http://localhost:8080/index.html` in any modern web browser.

---

## 🚢 Deploying to GitHub Pages

1. Commit and push the repository to GitHub:
   ```bash
   git add .
   git commit -m "release: BiB 3.0.0"
   git push origin main
   ```
2. Navigate to **Settings** → **Pages** in your GitHub repository.
3. Select `main` branch with root `/` folder and click **Save**.
4. Your installation will be live on GitHub Pages immediately.

---

## 📄 License

Open-source and available under the [MIT License](LICENSE).
