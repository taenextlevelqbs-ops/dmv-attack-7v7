import {STRIPE_TRYOUT_URL} from '../tryouts.mjs';
export async function syncTryoutPayment(stripe,db,sessionId,liveMode){
 const session=await stripe.checkout.sessions.retrieve(sessionId);
 if(!session.payment_link)return false;
 const linkId=typeof session.payment_link==='string'?session.payment_link:session.payment_link.id;
 const link=await stripe.paymentLinks.retrieve(linkId);
 if(link.url!==STRIPE_TRYOUT_URL)return false;
 if(session.livemode!==liveMode||session.mode!=='payment'||session.currency!=='usd'||session.amount_total!==2000)throw Error('Tryout payment amount or mode mismatch');
 if(session.payment_status!=='paid')return true; // Never credit pending/failed cards.
 const reference=session.client_reference_id;
 if(typeof reference!=='string'||!reference||reference.length>100)throw Error('Tryout reference missing; manual reconciliation required');
 const {data:registration,error}=await db.from('tryout_submissions').select('id,parent_email').eq('tryout_id',reference).maybeSingle();
 if(error||!registration)throw Error('Tryout reference unmatched');
 if(session.customer_details?.email?.trim().toLowerCase()!==registration.parent_email.trim().toLowerCase())throw Error('Parent email does not match registration');
 const intentId=typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id;
 if(!intentId)throw Error('Payment intent missing');
 const intent=await stripe.paymentIntents.retrieve(intentId);
 if(intent.status!=='succeeded'||intent.currency!=='usd'||intent.amount!==2000||intent.amount_received!==2000)throw Error('Tryout payment not settled');
 let refunded=0;for await(const refund of stripe.refunds.list({payment_intent:intentId,limit:100}))if(refund.status==='succeeded')refunded+=refund.amount;
 const customer=typeof session.customer==='string'?session.customer:session.customer?.id;
 const saved=await db.rpc('record_tryout_stripe',{p_session:session.id,p_registration:registration.id,p_intent:intentId,p_customer:customer||null,p_refund:refunded});
 if(saved.error)throw Error('Tryout receipt ledger unavailable');return true;
}
export async function relatedSessions(stripe,event,sync){
 if(event.type.startsWith('checkout.session.'))return sync(event.data.object.id);
 if(event.type==='payment_intent.payment_failed'||event.type.startsWith('charge.')||event.type.startsWith('refund.')){
  const obj=event.data.object;const id=event.type==='payment_intent.payment_failed'?obj.id:typeof obj.payment_intent==='string'?obj.payment_intent:obj.payment_intent?.id;
  if(id)for await(const session of stripe.checkout.sessions.list({payment_intent:id,limit:100}))await sync(session.id);
 }
}
