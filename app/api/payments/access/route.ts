import { sameOrigin, privateHeaders } from "@/lib/admin/api";
import { createClient } from "@/lib/supabase/server";
import { paymentOrigin } from "@/lib/payments/server";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json(
      { error: "Request origin rejected" },
      { status: 403, headers: privateHeaders },
    );
  const body = await request.json().catch(() => null);
  if (
    typeof body?.email !== "string" ||
    body.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
  )
    return Response.json(
      { error: "Enter a valid email address" },
      { status: 400, headers: privateHeaders },
    );
  try {
    const client = await createClient();
    await client.auth.signInWithOtp({
      email: body.email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${paymentOrigin()}/auth/callback?next=/portal/payments`,
      },
    });
    // Uniform response: never reveal whether a parent account exists.
    return Response.json(
      {
        message:
          "If your parent account is active, a sign-in link will arrive by email. Otherwise ask staff to activate the email on your registration.",
      },
      { headers: privateHeaders },
    );
  } catch {
    return Response.json(
      { error: "Sign-in is unavailable. Please try again later." },
      { status: 503, headers: privateHeaders },
    );
  }
}
