import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sameOrigin } from "@/lib/admin/api";
import { selfCheckinWindow } from "@/lib/self-checkin.mjs";
import { validBirthDate } from "@/lib/tryout-validation.mjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {"Cache-Control":"private, no-store"};
export function GET() {
  return NextResponse.json({...selfCheckinWindow(),serverTime:new Date().toISOString()}, {headers});
}
export async function POST(request: Request) {
  const reply = (body:unknown,status=200) => NextResponse.json(body,{status,headers});
  if (!sameOrigin(request)) return reply({error:"Request origin rejected."},403);
  if (!selfCheckinWindow().open) return reply({error:"Self check-in is open Sunday, November 22, 2:30–4:30 PM Eastern only."},403);
  if (!request.headers.get("content-type")?.startsWith("application/json") || Number(request.headers.get("content-length")||0)>2048)
    return reply({error:"Invalid check-in request."},400);
  const text = await request.text();
  if(text.length>2048) return reply({error:"Invalid check-in request."},400);
  let body;
  try {body=JSON.parse(text);} catch {return reply({error:"Invalid check-in request."},400);}
  const id = typeof body?.tryoutId==="string" ? body.tryoutId.trim().toUpperCase() : "";
  const email = typeof body?.parentEmail==="string" ? body.parentEmail.trim().toLowerCase() : "";
  const dob = typeof body?.dateOfBirth==="string" ? body.dateOfBirth : "";
  if (!/^[A-Z0-9-]{3,40}$/.test(id) || email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || !validBirthDate(dob,"2026-11-22") || body.arrived!==true)
    return reply({error:"Enter your Tryout ID, registration parent email and athlete DOB, and confirm you have arrived."},400);
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;
  if(!url||!secret) return reply({error:"Check-in is temporarily unavailable. Please see the check-in desk."},503);
  try {
    const ip=(request.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim();
    const key=createHmac("sha256",secret).update("self-checkin-nov22:"+ip).digest("hex");
    const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data,error}=await db.rpc("self_checkin_high_school_tryout",{p_tryout_id:id,p_parent_email:email,p_date_of_birth:dob,p_attempt_key:key});
    if(error) throw new Error("Check-in unavailable");
    if(data?.code==="closed") return reply({error:"Self check-in is closed. Please see staff."},403);
    if(data?.code==="rate_limited") return reply({error:"Too many attempts. Please wait five minutes or visit the check-in desk."},429);
    if(!["checked_in","already_checked_in"].includes(data?.code))
      return reply({error:"We could not match an eligible preregistration. Check your details or see staff. Do not register again."},400);
    return reply({success:true,alreadyCheckedIn:data.code==="already_checked_in",tryoutId:data.tryout_id,
      message:"You’re checked in! Please see the check-in desk for your sticker number and any payment verification. Check-in does not confirm payment or a roster spot."});
  } catch {
    return reply({error:"Unable to confirm check-in. Please retry or see staff."},503);
  }
}
