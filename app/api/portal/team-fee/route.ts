import {sameOrigin,privateHeaders} from '@/lib/admin/api';
import {parent,uuid,origin} from '@/lib/operations/server';
import {stripeClient} from '@/lib/finance/stripe';
import {summarizeAccount} from '@/lib/finance/money.mjs';
import {allRows} from '@/lib/admin/pagination';
import {isLiveStripeKey} from '@/lib/finance/stripe-key.mjs';
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Request origin rejected'},{status:403,headers:privateHeaders});
 const auth=await parent();if(!auth)return Response.json({error:'Verified parent sign-in required'},{status:403,headers:privateHeaders});
 const body=await request.json().catch(()=>null);if(!uuid(body?.account_id))return Response.json({error:'Select a team fee account'},{status:400,headers:privateHeaders});
 try{
  const {data:account,error}=await auth.db.from('team_fee_accounts').select('*').eq('id',body.account_id).single();if(error||!account)return Response.json({error:'Account unavailable'},{status:404,headers:privateHeaders});
  const {data:r,error:rError}=await auth.db.from('tryout_submissions').select('status,linked_family_id,parent_email').eq('id',account.registration_id).single();if(rError)throw rError;
  const {data:member}=await auth.db.from('family_members').select('id').eq('profile_id',auth.user.id).eq('family_id',r?.linked_family_id||'00000000-0000-0000-0000-000000000000').maybeSingle();
  const {data:assignment}=await auth.db.from('roster_assignments').select('id').eq('tryout_submission_id',account.registration_id).eq('team_id',account.team_id).in('roster_status',['ACCEPTED','ACTIVE']).maybeSingle();
  if(!member||r.status!=='ACCEPTED'||!assignment)return Response.json({error:'Only an accepted athlete’s linked parent may pay this fee'},{status:403,headers:privateHeaders});
  const rows=await allRows((start,end)=>auth.db.from('team_fee_transactions').select('*').eq('account_id',account.id).order('id').range(start,end));if(rows.error)throw rows.error;
  if(account.fee_cents!==75000||account.discount_cents!==0||summarizeAccount(account,rows.data||[],'').balance_cents!==75000)return Response.json({error:'This fee is paid or adjusted. Ask staff about any remaining balance.'},{status:409,headers:privateHeaders});
  if(!process.env.STRIPE_TEAM_PRICE_ID||!process.env.STRIPE_WEBHOOK_SECRET)return Response.json({error:'Team checkout requires staff configuration'},{status:503,headers:privateHeaders});
  const stripe=stripeClient();const price=await stripe.prices.retrieve(process.env.STRIPE_TEAM_PRICE_ID);
  if(!price.active||price.type!=='one_time'||price.currency!=='usd'||price.unit_amount!==75000||price.livemode!==isLiveStripeKey(process.env.STRIPE_SECRET_KEY))throw Error('Price configuration mismatch');
  const existing=await auth.db.from('team_fee_checkouts').select('*').eq('account_id',account.id).eq('paid',false).order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(existing.error)throw existing.error;
  let requestId:string;
  if(existing.data&&!['EXPIRED','FAILED'].includes(existing.data.status)){
   if(existing.data.checkout_url)return Response.json({url:existing.data.checkout_url},{headers:privateHeaders});
   if(existing.data.created_by!==auth.user.id||Date.now()-Date.parse(existing.data.created_at)>23*60*60*1000)return Response.json({error:'A prior checkout requires staff reconciliation before a new one can be created.'},{status:409,headers:privateHeaders});
   requestId=existing.data.id;
  }else{
   requestId=crypto.randomUUID();const reserve=await auth.db.rpc('reserve_team_fee_checkout',{p_id:requestId,p_account_id:account.id,p_amount_cents:75000,p_created_by:auth.user.id});if(reserve.error)throw reserve.error;
  }
  const session=await stripe.checkout.sessions.create({mode:'payment',allowed_payment_method_types:['card'],customer_email:r.parent_email,client_reference_id:requestId,metadata:{fee_checkout_id:requestId,fee_account_id:account.id},payment_intent_data:{metadata:{fee_checkout_id:requestId},receipt_email:r.parent_email},line_items:[{price:price.id,quantity:1}],success_url:origin()+'/portal?payment=processing',cancel_url:origin()+'/portal?payment=canceled'},{idempotencyKey:'fee-checkout-'+requestId});
  if(!session.url)throw Error('Checkout unavailable');const saved=await auth.db.from('team_fee_checkouts').update({session_id:session.id,checkout_url:session.url}).eq('id',requestId);if(saved.error)throw saved.error;
  return Response.json({url:session.url},{headers:privateHeaders});
 }catch{return Response.json({error:'Unable to open team checkout. No new charge was initiated by this request; refresh or contact staff before retrying.'},{status:503,headers:privateHeaders});}
}
