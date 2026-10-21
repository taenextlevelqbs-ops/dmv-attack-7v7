# Stripe team-fee payments

The website creates athlete-specific Stripe-hosted Checkout links from Owner → Payments → Payments & history. The amount comes from that athlete's private fee account; no default price is published. Card and US bank account payments are eligible. Apple Pay and Google Pay depend on Stripe, browser/device eligibility and account settings. Enable ACH Direct Debit in Stripe's payment-method settings; the checkout filter does not enable disabled methods.

## Activation

1. In the DMV Attack Supabase project (the existing fee-ledger database), run `supabase/migrations/20261021_stripe_checkout.sql` after the original fee-ledger migration. It adds one private table and two service-only functions. Existing registrations, fees, and transactions are preserved. An authenticated owner can download it from `/api/admin/finance/checkout/setup` after deployment.
2. In Stripe **Workbench → Webhooks** (or Developers → Webhooks), add an endpoint for `https://www.dmvattack.com/api/stripe/webhook`, receiving events from **your account**, using API version **2026-09-30.endive**. Select: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`, `refund.created`, `refund.updated`, `refund.failed`, `charge.dispute.created`, `charge.dispute.closed`.
3. In **Vercel → DMV Attack → Settings → Environment Variables**, add **server-only** `STRIPE_SECRET_KEY` (restricted live key beginning `rk_live_`, or standard live key beginning `sk_live_`) and `STRIPE_WEBHOOK_SECRET` (this endpoint's signing secret beginning `whsec_`) to **Production**. The existing `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY` must point to DMV Attack. Never paste keys in chat, source code, SQL, or a `NEXT_PUBLIC_` variable. Hosted Checkout does not require a publishable key in the application.
4. Redeploy to load the variables. In Owner → Payments, create a fee account, select Payments & history, then create a private full-balance or installment link. Share the link privately with the correct family. This release never sends links automatically.

## Test before sharing live links

Use a separate Preview deployment **and separate test database**, with sandbox Stripe keys and a sandbox webhook endpoint. Test data must not share the production ledger. Production refuses a test API key. Verify card success/failure, delayed ACH success/failure, duplicate webhook delivery, partial/full refunds, and owner-only access. Local automated tests use fixtures and PGlite, not a Stripe sandbox; actual account capabilities and end-to-end Stripe delivery still require account testing.

## Accounting behavior and limits

- A return-page visit never marks a fee paid. Only a signed webhook, current Stripe session state, exact USD amount and local account/session match can credit payment. Pending ACH remains pending. Failed ledger writes return non-2xx for Stripe retries.
- Payment and cumulative successful refunds append atomically to the existing ledger. Duplicate events and older refund totals cannot duplicate credit. Families receive the gross payment credit; processing fees and payout/net amounts remain in Stripe and are not yet imported into this ledger.
- Refund Stripe payments **in Stripe**, not through the manual ledger form. Successful refunds sync automatically. Do not also record Stripe payments or refunds manually.
- New links reserve outstanding balances atomically to avoid repeatedly creating full-balance links. Checkout links expire after about 24 hours; pending ACH reserves remain until confirmation/failure. Old links keep their original charge amount if the owner later edits the fee or records money manually: expire conflicting links in Stripe and wait for expiration confirmation before creating replacements. Concurrent manual payments or fee reductions may cause an overpayment; the ledger preserves the credit instead of deleting history.
- Disputed charges display **REVIEW_REQUIRED** in payment-link history. Ledger totals still include the original payment; dispute reversals, bank returns after a previously successful payment, payout deductions and dispute fees need owner reconciliation using Stripe's records. Do not treat the ledger as a bank balance. Dispute outcome accounting is not automated.
- Links are bearer links. Anyone holding one can see the checkout amount and pay it. They contain no athlete name, contact information or public balance lookup.
- Checkout is for existing athlete team-fee accounts. Training purchases, scheduling, recurring subscriptions, and automatic installment charges are not part of this release. Each installment is a separate explicitly authorized payment.
