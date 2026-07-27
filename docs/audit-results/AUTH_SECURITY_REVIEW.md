# Auth Security Review

**Last audited:** 2026-07-19
**Scope:** Credentials + GitHub auth (NextAuth v5), email verification, password reset, profile page

## Summary

The hand-rolled portions of this auth stack (password hashing, token generation/expiry/single-use, session-derived authorization on the profile page) are implemented correctly and consistently. The main gap is the complete absence of rate limiting on unauthenticated, email-sending, or brute-forceable endpoints, compounded by a timing side-channel that partially undermines the otherwise-correct anti-enumeration design of the password-reset flow. Findings: **0 Critical, 2 High, 1 Medium, 1 Low**.

## Findings

### 🟠 High

- **File:** `src/app/api/auth/register/route.ts:23-74`
  **Issue:** `POST /api/auth/register` has no rate limiting, IP throttling, or CAPTCHA of any kind (confirmed no rate-limiting library in `package.json` and no throttling code anywhere in `src/`). The endpoint is fully unauthenticated, writes a `User` row, and — when `EMAIL_VERIFICATION_ENABLED` is not `"false"` — sends a real email via Resend (`issueVerificationEmail` → `sendVerificationEmail`, `src/lib/verification-token.ts:9-26`) to *any* address the caller supplies, whether or not they own it.
  **Impact:** An attacker can script unlimited registrations, each targeting an arbitrary victim email with an unsolicited "verify your email" message (spam/harassment, reputation damage to the Resend sending domain, and potential Resend quota exhaustion/suspension). It also lets an attacker permanently claim a victim's email address in the `User` table (subsequent legitimate registration attempts with that email get blocked by the `existingUser` 409 check at line 37), pre-empting the real owner from ever signing up with credentials.
  **Fix:** Add IP-based throttling to the register route (e.g. a sliding-window counter in Redis/Upstash, or at minimum an in-memory token bucket keyed by IP for single-instance deployments) capping registrations per IP per hour, and consider a per-email cooldown before `issueVerificationEmail` fires again for the same address regardless of whether a new `User` row was created.

- **File:** `src/auth.ts:44-62`
  **Issue:** The Credentials `authorize()` callback has two compounding problems. (1) No rate limiting or lockout on failed login attempts — an attacker can brute-force a password with unlimited attempts. (2) A timing side-channel: when `user?.password` is falsy (email not registered, or a GitHub-only account with no password), the function returns `null` immediately after one cheap `findUnique` (line 51-54); when the email exists and has a password, it additionally awaits `bcrypt.compare` (line 56), which at cost factor 12 takes on the order of ~100-150ms. This measurable latency gap lets an attacker distinguish "email doesn't exist / is OAuth-only" from "email exists with a password" purely from response time, without any explicit error-message difference.
  **Impact:** Combined, these let an attacker cheaply enumerate which emails have credentials-based accounts (via timing) and then brute-force those accounts' passwords with no throttling, backoff, or lockout.
  **Fix:** Add a per-IP and/or per-email attempt counter/lockout in `authorize()` (e.g. track failed attempts in a `LoginAttempt` table or Redis with exponential backoff after ~5 failures). To close the timing gap, always perform a bcrypt operation on the same code path regardless of whether the user/password exists — e.g. `const hash = user?.password ?? DUMMY_BCRYPT_HASH; const isValid = await bcrypt.compare(password, hash); if (!user?.password || !isValid) return null;` using a precomputed dummy hash constant so the compare always runs.

### 🟡 Medium

- **File:** `src/actions/auth.ts:84-106`, `src/lib/verification-token.ts:28-45`
  **Issue:** `requestPasswordReset` correctly returns an identical `{ success: true }` response body regardless of whether the email is registered (line 104-105 comment confirms this is intentional). However, the code path taken differs in latency: when `user?.password` is truthy, the action awaits `issuePasswordResetToken`, which does two Prisma writes (`deleteMany` + `create`) *and* an awaited network call to the Resend API (`sendPasswordResetEmail`) before returning; when the email doesn't exist or is GitHub-only, the action returns almost immediately. This reintroduces a timing-based user-enumeration channel that the identical-response-body design was meant to prevent. There is also no rate limiting on this action, so an attacker can probe many candidate emails quickly to measure the timing difference, and can repeatedly trigger real reset emails to any registered address (harassment/quota abuse).
  **Impact:** An attacker measuring response latency can determine which email addresses have a credentials-based DevStash account, undermining the enumeration protection, and can spam a target's inbox with password-reset emails with no throttling.
  **Fix:** Two changes: (1) Make the two branches take comparable time — e.g. always run a fixed-cost dummy async operation (or `await Promise.all([realWorkOrNoop(), delay(FIXED_MS)])` with a floor like 300ms) so both branches resolve after roughly the same elapsed time regardless of which path executed. (2) Add rate limiting on this action keyed by submitted email and/or IP (e.g. max 3 requests per email per hour) to bound both the enumeration-probing rate and the email-spam potential.

### 🔵 Low / Hardening suggestions

- **File:** `src/actions/auth.ts:58-78`
  **Issue:** `resendVerificationEmail` requires an active session (`auth()` check at line 63) and only ever emails the logged-in user's own address, which limits it to a self-targeted abuse vector rather than an open enumeration/spam primitive — so this is not a real vulnerability. However, there is no cooldown between calls, so a signed-in user (or a script driving their session) can trigger unlimited Resend sends to themselves with no throttling, which is still unnecessary cost/quota exposure.
  **Fix:** Add a simple per-user cooldown (e.g. store `lastVerificationEmailSentAt` and reject a resend within, say, 60 seconds) as defense-in-depth against accidental or scripted spamming of the Resend quota.

## Passed Checks

- **Adaptive hashing at a strong cost factor:** all password hashing uses `bcrypt.hash(password, 12)` consistently — `src/app/api/auth/register/route.ts:9,45`, `src/actions/profile.ts:9,50`, `src/actions/auth.ts:14,151` — well above the 10-round minimum.
- **Correct comparison function:** all password checks use `bcrypt.compare`, never `===` on hashes — `src/auth.ts:56`, `src/actions/profile.ts:45`.
- **No password hash leakage:** the Credentials `authorize()` callback returns only `{ id, name, email, image }` (`src/auth.ts:61`), never the password hash, into the JWT/session. No `console.log`/error log anywhere prints a full `User` object containing `password`.
- **Change-password requires current-password verification:** `src/actions/profile.ts:45-48` calls `bcrypt.compare` against the stored hash before allowing a new password to be written.
- **Strong token entropy:** both verification and reset tokens are generated via `randomBytes(32)` (256 bits), far exceeding the 128-bit minimum — `src/lib/verification-token.ts:12,31`.
- **Expiration enforced at verification time:** `src/app/api/auth/verify-email/route.ts:31-36` checks `verificationToken.expires < new Date()` and rejects/deletes expired tokens; `src/actions/auth.ts:144-149` does the same for password reset. Windows (24h verification, 1h reset) are within the recommended ranges.
- **Single-use tokens:** both flows delete the `VerificationToken` row in the same `prisma.$transaction` as the corresponding `User` update, preventing replay — `src/app/api/auth/verify-email/route.ts:38-41` and `src/actions/auth.ts:153-156`.
- **Stale tokens invalidated on reissue:** `issueVerificationEmail` and `issuePasswordResetToken` both call `deleteMany({ where: { identifier: email } })` before creating a new token, so requesting a new link invalidates any previously issued one for that address — `src/lib/verification-token.ts:10,29`.
- **Token/identifier binding:** both the verify-email route and `resetPassword` look up tokens via the composite unique key `identifier_token` (backed by `@@unique([identifier, token])` in `prisma/schema.prisma:48`), not a bare token search — no cross-account replay possible.
- **No plaintext-response/log exposure of tokens:** tokens only ever appear in the emailed link URL; no route echoes the token value back in a JSON error or logs it.
- **Session-derived authorization on all profile mutations:** `changePassword` and `deleteAccount` both independently call `auth()` and check `session?.user?.id` before touching the database — `src/actions/profile.ts:25-28,57-60` — never trusting a client-supplied user id. The profile page itself does the same at `src/app/profile/page.tsx:22-25` (defense in depth, not solely relying on `proxy.ts` route protection).
- **No enumeration-safe redirect leakage:** sign-out and account-deletion redirects go to a fixed `/sign-in?auth=...` URL (`src/actions/profile.ts:63`, `src/actions/auth.ts:55`) with no information about other accounts.
- **No unsafe HTML rendering:** profile fields (`name`, `email`) are rendered as plain JSX text in `src/app/profile/page.tsx:56-58` — no `dangerouslySetInnerHTML` found anywhere in the profile or auth components.
- **OAuth accounts auto-verified correctly:** the GitHub provider's custom `profile()` callback sets `emailVerified` for GitHub sign-ups (`src/auth.ts:29-37`), and the register route auto-sets `emailVerified` when the feature flag disables verification (`src/app/api/auth/register/route.ts:52`), avoiding a permanently-stuck-unverified state.
