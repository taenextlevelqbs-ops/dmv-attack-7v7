# Private team-fee tracking and tryout operations

The agreed team price is **not included in the public source, public pages, or parent portal**. Owner-only database settings supply the default for new accounts. There is no built-in public/default amount. The public tryout fee remains separate.

## Enable in the existing DMV Attack Supabase project

1. Back up the DMV Attack database and review `supabase/migrations/20261021_team_fee_ledger.sql`.
2. Run that additive SQL in **DMV Attack's** Supabase SQL editor. It creates fee accounts, payment/refund transactions, private default settings and adjustment history. It does not alter existing tryout payments or registrations.
3. Existing production bindings remain `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and server-only `SUPABASE_SECRET_KEY`, all for that same project. No keys belong in chat, source control or browser code.
4. Sign in as OWNER. Open **Admin → Payments** or **Finance**. Expand **Private default team fee**, enter the agreed fee and save. The value is stored only in the private table.
5. Create a fee account for each athlete, team and season. Apply any discount/scholarship with a reason. Optional due dates enable the overdue indicator.
6. Open **Payments & history** for the athlete, verify the actual receipt in Venmo/cash/check/bank records, and record the exact deposit/installment. Use a unique transaction or receipt reference. Repeating the same reference is rejected; network retries use an idempotency key.

**Amount still owed = agreed fee − discount/scholarship − verified payments + refunds.** Credits are displayed separately when net payments exceed the adjusted fee. A scholarship reduces the obligation; it is not cash collected. Filters apply to the displayed totals. Registrations without fee accounts are identified, rather than being presented as paid or as owing a guessed amount.

To correct an agreed fee or scholarship, expand **Adjust fee, scholarship or due date** in the athlete's history. A reason is required; before/after values are retained. Payments are never deleted or edited. A refund records money actually returned and cannot exceed recorded net payments.

The tracker is a manual accounting ledger. It does not collect money, automatically reconcile Venmo, send invoices, or send payment reminders. No historical payment is automatically inferred or imported.

## Security and reliability

- All admin pages require a verified staff session server-side. Fee pages, APIs, SQL download and default settings require OWNER. ADMIN and PARENT accounts cannot read this ledger, including direct Supabase access.
- Financial tables have RLS, no anonymous/authenticated policies, and explicit service-role permissions. Transactions/adjustments are append-only. Database functions serialize transactions per account and enforce idempotency/refund constraints.
- Mutating staff endpoints require same-origin requests. Role routing no longer sends unsupported COACH accounts into an admin loop. Roster acceptance preserves existing owner/admin profile roles.
- Financial reads paginate; exceeding the explicit supported bound fails instead of showing a truncated balance.
- Tryout registration displays pending/error state and preserves entered fields after a failure. Birth dates and uploaded image bytes are validated server-side. Failed/duplicate registrations clean up uploaded files. Existing duplicate-registration migration remains a prerequisite for reliable database uniqueness.
- No live database migration or payment entry is performed by tests. Tests use isolated local Supabase HTTP and PostgreSQL-compatible fixtures.

## Validation

Use Node 24. Run `npm ci`, `npm test`, `npm run lint`, `npm run build`, then `npm run test:browser`. Browser checks require Chromium (`CHROMIUM_PATH` or `/usr/bin/chromium`). The browser suite builds an isolated-provider version with fixture-only bindings, starts local services, checks real routes and persistence, and stops them. It never contacts live Supabase or Venmo and does not submit real registrations.

Existing unrelated program pages still include informational/placeholder administrative modules; they are not represented as a completed communications, scheduling, invoicing or CRM system. The finance dashboard and the tryout/roster workflows are the scope of this repair.
