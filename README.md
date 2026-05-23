# Lucas Thiessen — Portfolio

Personal portfolio site: [lucasthiessen14.github.io](https://lucasthiessen14.github.io/)

## Development

```bash
npm install
npm run dev
```

Opens a local server at `http://localhost:8080` and watches SCSS/JS for changes.

## Build before deploy

GitHub Pages serves static files from this repo. Compile assets before pushing:

```bash
npm run build
```

This generates `css/styles.css` (expanded, readable CSS with a source map) and `js/main.min.js`. Edit styles in `scss/` — not in the compiled CSS.

## Stack

- HTML + modular SCSS (dark/light theme)
- Vanilla JavaScript (no jQuery or UI frameworks)
- Gulp + Dart Sass for build
