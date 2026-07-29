# Stripe Integration - Phase 2 (Integration & UI)

## Overview

Build on Phase 1's plumbing (`src/lib/stripe.ts`, `src/lib/db/billing.ts`, `src/lib/limits.ts`, session `isPro`) to wire up real checkout, subscription-state sync via webhooks, free-tier limit enforcement, and the Settings page billing UI. Everything in this phase either calls the live Stripe API or needs `stripe listen --forward-to localhost:3000/api/webhooks/stripe` running locally to verify end-to-end. See `docs/stripe-integration-plan.md` for the full research this spec is drawn from.

**Depends on:** `stripe-integration-phase-1-spec.md` must be merged first — this phase imports `stripe`, `getBillingInfo`/`setStripeCustomerId`/`syncSubscriptionFromStripe`, `isLimitEnforcementEnabled`/`hasReachedItemLimit`/`hasReachedCollectionLimit`, and `session.user.isPro`, all built there.

## Requirements

- Two Server Actions for checkout and billing-portal redirects, following the `{ success, data | error }` discriminated-union pattern every other action in `src/actions/*.ts` uses, with Stripe SDK calls wrapped in `try/catch` (per `coding-standards.md`'s "use try/catch in Server Actions" — Stripe calls can throw on network/param errors, unlike the Zod-validated paths elsewhere in this codebase).
- A webhook route that verifies Stripe's signature and syncs subscription state to the DB. This is the one route in the app that deliberately does **not** call `auth()` — it's authenticated via the `stripe-signature` header instead, and must read the raw body via `request.text()` (not `.json()`), since signature verification needs the exact raw bytes.
- Wire the Phase 1 `limits.ts` module into `createItem`/`createCollection` as a real (but flag-gated) block, matching the "short-circuit with `{ success: false, error }` right after the `auth()` guard" pattern already used for every other precondition in those actions.
- A new "Billing" card on `/settings`, matching the existing `Card`/`CardHeader`/`Separator`/`CardContent` structure used by the Account and Editor Preferences cards, placed between them.
- Stripe Dashboard configuration: local + production webhook endpoints, Customer Portal enabled.

## Files to Create

1. `src/actions/billing.ts`
   ```typescript
   "use server";
   export async function createCheckoutSession(
     interval: "monthly" | "yearly"
   ): Promise<{ success: true; url: string } | { success: false; error: string }> {}

   export async function createBillingPortalSession(): Promise<
     { success: true; url: string } | { success: false; error: string }
   > {}
   ```
   Both: `auth()` guard → create/reuse `stripeCustomerId` (create via `stripe.customers.create({ email, metadata: { userId } })` if the user doesn't have one yet, persist via Phase 1's `setStripeCustomerId`) → `stripe.checkout.sessions.create(...)` / `stripe.billingPortal.sessions.create(...)` in `try/catch` → return the redirect `url`. Use the server-redirect flow (not `stripe.js`'s embedded checkout) so no publishable key is needed client-side.

2. `src/app/api/webhooks/stripe/route.ts`
   ```typescript
   export async function POST(request: Request) {
     const body = await request.text();
     const signature = request.headers.get("stripe-signature");
     if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

     let event: Stripe.Event;
     try {
       event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
     } catch {
       return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
     }

     switch (event.type) {
       case "checkout.session.completed":
       case "customer.subscription.created":
       case "customer.subscription.updated":
       case "customer.subscription.deleted":
         // resolve customer -> userId, call syncSubscriptionFromStripe(...)
         break;
     }

     return NextResponse.json({ received: true });
   }
   ```
   Route all four events through one shared "sync subscription state" path (derive `isPro` from `status === "active" || status === "trialing"`) rather than bespoke per-event logic, since they all converge on the same end state.

3. `src/components/settings/BillingCard.tsx` — client component showing current plan/status/renewal date, with either an "Upgrade to Pro" control (monthly/yearly → `createCheckoutSession`) or a "Manage Subscription" button (→ `createBillingPortalSession`), following the `EditorPreferencesForm`/`ChangePasswordForm` pattern of a client component calling a server action and toasting the result.

## Files to Modify

- `src/actions/items.ts` / `src/actions/collections.ts` — in `createItem`/`createCollection`, after the `auth()` guard: if `isLimitEnforcementEnabled()` and `!session.user.isPro`, call `countItemsForUser`/`countCollectionsForUser` and return `{ success: false, error: "..." }` via `hasReachedItemLimit`/`hasReachedCollectionLimit` before reaching Zod validation.
- `src/app/settings/page.tsx` — fetch `getBillingInfo(session.user.id)` alongside the existing `Promise.all` (`getProfileUser`, `getEditorPreferences`), render `BillingCard` between the Account and Editor Preferences cards.
- `.env` / `.env.production` — add `STRIPE_WEBHOOK_SECRET`, flip `BILLING_LIMITS_ENABLED` to `true` only when actually ready to enforce limits (stays `false` by default per the project's dev-mode convention — do not flip this in production as a side effect of merging this phase).

## Stripe Dashboard Setup Steps

1. Verify `STRIPE_PRICE_ID_MONTHLY`/`STRIPE_PRICE_ID_YEARLY` (already in `.env` from prior setup) are recurring prices of $8/month and $72/year, matching `project-overview.md`'s Monetization table.
2. **Local dev webhook**: run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, copy the printed `whsec_...` into `.env`'s `STRIPE_WEBHOOK_SECRET`.
3. **Production webhook**: Dashboard → Developers → Webhooks → Add endpoint → `https://<prod-domain>/api/webhooks/stripe`, subscribe to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`; copy the signing secret into `.env.production`.
4. Enable the **Customer Portal** (Dashboard → Settings → Billing → Customer portal) so `createBillingPortalSession` works — configure allowed actions (cancel, switch between the two existing Prices, update payment method).
5. Confirm test-mode keys stay test-mode (`sk_test_...`/`pk_test_...`) for all local/dev work.

## Testing

Requires `stripe listen` running locally throughout — this phase cannot be fully verified with unit tests alone.

- [ ] `npm run test` / `npm run build` still pass.
- [ ] Settings → Billing card shows "Free" state with an "Upgrade to Pro" control for a non-subscribed test account.
- [ ] Checkout (monthly) redirects to a real Stripe Checkout session; complete with test card `4242 4242 4242 4242`.
- [ ] Confirm `stripe listen` forwarded `checkout.session.completed` and the DB row's `isPro`/`stripeCustomerId`/`stripeSubscriptionId`/`stripePriceId`/`subscriptionStatus` updated (verify via Neon MCP against the `development` branch).
- [ ] Reload → Billing card now shows "Pro" state with "Manage Subscription".
- [ ] "Manage Subscription" lands on the real Stripe Customer Portal; cancel there.
- [ ] Confirm the cancellation webhook fires and `isPro` resolves correctly (flips immediately vs. holds until `stripeCurrentPeriodEnd` — decide the grace-period behavior and test whichever is chosen).
- [ ] Repeat with the yearly price, confirm `stripePriceId` reflects it.
- [ ] With `BILLING_LIMITS_ENABLED=true` locally: free user blocked from a 51st item / 4th collection with a clear error toast; Pro user unblocked.
- [ ] Webhook signature rejection: POST to `/api/webhooks/stripe` with a bad/missing `stripe-signature` header → 400, no DB write.
- [ ] Clean up: cancel/delete the test subscription and disposable account in both Stripe test mode and the Neon `development` branch.

## Notes

- Per `project-overview.md`'s dev-mode note, all Pro features stay unlocked for everyone until billing explicitly goes live — flipping `BILLING_LIMITS_ENABLED=true` in production is a separate, deliberate decision, not a default outcome of merging this phase.
- This phase does not retroactively lock down file/image uploads, which are already deliberately unlocked for all users per prior feature history — that remains a separate follow-up decision if/when it's wanted.
