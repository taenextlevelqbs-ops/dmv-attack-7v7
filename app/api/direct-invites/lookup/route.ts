import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime="nodejs";
export async function POST(request:Request){
 try{
 const {token}=await request.json();
 if(typeof token!=="string" || !/^[A-Za-z0-9_-]{40,60}$/.test(token))return NextResponse.json({error:"Invalid or expired invitation"},{status:404});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;
 if(!url||!secret)return NextResponse.json({error:"Unavailable"},{status:503});
 const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const hash=createHash("sha256").update(token).digest("hex");
 const {data,error}=await admin.from("direct_roster_invites").select("age_group,intended_athlete,expires_at,redeemed_at,revoked_at").eq("token_hash",hash).maybeSingle();
 if(error||!data||data.redeemed_at||data.revoked_at||Date.parse(data.expires_at)<=Date.now())return NextResponse.json({error:"Invitation is no longer available"},{status:404});
 return NextResponse.json({age_group:data.age_group,intended_athlete:data.intended_athlete},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Unable to load invitation"},{status:500});}
}
