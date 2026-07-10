# Current Feature
<!--Feature name and short description -->

## Status

Completed

## Goals
<!-- Goals and requirements -->

## Notes
<!-- Any extra notes -->

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