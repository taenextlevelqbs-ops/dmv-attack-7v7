import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const source = new URL(origin),
      target = new URL(request.url);
    return (
      source.origin === origin &&
      source.host === (request.headers.get("host") || target.host) &&
      source.protocol === target.protocol
    );
  } catch {
    return false;
  }
}
export async function ownerApi() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;
  const { data: profile } = await client
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "OWNER") return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("Server configuration incomplete");
  return {
    user,
    admin: createAdmin(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  };
}
export const privateHeaders = { "Cache-Control": "private, no-store" };
