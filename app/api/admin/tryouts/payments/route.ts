import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

async function authorized() {
  const client = await createServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;
  const { data: profile } = await client.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["OWNER", "ADMIN"].includes(profile.role)) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return null;
  return { user, admin: createAdminClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } }) };
}

export async function GET() {
  const auth = await authorized();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { data, error } = await auth.admin.from("tryout_payments").select("registration_id,status,payment_note,verified_at,updated_at");
  if (error) {
    console.error("Tryout payments database query failed", { code: error.code, message: error.message, details: error.details });
    const code = error.code ?? "UNKNOWN";
    const message = code === "42P01" || code === "PGRST205"
      ? "Payment table not found in the connected Supabase project"
      : code === "42501"
        ? "Payment tracker database permission denied"
        : "Payment tracker database request failed";
    return NextResponse.json({ error: `${message} (code: ${code})` }, { status: 503 });
  }
  return NextResponse.json({ payments: data });
}

export async function PATCH(request: Request) {
  const auth = await authorized();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await request.json().catch(() => null);
  const id = body?.registration_id;
  const status = body?.status;
  const note = body?.payment_note;
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id) || !["UNPAID","PENDING","PAID"].includes(status) || typeof note !== "string" || note.length > 500)
    return NextResponse.json({ error: "Invalid payment update" }, { status: 400 });
  const { data: registration } = await auth.admin.from("tryout_submissions").select("id").eq("id", id).maybeSingle();
  if (!registration) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  const { error } = await auth.admin.from("tryout_payments").upsert({
    registration_id: id, status, amount_cents: 2000, payment_note: note,
    verified_at: status === "PAID" ? new Date().toISOString() : null,
    verified_by: status === "PAID" ? auth.user.id : null,
    updated_at: new Date().toISOString()
  }, { onConflict: "registration_id" });
  if (error) return NextResponse.json({ error: "Unable to save payment" }, { status: 500 });
  return NextResponse.json({ success: true });
}
