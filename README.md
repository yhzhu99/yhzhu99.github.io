# yhzhu99.github.io

> Personal academic homepage for Yinghao Zhu.

Built as a single-page app with a tabbed home page (About, Publications, Experience, Honors & Service) and an interactive 3D "world" view. All content is data-driven, and a LaTeX CV is generated from the same source data.

## Tech Stack

- [Vue 3](https://vuejs.org/) + TypeScript — UI framework (`<script setup>`)
- [Vue Router](https://router.vuejs.org/) — client-side routing
- [Vite](https://vite.dev/) — build tooling
- [Tailwind CSS v4](https://tailwindcss.com/) — styling (via `@tailwindcss/vite`)
- [Three.js](https://threejs.org/) — 3D scene at `/world`
- [oxlint](https://oxc.rs/) / [Prettier](https://prettier.io/) / `vue-tsc` — lint, format, typecheck

## Getting Started

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:5173
```

### Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the Vite dev server                    |
| `npm run build`     | Production build to `dist/`                  |
| `npm run preview`   | Preview the production build locally         |
| `npm run typecheck` | Type-check with `vue-tsc`                    |
| `npm run lint`      | Lint with `oxlint`                           |
| `npm run format`    | Format with `prettier`                       |
| `npm run cv:tex`    | Generate the LaTeX CV from `src/data/*.ts`   |

## Project Structure

```
src/
├── data/          # All site content (profile, publications, experience, …)
├── components/    # Reusable Vue components
├── views/         # Route views: HomeView, WorldView, NotFoundView
├── world/         # Three.js 3D scene for /world
├── utils/         # Helpers (publications sorting/filtering, site data, html)
├── router/        # Vue Router config
├── types.ts       # Shared TypeScript types
├── styles.css     # Global styles
├── App.vue        # Root component
└── main.ts        # App entry
scripts/
└── generate-cv.ts # Generates build/cv/YinghaoZhu_CV.tex from site data
.github/workflows/
└── deploy.yml     # CI: typecheck → build → CV PDF → deploy to GitHub Pages
```

## Updating Content

Edit the files under `src/data/` — changes to the home page and the generated CV both flow from this single source. Run `npm run cv:tex` to regenerate the LaTeX CV.

## Deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`), which typechecks, builds the site, compiles the CV to PDF, and deploys everything to GitHub Pages.
