# Current Feature: Auth Setup - NextAuth + GitHub Provider
<!--Feature name and short description -->
Set up NextAuth v5 with Prisma adapter and GitHub OAuth, protect `/dashboard/*` routes, use NextAuth's default pages for testing.

## Status

Not Started

## Goals
<!-- Goals and requirements -->
- Install NextAuth v5 (`next-auth@beta`) and `@auth/prisma-adapter`.
- Set up split auth config pattern for edge compatibility.
- Add GitHub OAuth provider.
- Protect `/dashboard/*` routes using the Next.js 16 proxy (`src/proxy.ts`).
- Redirect unauthenticated users to sign-in.
- Create `src/auth.config.ts` — edge-compatible config (providers only, no adapter).
- Create `src/auth.ts` — full config with Prisma adapter and JWT strategy.
- Create `src/app/api/auth/[...nextauth]/route.ts` — export handlers from `auth.ts`.
- Create `src/proxy.ts` — route protection with redirect logic.
- Create `src/types/next-auth.d.ts` — extend Session type with `user.id`.

## Notes
<!-- Any extra notes -->
- Use Context7 to verify the newest NextAuth config and conventions before implementing.
- Use `next-auth@beta` (not `@latest`, which installs v4).
- Proxy file must be at `src/proxy.ts` (same level as `app/`); use named export `export const proxy = auth(...)`, not a default export.
- Use `session: { strategy: 'jwt' }` with the split config pattern.
- Don't set a custom `pages.signIn` — use NextAuth's default page.
- Required env vars: `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`.
- Testing plan: visiting `/dashboard` should redirect to sign-in; "Sign in with GitHub" should redirect back to `/dashboard` after auth.
- References: https://authjs.dev/getting-started/installation#edge-compatibility, https://authjs.dev/getting-started/adapters/prisma
- Previous feature (Code Scan Quick Wins) was reviewed and passed (build/lint/browser-verified) prior to loading this spec; still pending commit/merge.

## History
<!-- Keep this updated. Earliest to latest -->
- 2026-07-04 - Initial Next.js and Tailwind setup committed (`chore: initial next.js and tailwind setup`) and pushed to `origin/master` at https://github.com/Eddyson2214/devstash.git.
- 2026-07-05 - Dashboard UI Phase 1 (ShadCN setup, /dashboard route, placeholder layout) implemented and verified on `feature/dashboard-phase-1`.
- 2026-07-05 - Dashboard UI Phase 2 (collapsible sidebar, item type links to /items/[type], favorite/recent collections, user avatar footer, mobile drawer) implemented on `feature/dashboard-phase-2`; build and lint verified.
- 2026-07-05 - Dashboard UI Phase 3 (stats cards, recent collections grid, pinned items, 10 recent items) implemented on `feature/dashboard-phase-3`, merged to `master`, and pushed to `origin/master`.
- 2026-07-07 - Prisma 7 + Neon Postgres setup (schema with NextAuth models, prisma.config.ts, PrismaNeon adapter client, dev/production Neon branches, system ItemType seed script) implemented on `feature/prisma-neon-setup`; migration applied and verified against the Neon `development` branch, build and lint passing.
- 2026-07-07 - Seed data (demo user with bcryptjs-hashed password, 7 system item types, 5 collections with 18 items) implemented on `feature/seed-data`; idempotent re-seed verified, build and lint passing.
- 2026-07-08 - Dashboard Collections (real Recent Collections data via new `src/lib/db/collections.ts`, fetched directly in the `RecentCollections` server component, border accent + type icons derived from the most-used item type per collection) implemented on `feature/dashboard-collections`; build and lint passing.
- 2026-07-08 - Dashboard Items (real pinned/recent item data via new `src/lib/db/items.ts`, fetched directly in the `DashboardPage` server component, item card icon/border derived from item type, pinned section hidden when empty, stats cards wired to live item/collection counts via new `getCollectionStats`) implemented on `feature/dashboard-items`; build and lint passing.
- 2026-07-09 - Stats & Sidebar (sidebar item types, favorite/recent collections, and "View all collections" links wired to Neon data via new `getItemTypesWithCounts` in `src/lib/db/items.ts` and new `getFavoriteCollections` in `src/lib/db/collections.ts`; recents show a colored circle by most-used item type, favorites keep the star badge; `AppSidebar` now receives data as props from `DashboardPage`; removed now-unused mock collections/items from `src/lib/mock-data.ts`) implemented on `feature/stats-sidebar`.
- 2026-07-10 - Add Pro Badge to Sidebar (subtle uppercase "PRO" badge using the ShadCN `Badge` component, shown next to the File and Image item types in the sidebar's Types list, hidden when the sidebar is collapsed) implemented on `feature/add-pro-badge-sidebar`; build and lint passing.
- 2026-07-17 - Code Scan Quick Wins (dashboard components receive data as props instead of re-fetching, `dashboard/loading.tsx` + `error.tsx` added, `db/sampledata.tsx`/`db/typesystem.tsx` moved to `prisma/*.ts`, item-type slug logic deduped via `typeHref`, seed script writes batched with `Promise.all`/`createMany`, `aria-label`/`aria-hidden` added across dashboard components, weak demo password replaced; also fixed a pre-existing `npm run build` failure by marking `/dashboard` `force-dynamic`) implemented on `feature/code-scan-quick-wins`; build, lint, and browser verified.