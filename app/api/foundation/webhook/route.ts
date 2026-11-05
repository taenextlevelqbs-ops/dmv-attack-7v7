import type Stripe from "stripe";
import { foundationStripeClient } from "@/lib/finance/foundation-stripe";
import { syncFoundationCheckout } from "@/lib/finance/foundation-sync";
export const runtime = "nodejs";
export async function POST(request: Request) {
 const secret = process.env.FOUNDATION_STRIPE_WEBHOOK_SECRET;
 if(process.env.FOUNDATION_PAYMENTS_ENABLED!=="true" || !secret || !process.env.FOUNDATION_STRIPE_SECRET_KEY) return new Response("Not configured",{status:503});
 if(Number(request.headers.get("content-length")||0)>1000000) return new Response("Too large",{status:413});
 const signature=request.headers.get("stripe-signature");
 if(!signature) return new Response("Missing signature",{status:400});
 const stripe=foundationStripeClient();
 let event:Stripe.Event;
 try {
  const raw=await request.text();
  if(raw.length>1000000) return new Response("Too large",{status:413});
  event=stripe.webhooks.constructEvent(raw,signature,secret);
 } catch {return new Response("Invalid signature",{status:400});}
 try {
  if(["checkout.session.completed","checkout.session.async_payment_succeeded","checkout.session.async_payment_failed","checkout.session.expired"].includes(event.type)) {
    await syncFoundationCheckout(stripe,(event.data.object as Stripe.Checkout.Session).id);
  } else if(["charge.refunded","refund.updated","refund.created","refund.failed","charge.dispute.created","charge.dispute.closed"].includes(event.type)) {
    const obj=event.data.object as Stripe.Charge|Stripe.Refund|Stripe.Dispute;
    const intent=typeof obj.payment_intent==="string"?obj.payment_intent:obj.payment_intent?.id;
    if(intent) {
      for await(const session of stripe.checkout.sessions.list({payment_intent:intent,limit:100})) {
        await syncFoundationCheckout(stripe,session.id);
      }
    }
  }
  return Response.json({received:true});
 } catch(error) {
  console.error("Foundation Stripe synchronization failed",error instanceof Error?error.message:"unknown");
  return new Response("Retry payment synchronization",{status:503});
 }
}
