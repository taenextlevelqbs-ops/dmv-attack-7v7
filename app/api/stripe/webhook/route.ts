import { stripeClient, syncCheckout } from "@/lib/finance/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) return new Response("Not configured", { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });
  if (Number(request.headers.get("content-length")) > 1000000) return new Response("Too large", { status: 413 });
  const stripe = stripeClient();
  let event: Stripe.Event;
  try {
    const raw = await request.text();
    if (raw.length > 1000000) return new Response("Too large", { status: 413 });
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch { return new Response("Invalid signature", { status: 400 }); }
  try {
    if (["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"].includes(event.type)) {
      await syncCheckout(stripe, (event.data.object as Stripe.Checkout.Session).id);
    } else if (["charge.refunded", "refund.updated", "refund.created", "refund.failed", "charge.dispute.created", "charge.dispute.closed"].includes(event.type)) {
      const object = event.data.object as Stripe.Charge | Stripe.Refund | Stripe.Dispute;
      const intent = typeof object.payment_intent === "string" ? object.payment_intent : object.payment_intent?.id;
      if (intent) {
        for await (const session of stripe.checkout.sessions.list({ payment_intent: intent, limit: 100 })) {
          await syncCheckout(stripe, session.id);
        }
      }
    }
    return Response.json({ received: true });
  } catch {
    // Non-2xx tells Stripe to retry; never acknowledge a failed ledger write.
    console.error("Stripe payment synchronization failed", { eventType: event.type });
    return new Response("Payment update will be retried", { status: 503 });
  }
}
