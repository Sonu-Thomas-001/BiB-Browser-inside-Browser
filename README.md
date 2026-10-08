# BiB — Browser inside Browser

> **A miniature desktop web browser simulation running completely client-side inside your browser.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Frameworks](https://img.shields.io/badge/Frameworks-Zero-green.svg)](https://github.com)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blueviolet.svg)](https://pages.github.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-orange.svg)](manifest.json)

**BiB 2.0** is an interactive browser simulation and frontend experiment crafted with the aesthetic quality of **Apple.com, Safari, macOS, Linear, and Arc**. It demonstrates how modern desktop-grade browser features—multi-tab managers with HTML5 drag-and-drop, tab groups, smart omnibox autocomplete, Safari Reader mode, Find in page, real IndexedDB storage, native Web APIs, and built-in developer tools—can be implemented using **HTML5, CSS3, and strict-mode Vanilla JavaScript with zero external frameworks or build steps**.

---

## 🚀 Live Demo

🔗 **[https://<github-username>.github.io/bib/](https://<github-username>.github.io/bib/)**

*(Replace `<github-username>` with your GitHub handle when deployed)*

---

## 🍎 Design Direction & Aesthetic

- **Apple-Grade Light Mode by Default**: Crisp `#FFFFFF` browser chrome on an off-white `#F5F5F7` backdrop with restrained Apple blue accents (`#0071E3`), 1px borders, and soft shadows (`0 24px 80px rgba(0,0,0,0.08)`).
- **macOS Typography**: Native system font stack (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif`).
- **Restrained Micro-Interactions**: Active `scale(0.97)` click feedback, smooth tab entering/exiting, fluid popover transitions, and full `prefers-reduced-motion` accessibility support.
- **System Appearance Support**: Select between **Light**, **Dark**, and **System** (dynamically matching OS `prefers-color-scheme`).

---

## 🌐 Real Browser APIs Integrated

BiB uses genuine modern Web APIs wherever technically feasible:

- **Clipboard API** (`navigator.clipboard.writeText`): Real asynchronous link and source code copying.
- **Web Share API** (`navigator.share`): Native OS system sharing with automatic clipboard fallback.
- **Fullscreen API** (`requestFullscreen` / `exitFullscreen`): Real fullscreen presentation.
- **Print API** (`window.print()`): Native print dialog with print-friendly CSS.
- **File API & Real Blob Downloads**: Export browsing history as `bib-history.json` and bookmarks as `bib-bookmarks.json` with real Blob downloads, and import backups via `<input type="file">`.
- **IndexedDB**: Structured client-side storage for history, bookmarks, downloads, and session snapshots.
- **PWA Service Worker** (`manifest.json` + `sw.js`): Installable as a Progressive Web App with offline caching.
- **Online / Offline Detection** (`navigator.onLine`): Real-time network connectivity indicators.
- **Battery API** (`navigator.getBattery`): Live device battery status in the status bar.

---

## ✨ Features

### 🗂️ Advanced Tab System
- **HTML5 Drag-and-Drop**: Drag tabs left and right to reorder them with smooth drop-indicator lines.
- **Tab Groups**: Organize tabs into subtle colored groups (*Work*, *Projects*, *Fun*).
- **Tab Pinning**: Pin tabs into compact icons that stick to the far left.
- **Tab Hover Previews**: Hover over tabs to see a floating preview card with title and URL.
- **Safari Reader Mode**: Transform supported articles into clean, distraction-free reading typography.
- **Reopen Closed Tabs**: Press <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>T</kbd> (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd>) to restore your last closed tab.

### 🧭 Smart Omnibox & Search Engine
- **Address & Search Bar**: Type `bib://` URIs, domains like `github.com`, or search queries.
- **Live Suggestions**: Categorized autocomplete popover (*Recent*, *Pages*, *Bookmarks*, *Search*).
- **Deterministic Search Engine**: Offline-capable simulated search results.
- **Find in Page**: Press <kbd>⌘</kbd> + <kbd>F</kbd> (<kbd>Ctrl</kbd> + <kbd>F</kbd>) to search and count on-page matches (`3/8`).

### 🛠️ Developer Tools (`bib://developer`)
- **Console REPL**: Interactive virtual terminal (`help`, `tabs`, `history`, `bookmarks`, `theme`, `whoami`, `sudo bib`).
- **DOM Inspector**: View simplified virtual DOM trees of active viewports.
- **Storage Viewer**: Live inspection of localStorage and IndexedDB store counts.
- **Network Simulator**: Simulated resource waterfall table.
- **Performance**: Simulated load, paint, and memory metrics.

### 🎮 Arcade Games (`bib://games`)
- **Click the Dot**: Reflex trainer with combo multipliers and high score persistence.
- **Browser Dino Runner**: HTML5 Canvas runner with physics jumps and synthesized Web Audio API sounds.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>T</kbd> | Open a new tab |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>W</kbd> | Close active tab |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>L</kbd> | Focus address bar |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>⇧</kbd> + <kbd>T</kbd> | Reopen last closed tab |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>R</kbd> | Reload current page |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>D</kbd> | Bookmark or unbookmark current page |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>F</kbd> | Open Find in Page bar |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>⇧</kbd> + <kbd>B</kbd> | Toggle bookmark bar visibility |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>+</kbd> / <kbd>-</kbd> / <kbd>0</kbd> | Zoom in, zoom out, reset zoom |
| <kbd>Alt</kbd> + <kbd>←</kbd> / <kbd>→</kbd> | Navigate Back / Forward |
| <kbd>Esc</kbd> | Dismiss any open modal, dropdown, or find bar |
| **Konami Code** | <kbd>↑</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>B</kbd> <kbd>A</kbd> unlocks Secret Chamber |

---

## 📂 Project Structure

```text
bib/
│
├── index.html              # Main application shell & desktop workspace
├── manifest.json           # PWA installation manifest
├── sw.js                   # Service Worker for offline caching
├── README.md               # Documentation & setup guide
├── LICENSE                 # MIT License
├── .gitignore              # Repository ignore rules
│
├── css/
│   ├── tokens.css          # Apple-inspired design tokens (Light, Dark, System)
│   ├── base.css            # Resets, print styles, accessibility utilities
│   ├── components.css      # Buttons, modals, toasts, popovers, find bar
│   ├── browser.css         # Safari/Arc window chrome, drag-drop tabs, status bar
│   ├── pages.css           # Start page, Settings, Reader view, DevTools
│   ├── animations.css      # Restrained micro-interactions & reduced motion
│   ├── themes.css          # Theme overrides (Light, Dark, System)
│   └── responsive.css      # Desktop, tablet, and iOS Safari bottom bar layout
│
├── js/
│   ├── app.js              # Application bootstrapper and PWA registration
│   ├── browser.js          # Window coordinator, live clock, battery & find bar
│   ├── tabs.js             # HTML5 Drag-and-drop tab manager, tab groups & previews
│   ├── navigation.js       # Navigation engine, history stacks & progress bar
│   ├── renderer.js         # Page renderer with Reader view and safe iframe embedder
│   ├── history.js          # IndexedDB browsing history with export/import
│   ├── bookmarks.js        # IndexedDB bookmarks with export/import
│   ├── storage.js          # localStorage manager with memory fallback
│   ├── indexeddb.js        # IndexedDB client-side database layer
│   ├── search.js           # Omnibox normalizer, suggestions & search results
│   ├── settings.js         # Settings manager with JSON backup/restore
│   ├── themes.js           # Light, Dark, and System theme controller
│   ├── downloads.js        # Real Blob downloads and export manager
│   ├── developer-tools.js  # Console REPL, DOM inspector, network & storage
│   ├── keyboard.js         # Global keyboard shortcuts & Konami Easter egg
│   ├── context-menu.js     # Custom right-click menus for tabs, links & pages
│   ├── notifications.js    # Apple-style floating toast notifications
│   ├── games.js            # Click the Dot & Canvas Dino runner games
│   ├── fullscreen.js       # Native Fullscreen API integration
│   ├── share.js            # Native Web Share & Clipboard integration
│   └── utils.js            # SF Symbols-style SVG icons & helper utilities
│
└── assets/
    ├── icons/              # App icons
    ├── favicon/            # Favicon assets
    └── screenshots/        # Project preview screenshots
```

---

## ⚠️ Technical Limitations & Honest Disclaimers

BiB is a client-side simulation running inside a host browser:
- **No Browser Engine**: BiB relies on the host browser's JavaScript and layout engine.
- **CORS & X-Frame-Options**: External websites that prohibit embedding via `X-Frame-Options` or `Content-Security-Policy` cannot be forced into an iframe. BiB provides an elegant fallback card with a direct link.
- **No Network Proxying**: Network requests are not proxied through external servers.
- **100% Client-Side Privacy**: All history and bookmarks remain strictly inside the local browser storage.

---

## 🚀 Running Locally

Because BiB requires **no build step, no npm install, and no backend**, you can run it immediately:

### Option 1: Direct File Open
Simply double-click `index.html` in your file explorer.

### Option 2: Local HTTP Server
Using Python:
```bash
python -m http.server 8080
```
Then visit `http://localhost:8080`.

---

## 🚢 GitHub Pages Deployment

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "release: BiB 2.0.0"
   git branch -M main
   git remote add origin https://github.com/<your-username>/bib.git
   git push -u origin main
   ```
2. In your repository on GitHub, go to **Settings** → **Pages**.
3. Under **Branch**, select `main` and root `/`, then click **Save**.
4. Your site will be live at `https://<your-username>.github.io/bib/`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
