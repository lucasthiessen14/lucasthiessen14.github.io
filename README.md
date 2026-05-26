# Lucas Thiessen — Portfolio

Personal portfolio site: [lucasthiessen.com](https://lucasthiessen.com)

## Development

```bash
npm install
npm run dev
```

Opens the Vite dev server with hot reload for React, TypeScript, and SCSS.

## Build

```bash
npm run build
npm run preview
```

Production output is written to `dist/`.

## Deploy

Pushes to `main` trigger [GitHub Actions](.github/workflows/deploy.yml) to build and deploy to GitHub Pages. No need to commit built assets.

Configure the repository: **Settings → Pages → Build and deployment → GitHub Actions**.

## Stack

- React 19 + TypeScript
- Vite (dev server and production build)
- SCSS (modular styles under `src/styles/`)
- MUI Icons (icons only; custom styling preserved)
- GitHub Pages + custom domain via `public/CNAME`
