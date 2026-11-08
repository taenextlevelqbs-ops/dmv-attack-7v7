import { sameOrigin } from "@/lib/admin/api";
import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request origin rejected" }, { status: 403 });
  const client = await createServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await client.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["OWNER","ADMIN"].includes(profile.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => null);
  const id = body?.registration_id;
  const method = body?.payment_method;
  const status = body?.status;
  const note = typeof body?.payment_note === "string" ? body.payment_note.trim() : "";
  const confirmed = body?.confirmed === true;
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)
    || !["VENMO","STRIPE"].includes(method)
    || !["PAID","PENDING"].includes(status)
    || note.length > 500 || (status === "PAID" && (!confirmed || !note))) {
    return NextResponse.json({error:"Select Venmo or Stripe. Mark paid only after verifying the transaction and entering its reference."},{status:400});
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if(!url || !secret) return NextResponse.json({error:"Server configuration error"},{status:500});
  const admin=createAdminClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:registration,error:registrationError}=await admin.from("tryout_submissions").select("id").eq("id",id).maybeSingle();
  if(registrationError||!registration) return NextResponse.json({error:"Registration not found"},{status:404});
  const { data: current, error: existingError } = await admin.from("tryout_payments").select("status,payment_method,payment_note").eq("registration_id",id).maybeSingle();
  if (existingError) return NextResponse.json({ error: "Unable to load existing payment" }, { status: 500 });
  // Never silently downgrade an already verified payment from a parent claim.
  if (current?.status === "PAID" && status === "PENDING")
    return NextResponse.json({error:"Payment is already verified. Do not overwrite it with an unconfirmed claim."},{status:409});
  const now = new Date().toISOString();
  const {data,error}=await admin.from("tryout_payments").upsert({
    registration_id:id,status,amount_cents:2000,payment_method:method,payment_note:note,
    verified_at:status==="PAID"?now:null,
    verified_by:status==="PAID"?user.id:null,updated_at:now
  },{onConflict:"registration_id"}).select("registration_id,status,payment_method,payment_note,verified_at,updated_at").single();
  if(error) return NextResponse.json({error:"Unable to save payment confirmation"},{status:500});
  return NextResponse.json({success:true,payment:data});
}
