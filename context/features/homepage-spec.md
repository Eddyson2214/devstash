# Homepage Spec

## Overview

Replace the current placeholder `src/app/page.tsx` (`<h1>Devstash</h1>`) with the real marketing homepage, built from the static prototype in `prototypes/homepage/` (`index.html` / `styles.css` / `script.js`, see `homepage-mockup-spec.md`). Same sections, layout, copy, and animations as the mockup — rebuilt as proper Next.js/React components using Tailwind v4 + shadcn instead of raw HTML/CSS/vanilla JS.

## Component Breakdown

Route: `src/app/page.tsx` (server component, composes the sections below, no data fetching needed).

New components under `src/components/homepage/`:

**Server components** (static markup, no interactivity):
- `Navbar.tsx` — logo, Features/Pricing anchor links, Sign In / Get Started buttons. Wraps a small client piece for the scroll-opacity effect (see below), so the component itself can stay server-rendered.
- `Hero.tsx` — eyebrow, gradient headline, subheadline, CTA buttons. Renders `HeroVisual` (client) for the chaos/arrow/dashboard-preview animation.
- `Features.tsx` — section heading + 6 `FeatureCard`s (Snippets, Prompts, Search, Commands, Files & Docs, Collections).
- `AiSection.tsx` — Pro badge + checklist (left), static code-window mockup with the "AI Generated Tags" demo (right). Tag pop-in can be a plain CSS animation (`animation-delay` per tag), no JS/client component needed.
- `CtaSection.tsx` — closing CTA band.
- `Footer.tsx` — logo, link columns, copyright. Year via `new Date().getFullYear()` computed server-side (no need for the mockup's client-side `#year` JS trick).

**Client components** (`"use client"`, isolate interactivity per DRY/minimal-client-surface):
- `NavbarScroll.tsx` (or a hook `useScrolled()`) — tracks scroll position, toggles the navbar's opaque/background state. Thin wrapper so `Navbar.tsx` itself stays a server component passing children/className.
- `HeroVisual.tsx` — the chaos container (8 drifting/bouncing/mouse-repelling icons), transform arrow, and dashboard preview. Owns the `requestAnimationFrame` physics loop (port `script.js`'s chaos-icon logic to a `useEffect`).
- `PricingSection.tsx` — Free vs Pro cards plus the monthly/yearly toggle; toggle state lives here since it drives the displayed price/period on the Pro card.
- `FadeIn.tsx` — generic reusable wrapper (`IntersectionObserver`-based) used across sections in place of the mockup's global `.fade-in` scroll-reveal script. Keeps the reveal behavior DRY instead of re-implementing observer logic per section.

## Styling

- Tailwind v4 + shadcn, matching the rest of the app (dark by default, per `coding-standards.md`) — no new `tailwind.config.*`, no separate `styles.css`.
- Reuse shadcn `Button` for all CTAs/nav actions (`variant="default"` / `"outline"` / `"ghost"` as appropriate) instead of the mockup's custom `.btn` classes.
- **Item-type accent colors**: use the canonical palette from `project-overview.md` (`Snippet #3b82f6`, `Prompt #8b5cf6`, `Command #f97316`, `Note #fde047`, `File #6b7280`, `Image #ec4899`, `Link #10b981`) instead of the mockup's standalone homepage palette, so feature-card colors visually match the app's real sidebar/item-type colors. Feature cards should map 1:1 to real item types where possible (Snippets, Prompts, Commands, Files, plus non-type cards like Instant Search/Collections can use a neutral or existing accent).
- Reuse `lucide-react` icons already used elsewhere in the app (`Code`, `Sparkles`, `Terminal`, `Search`, `Files`, `LayoutGrid`, `Github`, etc.) in place of the mockup's hand-drawn inline SVGs, wherever a lucide icon covers it. Keep custom inline SVGs only for logos lucide doesn't have (Notion, Slack, VS Code) in the chaos container — matching the mockup's disclaimer that these are simple hand-drawn stroke icons, not exact brand marks.
- Any one-off gradient/animation keyframes (gradient-text, arrow pulse, tag pop-in, chaos-icon pulse) go in `globals.css` via `@theme`/plain `@keyframes`, per the Tailwind v4 rules in `coding-standards.md`.

## Links & Navigation

All buttons/links must resolve to real routes — no placeholder `href="#"` where a real destination exists:

| Element | Target |
|---|---|
| Navbar logo | `/` |
| Navbar "Features" | `#features` (in-page anchor) |
| Navbar "Pricing" | `#pricing` (in-page anchor) |
| Navbar "Sign In" | `/sign-in` |
| Navbar "Get Started" | `/register` |
| Hero "Get Started Free" | `/register` |
| Hero "See How It Works" | `#features` (in-page anchor) |
| Pricing "Get Started Free" (Free card) | `/register` |
| Pricing "Upgrade to Pro" (Pro card) | `/register` (no live billing yet, per Monetization dev-mode note — same entry point as Free) |
| CTA section button | `/register` |
| Footer logo | `/` |
| Footer "Features" / "Pricing" | `#features` / `#pricing` |
| Footer "About" / "Blog" / "Privacy" / "Terms" | No corresponding pages exist yet — leave as non-navigating (e.g. `#`) rather than inventing routes; flagged as a known gap, not silently faked |

Use Next.js `Link` for every internal route (`/register`, `/sign-in`, `/`) and plain anchor tags only for same-page `#hash` links.

## Animations (ported from `script.js`)

- Chaos icons: drift + wall-bounce + mouse-repel physics loop, CSS pulse (scale/shadow) — in `HeroVisual.tsx`, `useEffect` + `requestAnimationFrame`, cleaned up on unmount.
- Transform arrow: CSS pulse animation, rotates 90° on mobile (Tailwind responsive classes, not JS).
- Scroll-reveal: `FadeIn` wrapper using `IntersectionObserver` (replaces the mockup's single global observer over all `.fade-in` elements).
- Navbar opacity-on-scroll: small client hook/component as described above.
- Pricing toggle: React state in `PricingSection.tsx`, swaps displayed `$8/mo` ↔ `$72/yr` on the Pro card (no DOM `data-monthly`/`data-yearly` attribute swapping like the mockup).

## Responsive

Match the mockup: chaos/arrow/dashboard-preview stack vertically on mobile with the arrow rotated to point down, nav links hidden on small screens, grids collapse to a single column — via Tailwind responsive utilities, no separate mobile CSS file.

## Out of Scope

- No auth-aware behavior (e.g. hiding Sign In / redirecting if already logged in) — not in the mockup, not requested.
- No new pages for About/Blog/Privacy/Terms.
- `prototypes/homepage/` stays as-is (reference prototype); this feature only adds the real `src/app/page.tsx` + `src/components/homepage/*`.
