import type { SupabaseClient } from "@supabase/supabase-js";

export type Decision = "ACCEPTED" | "DECLINED" | "CALLBACK" | "OFFERED";
export const emailDecisions = new Set<Decision>(["ACCEPTED", "DECLINED", "CALLBACK", "OFFERED"]);
type Submission = { id: string; athlete_first_name: string; athlete_last_name: string; age_group: string; parent_email: string | null; parent_guardian_name: string | null; referral_source?: string | null };

const safe = (value: string) => value.replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c] ?? c));

export function decisionEmail(submission: Submission, decision: Decision) {
 const athlete = safe(submission.athlete_first_name);
 const fullName = safe([submission.athlete_first_name,submission.athlete_last_name].filter(Boolean).join(" "));
 const division = safe(submission.age_group);
 const directInvite = submission.referral_source === "Direct Invitation";
 const content = {
  ACCEPTED: {
   subject: "Congratulations! Welcome to DMV Attack",
   headline: "WELCOME TO THE ATTACK.",
   message: directInvite ? `Congratulations, ${athlete}! Your DMV Attack direct invitation has been confirmed for the ${division} division. Our staff will share your team assignment and official roster registration steps. Please do not submit a team fee until you receive your official instructions.` : `Congratulations, ${athlete}! Our coaching staff is excited to select you for DMV Attack. Your effort, competitiveness, and performance stood out at tryouts. Your division is ${division}. Our staff will share your team assignment and the next steps for completing your roster registration. Please do not submit a team fee until you receive your official instructions.`,
  },
  DECLINED: {
   subject: "DMV Attack Tryout Update",
   headline: "THANK YOU FOR COMPETING.",
   message: `Thank you, ${athlete}, for coming out to DMV Attack tryouts. After carefully reviewing this year's evaluations, we are unable to offer you a roster spot at this time. We appreciate your effort and encourage you to keep developing your game. We hope to see you again at a future opportunity.`,
  },
  CALLBACK: {
   subject: "DMV Attack: Next Steps After Tryouts",
   headline: "YOU'RE STILL IN CONSIDERATION.",
   message: `Thank you, ${athlete}, for competing at DMV Attack tryouts. Our coaches would like to continue evaluating you. We will contact your family with the next steps and any callback details. No further action is required until then.`,
  },
  OFFERED: {
   subject: "DMV Attack Roster Offer",
   headline: "YOU'VE RECEIVED AN OFFER.",
   message: directInvite ? `Congratulations, ${athlete}! Your DMV Attack direct invitation has been reviewed and our staff is offering you a position in ${division}. We will follow up with the assigned team and official acceptance steps. Your spot is finalized through the roster acceptance process.` : `Congratulations, ${athlete}! DMV Attack would like to offer you a position in the ${division} division. Our staff will follow up with your team assignment and instructions to accept your offer. Your roster spot is not finalized until the offer process is completed.`,
  },
 }[decision];
 const url = "https://www.dmvattack.com";
 const html = `<!doctype html><html><body style="margin:0;background:#090909;color:#ffffff;font-family:Arial,sans-serif;padding:32px 12px"><div style="max-width:560px;margin:auto;border:1px solid #303030;border-radius:18px;overflow:hidden"><div style="background:#141b0e;padding:32px;text-align:center"><p style="color:#a3e635;letter-spacing:3px;font-weight:bold">DMV ATTACK 7V7</p><h1 style="font-size:28px;line-height:1.2">${content.headline}</h1></div><div style="padding:30px"><p style="color:#a3e635">ATHLETE: ${fullName}</p><p style="color:#dddddd;font-size:16px;line-height:1.75">${content.message}</p><p style="margin-top:26px;font-weight:bold">DMV Attack Coaching Staff</p><p><a style="color:#a3e635" href="${url}">DMVATTACK.COM</a></p></div></div></body></html>`;
 const text = `DMV ATTACK 7V7\n\n${content.headline}\n\nAthlete: ${[submission.athlete_first_name,submission.athlete_last_name].filter(Boolean).join(" ")}\n\n${content.message.replaceAll("&#39;", "'")}\n\nDMV Attack Coaching Staff\n${url}`;
 return {subject:content.subject,html,text};
}

export async function sendDecisionEmail(admin: SupabaseClient, submission: Submission, decision: Decision) {
 const recipient = String(submission.parent_email ?? "").trim().toLowerCase();
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) return {state:"missing_recipient" as const};
 // Insert once per athlete/decision. Existing entries (including sent ones) are never reinserted.
 const {error:insertError} = await admin.from("tryout_decision_emails").upsert({
  submission_id:submission.id, decision, recipient_email:recipient
 },{onConflict:"submission_id,decision",ignoreDuplicates:true});
 if(insertError) {console.error("Decision email queue error",insertError);return {state:"queue_failed" as const};}
 const {data:record,error:readError} = await admin.from("tryout_decision_emails")
  .select("id,state").eq("submission_id",submission.id).eq("decision",decision).single();
 if(readError || !record) return {state:"queue_failed" as const};
 if(record.state === "sent") return {state:"already_sent" as const};
 if(record.state === "sending") return {state:"already_processing" as const};
 // Deliberately require explicit provider activation; never silently email families.
 const key=process.env.RESEND_API_KEY, from=process.env.DMV_ATTACK_EMAIL_FROM;
 if(!key || !from || process.env.DMV_ATTACK_DECISION_EMAILS_ENABLED !== "true") return {state:"pending_configuration" as const};
 const {data:claimed,error:claimError}=await admin.rpc("claim_tryout_decision_email",{p_id:record.id});
 if(claimError || !claimed) return {state:"already_processing" as const};
 try {
  const email=decisionEmail(submission,decision);
  const response=await fetch("https://api.resend.com/emails",{
   method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json","Idempotency-Key":record.id},
   body:JSON.stringify({from,to:[recipient],subject:email.subject,html:email.html,text:email.text}),
  });
  const payload=await response.json().catch(()=>({}));
  if(!response.ok || !payload.id) throw new Error(`Email provider returned ${response.status}`);
  await admin.from("tryout_decision_emails").update({state:"sent",provider_message_id:payload.id,sent_at:new Date().toISOString(),updated_at:new Date().toISOString(),error_message:null}).eq("id",record.id);
  return {state:"sent" as const};
 } catch(error) {
  console.error("Decision email send failed",error);
  await admin.from("tryout_decision_emails").update({state:"failed",error_message:"Provider send failed; retry required",updated_at:new Date().toISOString()}).eq("id",record.id);
  return {state:"failed" as const};
 }
}
