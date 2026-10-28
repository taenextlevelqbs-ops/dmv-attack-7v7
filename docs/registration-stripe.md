# Athlete registration and Stripe payments

This extends the existing registration form, `tryout_payments`, private team-fee ledger, authenticated family portal, and `/api/stripe/webhook`. Existing Venmo notes, payments, fee accounts and ledger entries are retained. It does not create products, payment links, charges, refunds or database migrations automatically at application startup.

## Deployment gate

`STRIPE_REGISTRATION_ENABLED` defaults to off. Keep it off until a separate Stripe sandbox **and separate Supabase test project** have passed the checklist below. Production requires live credentials; never point sandbox events or test registrations at production Supabase. Existing Venmo registration remains available while the gate is off. The new webhook audit requires the new migration even while registration Checkout is off. **Apply the migration before deploying this webhook change.**

### Database

The connected Supabase REST schema was inspected: `tryout_payments` has a registration primary key and a fixed 2,000-cent amount; the `team_fee_accounts`, `team_fee_transactions`, `team_fee_checkouts` tables and service RPCs also exist. No database password, management token, SQL execution RPC, or SQL connector is available in this session. The Supabase service key supports REST data access, not arbitrary DDL. The migration has therefore been tested with PostgreSQL-compatible PGlite, not applied to the connected production project.

1. In a disposable Supabase test project with the existing DMV schema, apply the existing migrations in order, then `supabase/migrations/20261028_registration_stripe.sql` in **Supabase Dashboard → SQL Editor → New query → Run**. It runs in a transaction and adds private orders, attempts and webhook audit records plus service-only reservation/synchronization functions. Existing payment rows remain in place.
2. Verify the sandbox workflow. Before production deployment, take the normal Supabase backup and run the same new migration in the production project SQL Editor. Do not truncate tables or copy customer rows into the test project. The migration can be rerun.
3. Alternatively, once this release is deployed, authenticated owners can download the exact SQL from `/api/admin/payments/registrations/setup`. With an established CLI connection, `supabase db push --dry-run` then `supabase db push` is appropriate **only if its migration history already matches**; do not blindly push old migrations into an existing unmanaged database.

All new tables use RLS with no anonymous or authenticated grants. Browser callers cannot read or write payment tables directly. Family access is enforced on server routes using verified Supabase identity and the exact parent email or existing family membership. Team checkout additionally checks accepted athlete + accepted roster assignment + existing account. The $750 price is never included in public tryout registration content.

### Environment settings

Use secure hosting/environment settings, not committed `.env` values or chat. Preserve existing production variables. The cloud-environment requirements are separate from Vercel deployment settings.

| Variable | Configuration |
| --- | --- |
| `STRIPE_SECRET_KEY` | Stripe sandbox secret/restricted key for sandbox; live key only after validation. Server-only. API destination `api.stripe.com`. Needs Prices read, Checkout Sessions read/write, Payment Intents read, Charges read and Refunds read. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the specific webhook endpoint. Must be injected as a real, **direct server environment variable**, not a network-proxy placeholder: signature verification is local. |
| `STRIPE_TRYOUT_PRICE_ID` | Sandbox one-time USD $20 Price ID in sandbox. User-supplied live candidate is `price_1UVdz32ZnGkv2i6rzYD7HWKv` for **DMV ATTACK 2026–2027**; it has **not** been verified against Stripe because credentials are absent. Verify account, product name, active flag, exact USD 2,000 cents, one-time billing and live mode before production. |
| `STRIPE_TEAM_PRICE_ID` | Create/select an active one-time USD $750 price in the correct account and mode. No ID is invented. The app never publishes a public payment link. |
| `STRIPE_REGISTRATION_ENABLED` | `false` until sandbox, migration, notifications and webhook checks pass; then `true` in the intended deployment. |
| `PAYMENTS_BASE_URL` | Exact canonical HTTPS deployment origin: production `https://dmvattack.com` (use `https://www.dmvattack.com` if that is the hosting canonical origin). Use the sandbox deployment origin for sandbox and a matching webhook URL. This server value, not request headers, controls redirects. |
| Existing Supabase variables | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` must reference the appropriate database/auth project. Never expose the service key through a public variable. |

`validatePrice` checks active, currency, exact amount, one-time billing and live/test mode before creating a session. Receipt email comes from the saved registration, not a client-supplied arbitrary payment request. Enable successful-payment receipts in Stripe's customer-email settings; custom receipt delivery and SMTP delivery must be checked in the sandbox account.

### Stripe webhook

In Stripe Workbench/Developers → Webhooks, configure the canonical deployed endpoint **`https://dmvattack.com/api/stripe/webhook`** for your account (if hosting redirects apex to www, register `https://www.dmvattack.com/api/stripe/webhook` directly; Stripe does not follow webhook redirects). Use the version matching the installed Stripe SDK, currently `2026-09-30.endive`.

Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `payment_intent.payment_failed`
- `charge.refunded`
- `refund.created`, `refund.updated`, `refund.failed`
- `charge.dispute.created`, `charge.dispute.closed`

The raw body and signature are verified before logging or processing. Every event is audited by ID; failures remain FAILED and return non-2xx so Stripe retries. The handler fetches current Checkout/Payment Intent/refund state, validates the saved registration, purpose, amount, USD, mode and settlement, and applies an atomic SQL update. Paid credit and cumulative successful refunds cannot be duplicated or reduced by replayed/out-of-order events. Unrelated legacy team checkout sessions retain their original synchronization path. No query string marks a registration paid. Provider failures must not be acknowledged as success.

### Registration and retry

The existing headshot, consents and athlete fields are preserved. With the gate enabled, successful registration creates a fixed $20 order and a pending attempt, then returns a Stripe-hosted checkout URL. A 30-day HTTP-only SameSite retry cookie contains a random capability; only its SHA-256 hash is stored. Multiple athletes get separate cookies and separate payment orders. A page at `/tryouts/payment?registration=<uuid>` polls webhook-confirmed status and can retry the same checkout without creating another athlete. A cookie is never accepted for team payments.

A duplicate identity submission can reuse an existing registration **only after authorization** through its cookie or a verified parent identity; an unauthorized duplicate receives a generic conflict. Authenticated parents can recover registrations through `/portal/payments`. The unique athlete identity index remains required. Completed/refunded orders cannot be charged again automatically. A declined card can retry the same still-open Stripe session. Canceled Checkout preserves the session/registration until it expires; expired or confirmed delayed-failed sessions can reserve a fresh attempt. New attempts use stable Stripe idempotency keys. Indeterminate creations older than 23 hours fail closed and require staff reconciliation with Stripe rather than risk creating another charge after idempotency retention expires.

### Team acceptance and family access

Existing authorized staff acceptance still creates/links the athlete and family and marks the roster accepted. With the gate enabled, it also creates a $750 team fee account **only if one does not already exist**. Existing discounts, installments, fees and credits are never overwritten. New parents receive a Supabase invitation to set a password; existing parents receive a sign-in link for `/portal/payments` on first acceptance. Invitation delivery failures are exposed via `payment_notification_sent: false` in the acceptance response; staff can retry delivery. Supabase invitations expire according to the project's Auth settings.

Configure **Supabase Auth → URL Configuration** to allow the actual canonical `/set-password` and `/auth/callback` destinations. For reliable SSR authentication, configure the invite email button URL as `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/set-password` and the magic-link email button URL as `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/portal/payments`. The implemented `/auth/confirm` route verifies the token with Supabase, stores the session in server-managed cookies, and restricts redirects to those two paths. Tokens expire according to Supabase Auth settings. Set Site URL to the canonical origin. Customize the invite text to tell families their athlete has been accepted and team payment is available in Family Payments. Configure SMTP, templates and rate limits for actual notification delivery. The registration consent covers tryout communications; emails here are transactional, not marketing.

The Family Portal links to `/portal/payments`. Verified parents can see only their registrations. That page offers an email link for existing parent accounts or the existing password sign-in. A submitted email always receives a generic response to avoid account enumeration. Team Checkout requires a verified parent identity, accepted submission/roster, exactly one eligible fee account, and an untouched $750 balance. Existing adjusted/partially-paid accounts continue through staff's private ledger workflow; the app refuses to charge another full $750. The existing owner link-creation endpoint also rejects unaccepted rosters. Once paid, the registration order is PAID and the **existing** team ledger receives one credit; cumulative refunds append only the difference.

If acceptance is later withdrawn or a fee is reduced after checkout creation, staff must expire existing Stripe links before changing payment terms. Already-issued Stripe bearer links cannot perform a new application authorization check when opened directly. Disputes and post-settlement bank reversals still require owner reconciliation as described in `stripe-setup.md`; they are not automatically treated as successful refunds.

### Admin and historical records

Owner → Payments links to `/admin/payments/registrations`, combining athlete/division/contact/submission date, acceptance, tryout and team statuses, Stripe session/intent/customer references, paid timestamps and refunds. Search and status/purpose filters are available. Net totals use the single existing team ledger, not the attempt count; retries and duplicate events never count as additional revenue. Historical manual payment notes remain visible, and the existing fee ledger remains available. Manual tryout updates reject Stripe-owned rows so staff cannot bypass webhook verification.

## Validation and rollout

Local automated tests use synthetic fixtures and PGlite. They are **not** Stripe sandbox transactions. They do not verify the live candidate Price ID, real card acceptance, real email receipt delivery, actual hosting variables, or actual webhook delivery. Never use a real card or charge during tests.

Run `npm ci`, `npm test`, `npm run lint`, `npm run build`, and `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser` (omit CHROMIUM_PATH when using Playwright's installed Chromium). New tests exercise fixed-price verification, payment settlement, pending/failed/expired states, duplicate processing, out-of-order updates, refunds, sibling orders, RLS, accepted/unaccepted reservations, historical payments and net totals.

Before setting the gate true in production, verify all of these in the isolated sandbox:

1. Mobile registration preserves all fields and headshot; $20 Checkout belongs to the saved registration and configured sandbox price.
2. Stripe test-card success delivers a signed webhook; payment becomes PAID and a receipt arrives. A success-page visit alone never changes the database.
3. Declined card, cancellation, expired session and delayed failure preserve registration. Retry the same athlete without another registration or simultaneous charge.
4. Register two athletes under one parent; each receives its own order and payment.
5. Replay the same event and deliver older events; paid credit is not duplicated or downgraded.
6. Test bad signatures, stale signatures, mismatched amount/currency/mode/metadata; all are rejected. Simulate a database outage; Stripe receives non-2xx and FAILED audit can be retried.
7. Sign in as a different parent: status and checkout for another registration return 403; public database tables and service RPCs are inaccessible to browser roles.
8. Unaccepted athlete cannot pay $750, including through the private owner endpoint. Staff acceptance creates the account and sends the invitation; the correct parent can then pay the configured $750 sandbox price.
9. Verify the full and partial refund webhook paths, refund replay, historical Venmo notes and exact net totals in both admin views.
10. Verify canonical URLs, Supabase invitations/sign-in, SMTP, Stripe receipt settings and webhook delivery. Apply production migration, add verified production variables without replacing existing bindings, deploy, then enable registration Checkout. Monitor FAILED events and Stripe delivery logs.

Real Stripe sandbox validation, the production migration, secret provisioning, Price verification and deployment remain blocked in this session. No real charge or remote schema mutation was performed.

After securely supplying the configured keys and both price IDs to the appropriate machine, run **`npm run payments:verify`**. This performs only read-only Stripe Price/Product requests, verifies the specified tryout product name, exact amounts, currency, billing type, active flags and mode. It never creates a product, Checkout Session or charge. Webhook delivery and card workflows still need the sandbox checklist. The command currently exits nonzero listing missing configuration variable names; it does not print secret values.

## Implementation file inventory

- `app/admin/payments/page.tsx`
- `app/admin/payments/registrations/page.tsx`
- `app/admin/teams/page.tsx`
- `app/admin/tryouts/payments/page.tsx`
- `app/api/admin/finance/checkout/route.ts`
- `app/api/admin/payments/registrations/route.ts`
- `app/api/admin/payments/registrations/setup/route.ts`
- `app/api/admin/rosters/accept/route.ts`
- `app/api/admin/tryouts/payments/route.ts`
- `app/api/payments/access/route.ts`
- `app/api/payments/checkout/route.ts`
- `app/api/payments/family/route.ts`
- `app/api/payments/status/route.ts`
- `app/api/stripe/webhook/route.ts`
- `app/api/tryouts/register/route.ts`
- `app/auth/callback/route.ts`
- `app/auth/confirm/route.ts`
- `app/portal/page.tsx`
- `app/portal/payments/page.tsx`
- `app/tryouts/page.tsx`
- `app/tryouts/payment/page.tsx`
- `components/family-payments.tsx`
- `components/payment-checkout.tsx`
- `components/tryout-form.tsx`
- `docs/registration-stripe.md`
- `lib/payments/authorization.mjs`
- `lib/payments/core.mjs`
- `lib/payments/report.mjs`
- `lib/payments/server.ts`
- `package.json`
- `scripts/browser-smoke.mjs`
- `scripts/verify-registration-stripe.mjs`
- `supabase/migrations/20261028_registration_stripe.sql`
- `tests/registration-payments.test.mjs`

## Direct production setup (no additional test runs)

At the owner's later explicit request, `scripts/go-live-stripe.sh` provides a production setup/deploy path without running the test suite. It pauses for the required Supabase SQL and Stripe live webhook setup, preserves existing production secrets, prompts through Vercel for missing keys, enables the registration flag, pushes the integrated code to main, then invokes a production Vercel deployment. It requires the correct existing Vercel project and production Supabase variables. Database and webhook setup remain real prerequisites; the shell cannot invent those credentials. The new side-by-side payment selection and deployment script have not received additional tests/builds in this session, per that request. Real Stripe end-to-end validation remains unverified.

Venmo remains visible on the tryout page. Registration now saves an order and opens the payment-choice page **before** creating a Stripe session. Parents can choose card or Venmo; paid Venmo is confirmed manually by staff. Existing in-progress Stripe checkouts must be closed before switching payment methods. The script does not create or configure the $750 team Price ID; team Checkout remains unavailable until that ID is supplied.
