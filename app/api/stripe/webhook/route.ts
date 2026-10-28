import { stripeClient, syncCheckout } from "@/lib/finance/stripe";
import type Stripe from "stripe";
import { stripeDatabase } from "@/lib/finance/stripe";
import { isLiveStripeKey } from "@/lib/finance/stripe-key.mjs";
import { dispatchStripeEvent, synchronizeRegistration } from "@/lib/payments/core.mjs";

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
    const {error:auditError}=await db.from('stripe_webhook_events').upsert({event_id:event.id,event_type:event.type},{onConflict:'event_id',ignoreDuplicates:true});
    if(auditError) throw Error('Webhook audit unavailable');
    const {data:logged,error:readError}=await db.from('stripe_webhook_events').select('status,attempts').eq('event_id',event.id).single();
    if(readError) throw Error('Webhook audit unavailable');
    if(logged.status==='PROCESSED')return Response.json({received:true});
    const {error:attemptError}=await db.from('stripe_webhook_events').update({status:'PROCESSING',attempts:logged.attempts+1,last_error:null}).eq('event_id',event.id);
    if(attemptError) throw Error('Webhook audit unavailable');
    await dispatchStripeEvent(stripe,event,async(sessionId:string)=>{
      if(!await synchronizeRegistration(stripe,db,sessionId,isLiveStripeKey(process.env.STRIPE_SECRET_KEY))) await syncCheckout(stripe,sessionId);
    });
    const {error:processedError}=await db.from('stripe_webhook_events').update({status:'PROCESSED',processed_at:new Date().toISOString(),last_error:null}).eq('event_id',event.id);
    if(processedError) throw Error('Webhook audit write failed');
    return Response.json({received:true});
  } catch {
    // No payloads, customer details or credentials are retained in the audit log.
    await db.from('stripe_webhook_events').update({status:'FAILED',last_error:'Payment synchronization failed. Inspect Stripe event and retry after fixing configuration.'}).eq('event_id',event.id);
    console.error('Stripe payment synchronization failed',{eventId:event.id,eventType:event.type});
    return new Response('Payment update will be retried',{status:503});
  }
}
