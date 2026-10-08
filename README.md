# BiB — Browser inside Browser

> **A miniature desktop web browser simulation running completely client-side inside your browser.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Frameworks](https://img.shields.io/badge/Frameworks-Zero-green.svg)](https://github.com)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blueviolet.svg)](https://pages.github.com/)

**BiB (Browser inside Browser)** is a polished, playful, and technically rich browser simulation. Designed with a futuristic glassmorphic aesthetic inspired by Chrome, Arc, and macOS, BiB demonstrates how modern frontend architectures—including tab lifecycle managers, simulated network stacks, omnibox autocomplete, custom context menus, and developer tools—can be implemented cleanly using **HTML5, CSS3, and Vanilla JavaScript with zero external frameworks or build steps**.

---

## 🚀 Live Demo

Experience the simulation directly in your browser:

🔗 **[https://<github-username>.github.io/bib/](https://<github-username>.github.io/bib/)**

*(Replace `<github-username>` with your GitHub handle when deployed)*

---

## ✨ Features

### 🗂️ Advanced Tab Management
- **Multi-Tab Life Cycle**: Open, close, switch, and duplicate tabs with fluid slide and scale micro-animations.
- **Tab Pinning**: Pin tabs into compact icons that stay permanently at the left of the tab strip.
- **Context Menus**: Right-click any tab for *New Tab*, *Duplicate Tab*, *Reload*, *Pin/Unpin*, *Close Tab*, *Close Other Tabs*, and *Close Tabs to Right*.
- **Closed Tab Restorer**: Accidentally closed a tab? Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd> to restore it immediately.
- **Automatic Fallback**: Closing the last tab automatically creates a fresh tab.

### 🧭 Omnibox & Simulated Navigation Engine
- **Address & Search Bar**: Type internal `bib://` URIs, domains like `github.com` or `google.com`, or any search query.
- **Smart Autocomplete**: Live suggestions dropdown matching bookmarks, browsing history, and internal destinations.
- **Realistic Loading States**: Non-blocking simulated loading progress bar with realistic variable latency (300ms–750ms).
- **Per-Tab History Stack**: Functional Back, Forward, and Reload controls with auto-disabled states.
- **Interactive Search Engine**: Entering queries displays rich simulated search result pages with working hyperlinks.

### 🎨 Dynamic Theme Engine
Switch between 4 meticulously crafted design palettes:
- **Dark Slate**: Modern dark mode with frosted glass and indigo accents.
- **Clean Light**: Crisp, bright Safari/macOS light theme.
- **Deep Midnight**: Oceanic dark navy with cyan neon highlights.
- **Cyber Neon**: Futuristic cyberpunk terminal theme with neon glows.

### 🛠️ Built-in Developer Console & DevTools
Open `bib://developer` to access:
- **Interactive REPL Console**: Execute virtual commands (`help`, `tabs`, `history`, `bookmarks`, `clear`, `whoami`, `sudo bib`, `theme`, `navigate`).
- **DOM Elements Tree**: Live virtual tree inspector of the simulated page.
- **Storage Viewer**: View and manage all `localStorage` keys and values in real-time.
- **Network Panel**: Simulated resource waterfall with status codes and payload sizes.
- **Performance Gauges**: Real-time FPS, DOM node count, and JS heap indicators.

### 🎮 Arcade Mini Games
Open `bib://games` to play:
1. **Click the Dot (Reflex Trainer)**: 30-second target shooter tracking combos, reflexes, and high scores.
2. **Browser Dino Runner**: Canvas-based runner with jumping physics, obstacle generation, score multiplier, and Web Audio API synthesized sound effects.

### ⭐ Bookmarks, History & Downloads
- **Bookmark Bar**: Quick launch favorites with toggleable visibility (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>).
- **Star Button**: Animated star pop and sparkles with toast feedback.
- **Date-Grouped History**: Real-time browsing history with search filtering and individual or bulk deletion.
- **Downloads Manager**: Fake downloads list with simulated active download progress bar.

### 👾 Playful Window Controls & Easter Eggs
- **Playful Close**: Try closing the browser window with the red traffic light button—BiB politely refuses to close itself with an animated shake!
- **Minimize & Restore**: Shrink the browser into a floating desktop dock pill and restore with a smooth pop.
- **Konami Code**: Enter <kbd>↑</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>B</kbd> <kbd>A</kbd> to unlock Cyber mode and the Matrix Secret Chamber (`bib://secret`).
- **Hidden Queries**: Search for `"is this a real browser"` or run `"sudo bib"` in the terminal.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>T</kbd> | Open a new tab |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>W</kbd> | Close active tab |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>L</kbd> | Focus and select omnibox address bar |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd> | Reopen last closed tab |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>R</kbd> | Reload current page |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>D</kbd> | Bookmark or unbookmark current page |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> | Toggle bookmark bar visibility |
| <kbd>Alt</kbd> + <kbd>←</kbd> | Navigate Back |
| <kbd>Alt</kbd> + <kbd>→</kbd> | Navigate Forward |
| <kbd>Esc</kbd> | Dismiss any open menu, modal, or dropdown |
| <kbd>Enter</kbd> | Submit URL or search query |
| **Konami Code** | Unlock Cyberpunk Mode & Matrix Secret Chamber |

---

## 📂 Project Structure

```text
bib/
│
├── index.html              # Main application shell & desktop environment
│
├── css/
│   ├── main.css            # Browser chrome, layout, viewport & components
│   ├── themes.css          # CSS variable definitions for 4 themes
│   ├── animations.css      # Keyframes, tab transitions, toasts & loading bar
│   └── responsive.css      # Tablet and mobile viewport breakpoints
│
├── js/
│   ├── app.js              # Application bootstrapper and lifecycle
│   ├── browser.js          # Browser window controller & internal page renderers
│   ├── tabs.js             # Tab state manager, animations & pinning
│   ├── navigation.js       # Navigation engine, loading progress & history stacks
│   ├── search.js           # Query normalizer, autocomplete & simulated search
│   ├── bookmarks.js        # Bookmarks management & bookmark bar
│   ├── history.js          # Browsing history tracking & persistence
│   ├── storage.js          # LocalStorage abstraction with memory fallback
│   ├── themes.js           # Theme switching controller
│   ├── keyboard.js         # Global keyboard shortcuts & Konami listener
│   ├── context-menu.js     # Custom right-click menus for tabs, links & viewport
│   ├── notifications.js    # Toast notification manager
│   └── games.js            # Click the Dot & Canvas Dino Runner mini games
│
├── LICENSE                 # MIT License
├── README.md               # Documentation & setup guide
└── .gitignore              # Repository ignore rules
```

---

## 🛠️ Technology Stack

- **HTML5**: Semantic tags (`<header>`, `<main>`, `<nav>`, `<section>`, `<footer>`), ARIA accessibility attributes.
- **CSS3**: Custom properties (CSS variables), CSS Grid, Flexbox, glassmorphic backdrop filters, cubic-bezier transitions, and media queries (`prefers-reduced-motion`).
- **Vanilla JavaScript (ES6+)**: Clean Object-Oriented component architecture with zero external dependencies.
- **Web Audio API**: Real-time sound synthesis for UI clicks, game jumps, and notifications without audio assets.
- **HTML5 Canvas**: Frame-based rendering engine for the Dino Runner and Matrix rain effects.
- **LocalStorage API**: Safe data persistence across browser reloads.

---

## 🚀 Running Locally

Because BiB requires **no build step, no npm install, and no backend**, you can run it immediately:

### Option 1: Direct File Open
Simply double-click `index.html` in your file explorer to open it in your browser.

### Option 2: Simple Local Server
Using Python:
```bash
python -m http.server 8000
```
Or using Node `npx serve`:
```bash
npx serve .
```
Then visit `http://localhost:8000`.

---

## 🚢 GitHub Pages Deployment

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete BiB browser simulation"
   git branch -M main
   git remote add origin https://github.com/<your-username>/bib.git
   git push -u origin main
   ```
2. In your GitHub repository, navigate to **Settings** → **Pages**.
3. Under **Build and deployment** > **Branch**, select `main` and root folder `/`, then click **Save**.
4. Your site will be live within seconds at:
   `https://<your-username>.github.io/bib/`

*(All internal paths use relative `./` URLs to guarantee subpath compatibility!)*

---

## 💡 Why BiB?

BiB is a frontend experiment demonstrating:
- State management across multiple coordinated UI components without heavy state libraries.
- How to architect modular, clean vanilla JavaScript codebases.
- Creative micro-interactions and desktop simulation ergonomics.
- Accessible, responsive web design that looks like an operating system application.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
