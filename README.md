# The Algorithm Garden

The Algorithm Garden is an interactive landing page about reclaiming attention from recommendation systems.

Instead of asking a feed what should matter next, visitors interrupt it, choose a handful of human intentions, and watch those choices grow into a personal digital garden.

Built for the Webflow × GSAP × CodeTV challenge with Astro, GSAP, and Webflow Cloud.

## The experience

The page unfolds as a five-part scroll narrative:

1. **The prediction** — an algorithmic feed appears to know what already occupies the visitor’s attention.
2. **The interruption** — the feed is reframed as a monoculture that narrows what the visitor gets to see.
3. **The choice** — visitors plant seeds such as Make, Wander, Listen, Notice, Repair, Play, and Read.
4. **The garden** — only the selected intentions grow into animated plants.
5. **The reminder** — the resulting garden makes the visitor’s decisions visible: their attention is still theirs.

## Interaction and animation

- Scroll-driven narrative timelines with GSAP `ScrollTrigger`
- Scrubbed hero, interruption, garden, and closing transitions
- SVG stem and neural-branch drawing with `DrawSVGPlugin`
- Drag-and-drop seed planting with GSAP `Draggable`
- Staggered plant, petal, leaf, and grass growth
- Procedural plant sway and looping pulse animations
- Pointer-responsive canvas grid distortion
- Page-wide mouse ripples and magnetic closing CTA
- Dynamic garden and closing copy based on the visitor’s choices
- Keyboard-accessible seed planting and a reduced-motion experience

## Technology

- [Astro](https://astro.build/)
- [GSAP](https://gsap.com/)
- [Webflow Cloud](https://webflow.com/cloud)
- SVG and Canvas 2D
- Plain CSS and JavaScript

## Local development

The project requires Node.js 22.12 or newer and npm.

```sh
npm install
npm run dev
```

The local site is available at `http://localhost:4321`.

For a production build:

```sh
npm run build
npm run preview
```

## Accessibility

- Semantic section headings and navigation
- Keyboard-operable seed controls
- Live announcements for planting progress
- Visible focus states
- `prefers-reduced-motion` fallbacks
- Touch-friendly planting controls

## Assets and credits

See [CREDITS.md](./CREDITS.md) for artwork, footage, and licensing notes.

## Submission

- **Live site:** Added after Webflow Cloud deployment
- **Source:** [github.com/leeahcim/the-algorithm-garden](https://github.com/leeahcim/the-algorithm-garden)
- **Challenge:** [Webflow × GSAP × CodeTV](https://codetv-gsap-cloud.webflow.io/)
