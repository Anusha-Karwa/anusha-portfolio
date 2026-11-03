# Anusha Karwa · Portfolio

A 3D, scroll-driven portfolio. A paper boat drifts down a river from dawn to lantern-lit night, and each stop reveals part of the résumé: education, experience, leadership, projects, achievements, certifications and skills.

**Built for the Skillinf Portfolio Design Hackathon 2026.**

## Features
- Real-time 3D valley built with [three.js](https://threejs.org): terrain, river, waterfall, lake, forest, meadow, birds, fireflies and sky lanterns
- Time of day changes from dawn to night as you move through the story
- One scroll, swipe or arrow key moves to the next stop, so nothing flies past unread
- **Play** mode tours the whole journey on its own
- **Résumé** view shows every section as a clean, readable page (also the fallback without WebGL)
- Optional generated nature soundscape: brook, wind, birds, waterfall, crickets
- Works on desktop and mobile, respects reduced-motion settings

## Run locally
No build step. Serve the folder with any static server:

```bash
python3 -m http.server 8000
# or
npx serve -l 8000
```

Then open http://localhost:8000.

## Deploy
Import this repository into [Vercel](https://vercel.com/new). It's a static site, so leave the framework preset as **Other** with no build command.

## Structure
```
index.html      page markup and résumé content
css/styles.css  styles and theme tokens
js/boot.js      fallback to the text résumé if 3D can't start
js/main.js      3D scene, navigation, sound
vercel.json     Vercel settings
```
