import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const url = new URL(request.url),
    token = url.searchParams.get("token_hash"),
    type = url.searchParams.get("type"),
    requested = url.searchParams.get("next");
  const next =
    requested && ["/portal/payments", "/set-password"].includes(requested)
      ? requested
      : "/portal/payments";
  if (token && ["invite", "magiclink", "recovery"].includes(type || "")) {
    const client = await createClient();
    const { error } = await client.auth.verifyOtp({
      token_hash: token,
      type: type as "invite" | "magiclink" | "recovery",
    });
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(
    new URL("/login?error=expired-link", url.origin),
  );
}
