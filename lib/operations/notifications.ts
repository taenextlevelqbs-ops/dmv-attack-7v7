import 'server-only';
import {createHash} from 'node:crypto';
import {stripeDatabase} from '@/lib/finance/stripe';
import {origin} from './server';
export async function deliverAcceptance(notificationId:string){
 if(process.env.ACCEPTANCE_EMAILS_ENABLED!=='true')return {status:'DISABLED',sent:false};
 if(!process.env.RESEND_API_KEY||!process.env.ACCEPTANCE_EMAIL_FROM)return{status:'CONFIGURATION_REQUIRED',sent:false};
 const db=stripeDatabase();
 const claim=await db.rpc('claim_tryout_notification',{p_id:notificationId});
 if(claim.error)throw Error('Notification migration required');
 const notice=claim.data;if(!notice)return {status:'ALREADY_SENT_OR_LEASED',sent:false};
 try{
  const {data:registration,error:rError}=await db.from('tryout_submissions').select('id,parent_email,parent_guardian_name,athlete_first_name,athlete_last_name,status').eq('id',notice.registration_id).single();
  const {data:assignment,error:aError}=await db.from('roster_assignments').select('team_id,roster_status').eq('id',notice.assignment_id).single();
  if(rError||aError||!registration||registration.status!=='ACCEPTED'||!assignment||!['ACCEPTED','ACTIVE'].includes(assignment.roster_status))throw Error('Acceptance is no longer valid');
  const {data:team,error:tError}=await db.from('teams').select('name').eq('id',assignment.team_id).single();if(tError||!team)throw Error('Team missing');
  const email=registration.parent_email.trim().toLowerCase();
  async function findUser(){for(let page=1;;page++){const {data,error}=await db.auth.admin.listUsers({page,perPage:1000});if(error)throw Error('Auth lookup unavailable');const found=data.users.find(u=>u.email?.trim().toLowerCase()===email);if(found||data.users.length<1000)return found;}}
  let user=await findUser();
  if(!user){const created=await db.auth.admin.createUser({email,email_confirm:false,user_metadata:{first_name:registration.parent_guardian_name}});user=created.data.user||await findUser();if(!user)throw Error('Unable to provision parent account');}
  const linked=await db.rpc('link_tryout_parent',{p_registration_id:registration.id,p_user_id:user.id});if(linked.error)throw Error('Family identity needs staff review');
  const body={from:process.env.ACCEPTANCE_EMAIL_FROM,to:[email],subject:`DMV Attack offer accepted — ${team.name}`,text:`${registration.parent_guardian_name},\n\n${registration.athlete_first_name} ${registration.athlete_last_name} has been accepted to ${team.name}.\n\nOpen ${origin()}/portal to view your athlete and team registration payment. Use ${email} and choose email sign-in if you do not have a password yet. The $750 team registration fee is available only through your secure parent portal after acceptance.\n\nDMV Attack`};
  const digest=createHash('sha256').update(JSON.stringify(body)).digest('hex');
  if(notice.payload_hash&&notice.payload_hash!==digest)throw Error('Notification details changed; reconcile previous delivery');
  const saved=await db.from('tryout_acceptance_notifications').update({payload_hash:digest}).eq('id',notice.id);if(saved.error)throw Error('Notification audit unavailable');
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`dmv-acceptance-${notice.id}`},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('Email provider rejected delivery');const result=await response.json();
  const done=await db.from('tryout_acceptance_notifications').update({status:'SENT',provider_id:result.id,sent_at:new Date().toISOString(),locked_until:null,last_error:null}).eq('id',notice.id);if(done.error)throw Error('Delivery audit needs reconciliation');
  return{status:'SENT',sent:true};
 }catch{
  await db.from('tryout_acceptance_notifications').update({status:'FAILED',locked_until:null,last_error:'Acceptance delivery failed. Check provider delivery history before retrying.'}).eq('id',notice.id);
  return{status:'FAILED',sent:false};
 }
}
