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
  if (!profile || !["OWNER", "ADMIN", "CHECKIN"].includes(profile.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  const body = await request.json().catch(() => null);
  const id = body?.registration_id;
  const number = body?.bib_number;
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id) || !(number === null || (Number.isInteger(number) && number >= 1 && number <= 9999))) {
    return NextResponse.json({ error: "Enter a sticker number between 1 and 9999" }, { status: 400 });
  }
  const admin = createAdminClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await admin.from("tryout_submissions").update({ bib_number: number, updated_at: new Date().toISOString() }).eq("id", id).select("id,bib_number").maybeSingle();
  if (error?.code === "23505") return NextResponse.json({ error: "That sticker number is already assigned to another athlete in this age group." }, { status: 409 });
  if (error) return NextResponse.json({ error: "Unable to save sticker number" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  return NextResponse.json({ success: true, registration: data });
}
