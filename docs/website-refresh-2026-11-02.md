# DMV Attack public-site and tryout release — November 2, 2026

## Implemented

- One source of truth (`lib/tryouts.mjs`) for the confirmed November tryouts, location, $20 fee and existing Stripe/Venmo destinations. Youth: Sunday, November 8, 2026, 10U/12U/14U. High school: Sunday, November 22, 2026, 15U/18U. Both run **3:00–4:30 PM EST**, at **Independence High School, 23115 Learning Circle, Ashburn, VA 20148**.
- Rebuilt the tryout page with a consistent hero, event cards, directions, equal-sized payment options, grouped registration fields and clear next steps. Selecting a division shows its exact date/time. Removed outdated pending-time/makeup messaging and literal escaped newline text.
- Reused the exact shared Stripe link `https://buy.stripe.com/5kQfZa9Op1yj2Cq0yt3F600` and the existing Venmo destination. External payment links open with `noopener noreferrer`. Both charge labels are $20; no $750 team link is exposed. Checkout stays on the provider; no card details are collected by this website. Shared-link payments are **not automatically reconciled**: staff matches and verifies them separately. No real charge was initiated.
- Kept the existing Supabase registration schema, validations, image checks, identity uniqueness, admin authorization, finance ledger and Stripe webhook integration. No migration or RLS change is included. Authentication callback return paths are now restricted to the same site to prevent external redirects. This release is based on the current main branch, **not** the separate athlete-specific Stripe checkout/migration branch.
- New registrations return bounded confirmation display data to the form, which stores it in tab-scoped session storage and opens `/tryouts/success` without athlete names in the URL. Older links remain supported and their query is removed from the visible address after loading. Storage-disabled/native forms fall back to a Tryout ID and division only. The success page never marks a registration PAID from a URL or shared-link click, and it does not expose a public athlete lookup.
- Registration maintains entered fields after validation/server errors, shows loading/file feedback, validates headshot size/type/bytes, and guards against repeated submissions. Existing server-side duplicate prevention remains in place.
- Added consistent dark-site controls, focus treatment, skip navigation, active navigation states, compact public footer, improved contrast, metadata, event JSON-LD, sitemap and robots rules that exclude private routes. Fixed Training's nested anchors and public/private image presentation. Private signed headshots use direct unoptimized rendering so the public Next image optimizer does not cache them.
- Added the confirmed tryout cards to Home, Schedule, the admin calendar and the signed Command Center export. Kept the tournament list, dates, map component, map selection and map destinations unchanged.
- Fixed the roster API's request for a nonexistent `tryout_submissions.headshot_url` column. The connected database confirms `headshot_path` exists and `headshot_url` does not. The API now signs the existing path for authorized staff; no database column is added.

## Validation

- Unit/database suites: 13 tests passed, including existing finance/registration/Stripe suites and new schedule, division, time-zone and SEO consistency checks.
- Production build and TypeScript validation passed. ESLint passes without warnings.
- Browser coverage: all 12 public routes at 320, 390, 768 and 1440px (48 route/viewport combinations). Confirmed loaded images, no layout overflow, one main heading, no nested anchors, page titles, internal destinations, mobile navigation, correct date/time cards, division/date updates, equal payment button sizes/alignment and exact secure external destinations.
- Registration integration uses a local synthetic Supabase provider and PostgreSQL-compatible PGlite: successful save, headshot upload, private confirmation navigation, refresh persistence, and duplicate-error field preservation. Existing owner/admin/parent isolation, finance settings/history/refunds, manual payment tracking and CSRF checks remain covered. Protected roster, tryout and check-in headshots are exercised at mobile width with signed fixture image URLs.
- The map-provider frame is deliberately fulfilled locally in isolated browser tests because the environment blocks external map traffic. Tournament selection and iframe destinations are tested; actual Google Maps provider delivery is not claimed verified.
- No first-party browser console or hydration errors were observed in the public-route audit. Test logs, screenshots and the machine-readable public audit are stored outside the checkout at `/workspace/dmv-release-2026-11-02/`.

## Exact external limitations

- Current environment egress policy returns **CONNECT 403** for `www.dmvattack.com`, `buy.stripe.com`, `venmo.com` and `api.github.com`. Direct live-site/payment-provider inspection and GitHub deployment-check inspection are therefore blocked before reaching those services.
- There is no Vercel runtime credential or connector available to query the deployment and confirm READY. A GitHub push can use the existing integration, but is not itself proof of a completed Vercel deployment.
- Required network additions have been saved in the cloud environment draft while preserving existing rules. Saving a draft does not apply it to the current runtime.
- The supplied Stripe URL is preserved and navigation is verified locally. The live Stripe product/account/current amount and enabled payment methods could not be independently inspected through the blocked provider. No payment was made. The $20 claim is based on the user's confirmed existing link and requirements.
- Supabase schema metadata is accessible. The `announcements` table is the only event/CMS-related table exposed in that schema, but its data query returns **42501 permission denied** for the configured key. No permissions or records were changed to bypass that restriction. Its stored announcement text remains unaudited.
- No new registration confirmation-email system was found; existing Supabase authentication emails and financial integrations are preserved. No event emails were sent.

## Production follow-up

After the validated change is pushed through the existing main-branch GitHub/Vercel workflow, confirm the exact commit's Vercel deployment is READY, then inspect the actual custom-domain Home, Tryouts, Schedule and registration confirmation pages. Confirm the two existing provider destinations show the intended DMV Attack $20 product and Venmo account without entering payment details. This live verification requires access that is currently blocked; it must not be described as completed from the local fixture tests.

## Files changed

- `app/7v7/page.tsx`
- `app/about/page.tsx`
- `app/admin/schedule/page.tsx`
- `app/admin/teams/page.tsx`
- `app/admin/tryouts/check-in/page.tsx`
- `app/admin/tryouts/page.tsx`
- `app/api/admin/rosters/route.ts`
- `app/api/tryouts/register/route.ts`
- `app/apparel/page.tsx`
- `app/auth/callback/route.ts`
- `app/big-man/page.tsx`
- `app/camps/page.tsx`
- `app/coaching/page.tsx`
- `app/contact/page.tsx`
- `app/foundation/page.tsx`
- `app/girls-flag/page.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `app/robots.ts`
- `app/sitemap.ts`
- `app/template.tsx`
- `app/training/page.tsx`
- `app/tryouts/page.tsx`
- `app/tryouts/success/page.tsx`
- `components/big-man-signup.tsx`
- `components/dmv-page-header.tsx`
- `components/dmv-site-footer.tsx`
- `components/dmv-site-nav.tsx`
- `components/girls-flag-interest.tsx`
- `components/registration-confirmation.tsx`
- `components/tryout-division-select.tsx`
- `components/tryout-events.tsx`
- `components/tryout-form.tsx`
- `components/tryout-payments.tsx`
- `docs/website-refresh-2026-11-02.md`
- `lib/http.mjs`
- `lib/integrations/command-center.mjs`
- `lib/integrations/command-config.mjs`
- `lib/tryouts.mjs`
- `scripts/browser-smoke.mjs`
- `tests/registration.test.mjs`
- `tests/tryout-details.test.mjs`
