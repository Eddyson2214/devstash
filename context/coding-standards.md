# Coding Standards

## TypeScript

- Strict mode enabled
- No `any` types - use proper typing or `unknown`
- Define interfaces for all props, API responses, and data models
- Use type inference where obvious, explicit types where helpful

## React

- Functional components only (no class components)
- Use hooks for state and side effects
- Keep components focused - one job per component
- Extract reusable logic into custom hooks

## Next.js

- Server components by default
- Only use `'use client'` when needed (interactivity, hooks, browser APIs)
- Use Server Actions for form submissions and simple mutations
- Use API routes when you need:
  - Webhooks (Stripe, GitHub, etc.)
  - File uploads with progress tracking
  - Long-running operations
  - Specific HTTP status codes or headers
  - Endpoints for future mobile/CLI clients
  - Third-party integrations
- Otherwise, fetch data directly in server components
- Dynamic routes for item/collection pages

## Tailwind CSS v4

**CRITICAL**: We are using Tailwind CSS v4, which uses CSS-based configuration.

- **DO NOT** create `tailwind.config.ts` or `tailwind.config.js` files (those are for v3)
- All theme configuration must be done in CSS using the `@theme` directive in `src/app/globals.css`
- Use CSS custom properties for colors, spacing, etc.
- No JavaScript-based config allowed

Example v4 configuration:

```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(50% 0.2 250);
}
```

## File Organization

- Components: `src/components/[feature]/ComponentName.tsx`
- Pages: `src/app/[route]/page.tsx`
- Server Actions: `src/actions/[feature].ts`
- Types: `src/types/[feature].ts`
- Lib/Utils: `src/lib/[utility].ts`

## Naming

- Components: PascalCase (`ItemCard.tsx`)
- Files: Match component name or kebab-case
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase (no prefix)

## Styling

- Tailwind CSS for all styling
- Use shadcn/ui components where applicable
- No inline styles
- Dark mode first, light mode as option

## Database

- Use Prisma ORM for all database operations
- Always use `prisma migrate dev` for schema changes (not `db push`)
- Run `prisma migrate status` before committing to verify migrations are in sync
- Production deployments must run `prisma migrate deploy` before the app starts

## Data Fetching

- Server components fetch directly with Prisma
- Client components use Server Actions
- Validate all inputs with Zod

## Error Handling

- Use try/catch in Server Actions
- Return `{ success, data, error }` pattern from actions
- Display user-friendly error messages via toast

## Testing

- **Vitest**, run via `npm run test` (single run), `npm run test:watch`, or `npm run test:coverage`
- Scope: unit test **Server Actions** (`src/actions/*.ts`) and **utilities** (`src/lib/**/*.ts`) only — no component testing
- Test files are colocated with the source file: `src/lib/foo.ts` → `src/lib/foo.test.ts`
- `vitest.config.ts` runs in the `node` environment with tsconfig path aliases (`@/*`) resolved — no DOM, no React plugin
- Mock module boundaries with `vi.mock(...)`, not real I/O:
  - `@/lib/prisma` — mock the `prisma` client rather than hitting Neon
  - `@/auth` — mock `auth`/`signIn`/`signOut` rather than exercising NextAuth
  - External services (Resend, Upstash) — mock rather than calling out
- Pure utilities (no external deps, e.g. `src/lib/auth-errors.ts`) need no mocking
- See `src/lib/auth-errors.test.ts` (pure utility) and `src/actions/profile.test.ts` (mocked Server Action) for the reference pattern

## Code Quality

- No commented-out code unless specified
- No unused imports or variables
- Keep functions under 50 lines when possible
