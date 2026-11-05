import type Stripe from "stripe";
import { stripeDatabase } from "@/lib/finance/stripe";

export async function syncFoundationCheckout(stripe: Stripe, sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const id = session.metadata?.foundation_order_id;
  if (!id) return;
  const db = stripeDatabase();
  const {data: order,error} = await db.from("foundation_contributions").select("*").eq("id",id).maybeSingle();
  if (error || !order) throw new Error("Foundation contribution ledger not found");
  if (session.client_reference_id !== order.id ||
      (order.stripe_session_id && order.stripe_session_id !== session.id) ||
      session.mode !== "payment" || session.currency !== "usd" ||
      session.amount_total !== order.amount_cents ||
      session.livemode !== process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")) {
    throw new Error("Foundation Stripe checkout validation failed");
  }
  const intentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  let refunded = 0, disputed = false;
  if (intentId) {
    for await (const refund of stripe.refunds.list({ payment_intent: intentId, limit: 100 })) {
      if (refund.status === "succeeded") refunded += refund.amount;
    }
    const intent = await stripe.paymentIntents.retrieve(intentId, {expand:["latest_charge"]});
    const charge = intent.latest_charge;
    disputed = Boolean(charge && typeof charge !== "string" && charge.disputed);
  }
  let status = session.payment_status === "paid" ? "PAID" : session.status === "expired" ? "EXPIRED" : session.status === "complete" ? "PENDING" : "OPEN";
  if (disputed) status = "REVIEW_REQUIRED";
  else if (refunded >= order.amount_cents) status = "REFUNDED";
  else if (refunded > 0) status = "PARTIALLY_REFUNDED";
  const {error: writeError} = await db.from("foundation_contributions").update({
    stripe_session_id: session.id,
    stripe_payment_intent_id: intentId || null,
    refunded_cents: refunded,
    status, updated_at: new Date().toISOString(),
    published: status === "PAID" ? Boolean(order.published) : false,
  }).eq("id",order.id);
  if (writeError) throw new Error("Unable to synchronize foundation payment");
}
