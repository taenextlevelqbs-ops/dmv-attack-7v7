import { NextResponse } from "next/server";
import { createClient as serviceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sameOrigin } from "@/lib/admin/api";

export const runtime = "nodejs";
const groups = ["10U","12U","14U","15U","18U"];
type Candidate = {
  id:string; age_group:string; athlete_first_name:string; athlete_last_name:string;
  parent_guardian_name:string|null; parent_email:string|null; status:string; communication_consent:boolean;
};
type Assignment={tryout_submission_id:string;team_id:string;roster_status:string};
function adminClient() {
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;
 if(!url || !secret)throw new Error("Missing server settings");
 return serviceClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
}
async function checkStaff() {
 const session=await createClient();
 const {data:{user}}=await session.auth.getUser();
 if(!user)return null;
 const {data:profile,error}=await session.from("profiles").select("role").eq("id",user.id).maybeSingle();
 return !error && profile && ["OWNER","ADMIN"].includes(profile.role) ? user : null;
}
async function audience(admin:ReturnType<typeof adminClient>,division:string,teamId:string|null){
 const {data:athletes,error:athleteError}=await admin.from("tryout_submissions")
   .select("id,age_group,athlete_first_name,athlete_last_name,parent_guardian_name,parent_email,status,communication_consent")
   .eq("age_group",division).eq("status","ACCEPTED").eq("communication_consent",true).limit(1000);
 if(athleteError)throw athleteError;
 const {data:assignments,error:assignmentError}=await admin.from("roster_assignments")
   .select("tryout_submission_id,team_id,roster_status").in("roster_status",["ACCEPTED","ACTIVE","OFFERED"]).limit(2000);
 if(assignmentError)throw assignmentError;
 const matching=(athletes??[] as Candidate[]).filter(a=>!teamId ||
   (assignments??[] as Assignment[]).some(t=>t.tryout_submission_id===a.id && t.team_id===teamId && ["ACCEPTED","ACTIVE"].includes(t.roster_status)));
 const emails=new Map<string,{email:string;athletes:string[]}>();
 for(const a of matching) {
  const email=String(a.parent_email??"").trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))continue;
  const item=emails.get(email)??{email,athletes:[]};
  item.athletes.push([a.athlete_first_name,a.athlete_last_name].filter(Boolean).join(" "));
  emails.set(email,item);
 }
 return [...emails.values()].sort((a,b)=>a.email.localeCompare(b.email));
}
async function getTeams(admin:ReturnType<typeof adminClient>) {
 const {data,error}=await admin.from("teams").select("id,name,age_group,season,active").eq("active",true).order("age_group");
 if(error)throw error;
 return data??[];
}
export async function GET(request:Request){
 const staff=await checkStaff();
 if(!staff)return NextResponse.json({error:"Unauthorized"},{status:403});
 try {
  const admin=adminClient();
  const teams=await getTeams(admin);
  const params=new URL(request.url).searchParams;
  const previewGroup=params.get("age_group");
  const previewTeam=params.get("team_id");
  if(previewGroup && !groups.includes(previewGroup))return NextResponse.json({error:"Invalid division"},{status:400});
  if(previewTeam && (!previewGroup || !teams.some(t=>t.id===previewTeam && t.age_group===previewGroup)))return NextResponse.json({error:"Invalid team"},{status:400});
  if(previewGroup){
   const recipients=await audience(admin,previewGroup,previewTeam);
   return NextResponse.json({recipients,digest:await digestAudience(recipients)},{headers:{"Cache-Control":"private, no-store"}});
  }
  const result=await Promise.all(groups.map(async age_group=>({age_group,recipients:await audience(admin,age_group,null)})));
  const {data:history,error:historyError}=await admin.from("family_update_campaigns")
    .select("id,age_group,team_id,subject,recipient_count,sent_count,failed_count,created_at")
    .order("created_at",{ascending:false}).limit(20);
  if(historyError)throw historyError;
  return NextResponse.json({groups:result,teams,history:history??[]},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){console.error("Family groups read failed:",error);return NextResponse.json({error:"Unable to load family groups"},{status:500});}
}
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid request origin"},{status:403});
 const staff=await checkStaff();
 if(!staff)return NextResponse.json({error:"Unauthorized"},{status:403});
 try{
  const body=await request.json();
  const group=String(body.age_group??"").toUpperCase();
  const teamId=typeof body.team_id==="string" && body.team_id?body.team_id:null;
  const subject=String(body.subject??"").trim(),message=String(body.message??"").trim();
  if(!groups.includes(group)||subject.length<4||subject.length>150||message.length<10||message.length>5000)
   return NextResponse.json({error:"Choose an age group and enter a valid subject and message."},{status:400});
  const admin=adminClient();
  if(teamId){
   const {data:team,error}=await admin.from("teams").select("id,age_group,active").eq("id",teamId).maybeSingle();
   if(error||!team||!team.active||team.age_group!==group)return NextResponse.json({error:"Select a valid team in that age group"},{status:400});
  }
  if(process.env.DMV_ATTACK_DECISION_EMAILS_ENABLED!=="true"||!process.env.RESEND_API_KEY||!process.env.DMV_ATTACK_EMAIL_FROM)
   return NextResponse.json({error:"Email delivery is not configured"},{status:503});
  const recipients=await audience(admin,group,teamId);
  if(!recipients.length)return NextResponse.json({error:"No accepted families with email consent are in this group."},{status:400});
  if(recipients.length>100)return NextResponse.json({error:"This group has more than 100 families. Contact an administrator to split the mailing."},{status:400});
  // A preview digest must match the exact on-screen set of recipients before sending.
  const digest=await digestAudience(recipients);
  if(body.recipient_digest!==digest)return NextResponse.json({error:"Recipient list changed. Refresh, review and send again."},{status:409});
  const {data:campaign,error:createError}=await admin.from("family_update_campaigns").insert({
   age_group:group,team_id:teamId,subject,message,created_by:staff.id,recipient_count:recipients.length
  }).select("id").single();
  if(createError||!campaign)throw createError??new Error("Campaign insert failed");
  const {data:deliveries,error:deliveryError}=await admin.from("family_update_deliveries")
   .insert(recipients.map(r=>({campaign_id:campaign.id,parent_email:r.email}))).select("id,parent_email");
  if(deliveryError||!deliveries)throw deliveryError??new Error("Delivery insert failed");
  const byRecipient=new Map(recipients.map(r=>[r.email,r]));
  const escape=(str:string)=>str.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]??c));
  let sent=0,failed=0;
  // Individual email requests protect family addresses; bounded concurrency avoids API overload.
  for(let i=0;i<deliveries.length;i+=8){
   await Promise.all(deliveries.slice(i,i+8).map(async d=>{
    try{
     const family=byRecipient.get(d.parent_email);
     const greeting=family?.athletes.length? `For your athlete(s): ${family.athletes.join(", ")}\n\n`:"";
     const text=`DMV ATTACK 7V7 | ${group} UPDATE\n\n${greeting}${message}\n\nDMV Attack Coaching Staff\nhttps://www.dmvattack.com`;
     const html=`<!doctype html><html><body style="margin:0;background:#090909;padding:26px 12px;color:white;font-family:Arial,sans-serif"><main style="max-width:560px;margin:auto;border:1px solid #303030;border-radius:16px;padding:28px"><p style="color:#a3e635;font-weight:bold;letter-spacing:2px">DMV ATTACK 7V7 • ${escape(group)}</p><h1 style="font-size:26px">${escape(subject)}</h1><p style="color:#dddddd;white-space:pre-wrap;line-height:1.6">${escape(greeting+message)}</p><p>DMV Attack Coaching Staff</p><a href="https://www.dmvattack.com" style="color:#a3e635">DMVATTACK.COM</a></main></body></html>`;
     const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json","Idempotency-Key":d.id},
      body:JSON.stringify({from:process.env.DMV_ATTACK_EMAIL_FROM,to:[d.parent_email],subject:`DMV Attack ${group}: ${subject}`,text,html})});
     const payload=await response.json().catch(()=>({}));
     if(!response.ok || !payload.id)throw new Error(`Provider status ${response.status}`);
     const {error:logError}=await admin.from("family_update_deliveries").update({state:"sent",sent_at:new Date().toISOString(),provider_message_id:payload.id}).eq("id",d.id);
     if(logError)throw logError;
     sent++;
    }catch(err){
     failed++;
     console.error("Family update delivery failed",err);
     await admin.from("family_update_deliveries").update({state:"failed",error_message:"Email delivery failed; staff review required"}).eq("id",d.id);
    }
   }));
  }
  await admin.from("family_update_campaigns").update({sent_count:sent,failed_count:failed}).eq("id",campaign.id);
  return NextResponse.json({campaign_id:campaign.id,recipient_count:recipients.length,sent,failed},{headers:{"Cache-Control":"private,no-store"}});
 }catch(error){console.error("Send family update failed:",error);return NextResponse.json({error:"Unable to complete team update; review campaign history before retrying."},{status:500});}
}
async function digestAudience(recipients:{email:string}[]){
 const encoded=new TextEncoder().encode(recipients.map(r=>r.email).join("\n"));
 const hash=await crypto.subtle.digest("SHA-256",encoded);
 return Array.from(new Uint8Array(hash)).map(x=>x.toString(16).padStart(2,"0")).join("");
}
