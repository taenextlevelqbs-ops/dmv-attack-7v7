import { ownerApi, privateHeaders } from "@/lib/admin/api";
import { stripeClient } from "@/lib/finance/stripe";
import { isLiveStripeKey } from "@/lib/finance/stripe-key.mjs";

// Read-only diagnostics: never creates a customer, checkout, fee or payment.
export async function GET() {
  try {
    const auth = await ownerApi();
    if (!auth) return Response.json({ error: "Owner access required" }, { status: 403, headers: privateHeaders });
    const key = process.env.STRIPE_SECRET_KEY;
    const credentials = Boolean(key && (process.env.VERCEL_ENV !== "production" || isLiveStripeKey(key)));
    const { error: databaseError } = await auth.admin.from("team_fee_checkouts").select("id").limit(1);
    const checks = {
      database: !databaseError,
      credentials,
      webhook_secret: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_")),
      checkout_read: false,
      payment_read: false,
      refund_read: false,
    };
    if (credentials) {
      const stripe = stripeClient();
      const results = await Promise.allSettled([
        stripe.checkout.sessions.list({ limit: 1 }),
        stripe.paymentIntents.list({ limit: 1 }),
        stripe.refunds.list({ limit: 1 }),
      ]);
      checks.checkout_read = results[0].status === "fulfilled";
      checks.payment_read = results[1].status === "fulfilled";
      checks.refund_read = results[2].status === "fulfilled";
    }
    return Response.json({ checks, mode: isLiveStripeKey(key) ? "LIVE" : "TEST",
      payment_delivery_verified: false,
      note: "These read-only checks do not verify checkout creation, enabled payment methods, webhook subscriptions or payment delivery." }, { headers: privateHeaders });
  } catch {
    return Response.json({ error: "Unable to check Stripe. No fee account or payment was created." }, { status: 503, headers: privateHeaders });
  }
}
