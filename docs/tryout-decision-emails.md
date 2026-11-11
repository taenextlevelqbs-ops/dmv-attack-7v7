# DMV Attack automated tryout decision emails

Status decisions on the authenticated admin tryouts page trigger personalized emails to each registered parent/guardian. Supported statuses: ACCEPTED, DECLINED, CALLBACK, OFFERED. This does not change existing team-offer acceptance and payment access rules.

## Activate safely
1. Apply `supabase/migrations/20261111190000_tryout_decision_emails.sql` to the correct Supabase project.
2. Verify `dmvattack.com` (or an appropriate sending subdomain) in Resend and configure these Vercel production environment variables privately:
   - `RESEND_API_KEY` (secret)
   - `DMV_ATTACK_EMAIL_FROM` (verified sender, e.g. DMV Attack <notifications@your-verified-domain>)
   - `DMV_ATTACK_DECISION_EMAILS_ENABLED=true` only **after** testing.
3. Deploy and test first with an internal dummy athlete/parent email. Until enabled, decisions still save and a pending email record remains without being sent.
4. View the email notification status in each athlete's admin card and retry failures only after verifying the original was not delivered. Check Resend delivery logs before retrying a provider-ambiguous failure.

Each (submission, decision) can be sent only once by default. A state update to the existing status does not resend it. All sends are server-side after OWNER/ADMIN authorization. CHECKIN cannot trigger a decision email. The sender uses Resend's idempotency key and a private database claim to reduce duplicate deliveries. Never publish provider tokens in source or client code.

**Important:** ACCEPTED in the tryout status is a coaching decision, not the same as a finalized team roster assignment. This email intentionally does not claim payment is available or include a generic checkout URL. An offer email similarly requires subsequent roster processing.
