#!/usr/bin/env bash
# Run from the DMV Attack checkout on your own computer.
# No test commands are run. Production deployment still builds the application.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
command -v node >/dev/null || { echo 'Install Node.js 22+ first: https://nodejs.org'; exit 1; }
command -v npx >/dev/null || { echo 'Node.js/npm is required.'; exit 1; }
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo 'Your tracked files have local changes. Commit or stash them before deployment; this script will not discard them.'
  exit 1
fi
if [[ "$(git branch --show-current)" != 'feat/stripe-registration-payments' ]]; then
  echo 'Switch to feat/stripe-registration-payments before running this script.'
  exit 1
fi
vercel_cli() { npx --yes vercel@latest "$@"; }

echo 'Connecting Vercel. Select your EXISTING DMV Attack project; do not create a new project.'
if ! vercel_cli whoami >/dev/null 2>&1; then vercel_cli login; fi
if [[ ! -f .vercel/project.json ]]; then vercel_cli link; fi

printf '\nPaste the site address that stays in your browser (including https://).\n'
read -r -p 'Live site URL [https://www.dmvattack.com]: ' live_origin
live_origin="${live_origin:-https://www.dmvattack.com}"
live_origin="${live_origin%/}"
case "$live_origin" in
  https://dmvattack.com|https://www.dmvattack.com) ;;
  *) echo 'Use https://dmvattack.com or https://www.dmvattack.com for this production deployment.'; exit 1 ;;
esac

printf '\nDATABASE SETUP\n'
echo 'Open the DMV Attack Supabase project, then SQL Editor -> New query.'
if command -v pbcopy >/dev/null; then
  pbcopy < supabase/migrations/20261028_registration_stripe.sql
  echo 'The required SQL is now copied. Paste it into SQL Editor and click Run.'
else
  echo 'Paste the contents of supabase/migrations/20261028_registration_stripe.sql into SQL Editor and click Run.'
fi
read -r -p 'After Supabase reports the SQL ran successfully, press Return: ' _

printf '\nSTRIPE WEBHOOK\n'
echo 'In Stripe LIVE mode -> Workbench/Developers -> Webhooks, create or update this endpoint:'
printf '%s/api/stripe/webhook\n' "$live_origin"
echo 'Use API version 2026-09-30.endive and include these events (preserve other existing events):'
cat <<'EVENTS'
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
checkout.session.expired
payment_intent.payment_failed
charge.refunded
refund.created
refund.updated
refund.failed
charge.dispute.created
charge.dispute.closed
EVENTS
read -r -p 'After saving the live webhook, press Return: ' _

echo 'Saving missing PRODUCTION variables. Existing secrets and unrelated variables are preserved.'
variables="$(vercel_cli env ls production 2>&1)"
has_variable() { printf '%s\n' "$variables" | grep -wq "$1"; }
add_secret() {
  if has_variable "$1"; then
    printf 'Keeping existing %s.\n' "$1"
  else
    printf '\nEnter %s at the Vercel prompt. %s\n' "$1" "$2"
    vercel_cli env add "$1" production
  fi
}
add_secret STRIPE_SECRET_KEY 'Use the Stripe LIVE server secret key, not the publishable key.'
add_secret STRIPE_WEBHOOK_SECRET 'Use the whsec_ signing secret from the LIVE endpoint you just saved.'
if has_variable STRIPE_TRYOUT_PRICE_ID; then
  echo 'Keeping the existing production STRIPE_TRYOUT_PRICE_ID.'
else
  echo 'Enter the LIVE one-time USD $20 Price ID shown in Stripe, not a product ID.'
  vercel_cli env add STRIPE_TRYOUT_PRICE_ID production
fi
if ! has_variable PAYMENTS_BASE_URL; then
  printf '%s' "$live_origin" | vercel_cli env add PAYMENTS_BASE_URL production
else
  echo 'Keeping the existing production PAYMENTS_BASE_URL. It must match the live address above.'
fi
# This is the sole existing variable intentionally changed: enable online registration.
if has_variable STRIPE_REGISTRATION_ENABLED; then
  vercel_cli env rm STRIPE_REGISTRATION_ENABLED production --yes
fi
printf 'true' | vercel_cli env add STRIPE_REGISTRATION_ENABLED production

echo 'Merging the latest main without discarding any work, then publishing the code.'
git fetch origin main
git merge --no-edit origin/main
git push origin HEAD:main

echo 'Deploying the linked Vercel project to production. This builds the site; it does not run our test suite.'
vercel_cli --prod --yes
printf '\nProduction deployment command finished. Open %s/tryouts\n' "$live_origin"
echo 'Both card checkout after registration and the existing Venmo option are included.'
