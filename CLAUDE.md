# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types

## Context Files
Read the following to get the fulll context of the project:
- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

- `npm run dev` — start dev server (Turbopack, default in Next 16) at http://localhost:3000
- `npm run build` — production build (Turbopack by default; add `--webpack` to opt out)
- `npm run start` — serve the production build
- `npm run lint` — run ESLint directly (the `next lint` command was removed in Next 16)
- No test runner is configured in this repo.


## Working in this Next.js version

Next 16 diverges from older Next.js knowledge in ways relevant to day-to-day edits here:

- `params` and `searchParams` in `page.tsx`/`layout.tsx` are **Promises** — always `await` them (no synchronous fallback, unlike Next 15).
- Middleware is named `proxy` (`proxy.ts`, exported function `proxy`), not `middleware` — only relevant if adding one, none exists yet.
- Turbopack is the default bundler for both `dev` and `build`; a custom Webpack config will fail the build unless you pass `--webpack` or migrate the config.
- When unsure whether an API works the way you remember, check `node_modules/next/dist/docs/` before writing code, per `AGENTS.md`.
