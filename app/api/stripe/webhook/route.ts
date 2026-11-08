import { stripeClient, syncCheckout } from "@/lib/finance/stripe";
import type Stripe from "stripe";
import {stripeDatabase} from "@/lib/finance/stripe";
import {isLiveStripeKey} from "@/lib/finance/stripe-key.mjs";
import {syncTryoutPayment,relatedSessions} from "@/lib/operations/stripe.mjs";

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
  const db=stripeDatabase();
  try {
    const audit=await db.from("tryout_webhook_audit").upsert({event_id:event.id,event_type:event.type,status:"PROCESSING",updated_at:new Date().toISOString()},{onConflict:"event_id"});
    // Existing private team checkouts can still reconcile if the additive audit migration is pending.
    await relatedSessions(stripe,event,async(sessionId:string)=>{
      const handled=await syncTryoutPayment(stripe,db,sessionId,isLiveStripeKey(process.env.STRIPE_SECRET_KEY));
      if(handled&&audit.error)throw Error("Tryout webhook audit unavailable");
      if(!handled)await syncCheckout(stripe,sessionId);
    });
    if(!audit.error){const saved=await db.from("tryout_webhook_audit").update({status:"PROCESSED",last_error:null,updated_at:new Date().toISOString()}).eq("event_id",event.id);if(saved.error)throw Error("Webhook audit unavailable");}
    return Response.json({received:true});
  }catch{
    await db.from("tryout_webhook_audit").upsert({event_id:event.id,event_type:event.type,status:"FAILED",last_error:"Verification or ledger update failed; inspect this Stripe event before matching manually.",updated_at:new Date().toISOString()},{onConflict:"event_id"});
    console.error("Stripe reconciliation failed",{eventId:event.id,eventType:event.type});
    return new Response("Payment update requires reconciliation or retry",{status:503});
  }
}
