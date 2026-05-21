# FindtheDoc 🩺

**Find doctors and hospitals nearest to you.**

## How to Run in VS Code

### Option 1 — Live Server (Recommended)
1. Open VS Code
2. Install the **Live Server** extension (by Ritwick Dey)
3. Open the `FindtheDoc` folder in VS Code
4. Right-click `INTRO.html` → **"Open with Live Server"**
5. Your browser will open at `http://127.0.0.1:5500/INTRO.html`

### Option 2 — Just open the file
- Double-click `INTRO.html` or `index.html` to open in your browser directly
- ⚠️ The map's geolocation may require Live Server (some browsers block it on `file://`)

## Features
- 🎬 **Animated intro page** (INTRO.html) → leads to main site
- 🗺️ **Live map** — click "Use My Location" to find hospitals, doctors, dentists nearby (uses OpenStreetMap, no API key needed)
- 🔐 **Login / Register** — works via `localStorage`, no backend needed
- 🔍 **Search** — search specialty cards by name
- 🎨 **Hover cards, flip cards, scrolling text** — all animations working

## File Structure
```
FindtheDoc/
├── INTRO.html        ← Entry point / splash page
├── index.html        ← Main page
├── register.html     ← Standalone login/register page
├── style.css         ← Main styles
├── styleintro.css    ← Intro page styles
├── register.css      ← Register page styles
├── script.js         ← All JS (map, auth, search, animations)
└── MAIN/             ← Images and video assets
    ├── vid.mp4
    ├── eye.jpg, heart.jpg, mri.jpg ...
    └── suneha.jpg, reshiv.jpg, doco.jpg
```
