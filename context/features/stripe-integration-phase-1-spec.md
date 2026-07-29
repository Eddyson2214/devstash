# Stripe Integration - Phase 1 (Core Infrastructure)

## Overview

Lay the billing plumbing DevStash Pro needs before any checkout/webhook flow exists: schema fields for subscription lifecycle state, a Stripe client singleton, a DB query layer for billing data, a pure usage-limits module, and `isPro` flowing into the session. Nothing in this phase talks to the live Stripe API or requires `stripe listen` — it's schema, plumbing, and unit tests only. See `docs/stripe-integration-plan.md` for the full research this spec is drawn from.

## Prerequisite Bug Fix

- `getCollectionStats()` in `src/lib/db/collections.ts` still calls a hardcoded `getDemoUserId()` instead of taking a `userId` param (unlike the already-fixed `getItemStats(userId)` in `items.ts`). Fix the signature to `getCollectionStats(userId: string)` and update its one call site (dashboard stats) before building anything that depends on an accurate collection count.

## Requirements

- Add subscription lifecycle fields to `User` via a real Prisma migration (never `db push`): `stripePriceId`, `stripeCurrentPeriodEnd`, `subscriptionStatus`. `isPro`/`stripeCustomerId`/`stripeSubscriptionId` already exist — do not re-add them.
- Install the `stripe` npm package (server SDK only — no `@stripe/stripe-js` needed in this phase).
- Create a Stripe client singleton following the same module-scope-singleton pattern as `src/lib/prisma.ts` and `src/lib/rate-limit.ts`'s Redis client.
- Create a billing query layer in `src/lib/db/billing.ts`, matching the one-file-per-settings-concern precedent (`db/settings.ts`, `db/profile.ts`).
- Create a pure usage-limits module in `src/lib/limits.ts`, matching the `feature-flags.ts` naming/shape convention (a single exported constant/function set, no I/O).
- Sync `isPro` into the NextAuth session by extending the **existing** `session` callback's `select` in `src/auth.ts` — do not add a `jwt` callback or a second DB query. The `session` callback already does one DB read per session validation to hydrate `emailVerified`; add `isPro` to that same query.
- Extend `Session.user` in `src/types/next-auth.d.ts` with `isPro: boolean`.

## Files to Create

1. `src/lib/stripe.ts`
   ```typescript
   import Stripe from "stripe";

   export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
     apiVersion: "<pin to installed SDK's expected version>",
   });

   export const STRIPE_PRICE_IDS = {
     monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
     yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
   } as const;
   ```

2. `src/lib/db/billing.ts`
   ```typescript
   export interface BillingInfo {
     isPro: boolean;
     stripePriceId: string | null;
     subscriptionStatus: string | null;
     currentPeriodEnd: Date | null;
   }

   export async function getBillingInfo(userId: string): Promise<BillingInfo | null> {}
   export async function setStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void> {}
   export async function syncSubscriptionFromStripe(
     stripeCustomerId: string,
     data: { isPro: boolean; stripeSubscriptionId: string | null; stripePriceId: string | null; subscriptionStatus: string | null; currentPeriodEnd: Date | null }
   ): Promise<void> {} // upsert by stripeCustomerId — used by Phase 2's webhook handler, but belongs here with the rest of the billing query layer
   export async function countItemsForUser(userId: string): Promise<number> {} // prisma.item.count
   export async function countCollectionsForUser(userId: string): Promise<number> {} // prisma.collection.count
   ```
   `countItemsForUser`/`countCollectionsForUser` are deliberately new and separate from `getItemStats`/`getCollectionStats` — those return more than a limit check needs and are already used by dashboard-stats call sites that shouldn't be coupled to billing.

3. `src/lib/limits.ts` — the usage-limits module:
   ```typescript
   export const FREE_ITEM_LIMIT = 50;
   export const FREE_COLLECTION_LIMIT = 3;

   export function isLimitEnforcementEnabled(): boolean {
     return process.env.BILLING_LIMITS_ENABLED === "true"; // defaults OFF
   }

   export function hasReachedItemLimit(currentCount: number, isPro: boolean): boolean {
     return !isPro && currentCount >= FREE_ITEM_LIMIT;
   }

   export function hasReachedCollectionLimit(currentCount: number, isPro: boolean): boolean {
     return !isPro && currentCount >= FREE_COLLECTION_LIMIT;
   }
   ```
   Keep this file pure (no Prisma/Stripe imports) so it needs no mocking, per `coding-standards.md`'s testing scope.

4. `src/lib/limits.test.ts` — unit tests covering:
   - `isLimitEnforcementEnabled()` defaults to `false` when `BILLING_LIMITS_ENABLED` is unset, `true` only when exactly `"true"`.
   - `hasReachedItemLimit`/`hasReachedCollectionLimit`: below limit → `false`; at/above limit → `true` for free users; always `false` for Pro users regardless of count.

## Files to Modify

- `prisma/schema.prisma` — add the three new `User` fields. Run `prisma migrate dev --name add_stripe_subscription_fields`, then `prisma migrate status`.
- `src/auth.ts` — extend the `session` callback's `select` to also fetch `isPro`.
- `src/types/next-auth.d.ts` — add `isPro: boolean` to `Session.user`.
- `src/lib/db/collections.ts` — the prerequisite `getCollectionStats(userId)` fix above.
- `package.json` — add `stripe` to `dependencies`.

## Environment Variables

Already present in `.env` (verify, don't recreate): `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_YEARLY`. Add:

```
BILLING_LIMITS_ENABLED=false
```

Not needed yet in this phase: `STRIPE_WEBHOOK_SECRET` (Phase 2).

## Testing

- `src/lib/limits.test.ts` passes, brings the suite total up accordingly.
- `npm run test` — full suite still passes after the `session` callback and schema changes.
- `npm run build` — confirm no unrelated pages flip from static to dynamic (a prior feature regressed public-page static generation via an unrelated root-layout `auth()` call — the session callback change here is isolated to logic already run on every authenticated request, so this should be a non-issue, but re-check the build output's `○`/`ƒ` markers for `/`, `/register`, etc.).
- `prisma migrate status` clean.
- No browser/Playwright walkthrough needed for this phase — nothing user-facing changes yet. `session.user.isPro` can be spot-checked by logging it server-side during a normal signed-in page load.

## Notes

- This phase intentionally stops short of calling any live Stripe API (checkout, billing portal, webhooks) — that's Phase 2, which also needs `stripe listen` for local webhook testing.
- Per `context/project-overview.md`'s dev-mode note, limit enforcement stays off (`BILLING_LIMITS_ENABLED=false`) until explicitly flipped on — this phase only builds the module, it does not wire it into `createItem`/`createCollection` (that's Phase 2's feature-gating work).
