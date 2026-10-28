import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next");
  const next = requestedNext && ["/portal/payments", "/portal", "/set-password", "/admin/tryouts"].includes(requestedNext) ? requestedNext : "/admin/tryouts";

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(
        new URL(next, requestUrl.origin)
      );
    }

    console.error("Supabase callback error:", error);
  }

  return NextResponse.redirect(
    new URL("/login?error=auth", requestUrl.origin)
  );
}
