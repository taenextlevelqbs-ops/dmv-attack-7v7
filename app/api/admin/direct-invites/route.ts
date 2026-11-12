import { NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { createClient as serviceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sameOrigin } from "@/lib/admin/api";

export const runtime = "nodejs";
const divisions = new Set(["10U","12U","14U","15U","18U"]);

async function adminSession() {
 const session = await createClient();
 const {data:{user}} = await session.auth.getUser();
 if(!user) return null;
 const {data:profile,error} = await session.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(error || !profile || !["OWNER","ADMIN"].includes(profile.role)) return null;
 return user;
}
function adminClient(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL, secret=process.env.SUPABASE_SECRET_KEY;
 if(!url || !secret) throw new Error("Missing Supabase server settings");
 return serviceClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
}

export async function GET(){
 const user=await adminSession();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:403});
 const {data,error}=await adminClient().from("direct_roster_invites")
 .select("id,age_group,intended_athlete,team_id,max_uses,use_count,created_at,expires_at,redeemed_at,submission_id,revoked_at")
 .order("created_at",{ascending:false}).limit(100);
 if(error)return NextResponse.json({error:"Unable to load invitations"},{status:500});
 return NextResponse.json({invites:data??[]},{headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid origin"},{status:403});
 const user=await adminSession();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:403});
 try {
  const body=await request.json();
  const general=body.general===true;
  const ageGroup=general?null:String(body.age_group??"").toUpperCase();
  const name=String(body.intended_athlete??"").trim().slice(0,120);
  const teamId=String(body.team_id??"").trim();
  if(!general && !divisions.has(ageGroup!))return NextResponse.json({error:"Select an age group"},{status:400});
  const admin=adminClient();
  if(teamId && general)return NextResponse.json({error:"Choose a specific division for team-locked invitations"},{status:400});
  if(teamId){
   const {data:team,error}=await admin.from("teams").select("id,age_group,active").eq("id",teamId).maybeSingle();
   if(error || !team || !team.active || team.age_group!==ageGroup)return NextResponse.json({error:"Team does not match age group"},{status:400});
  }
  const token=randomBytes(32).toString("base64url");
  const hash=createHash("sha256").update(token).digest("hex");
  const {data,error}=await admin.from("direct_roster_invites").insert({
   token_hash:hash,age_group:ageGroup,intended_athlete:general?null:(name||null),team_id:teamId||null,
   max_uses:general?250:1,
   created_by:user.id,expires_at:new Date(Date.now()+(general?180:30)*24*60*60*1000).toISOString(),
  }).select("id").single();
  if(error||!data)throw error??new Error("Unable to create invitation");
  const link=`https://www.dmvattack.com/invite/${token}`;
  return NextResponse.json({id:data.id,link},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){
  console.error("Create direct invitation:",error);
  return NextResponse.json({error:"Unable to create invitation"},{status:500});
 }
}
export async function DELETE(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid origin"},{status:403});
 const user=await adminSession();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:403});
 const body=await request.json().catch(()=>({}));
 const id=String(body.id??"");
 if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"Invalid invitation"},{status:400});
 const {error}=await adminClient().from("direct_roster_invites").update({revoked_at:new Date().toISOString()}).eq("id",id).is("redeemed_at",null);
 if(error)return NextResponse.json({error:"Unable to revoke invitation"},{status:500});
 return NextResponse.json({success:true});
}
