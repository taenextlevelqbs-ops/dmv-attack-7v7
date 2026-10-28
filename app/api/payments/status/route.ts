import { privateHeaders } from "@/lib/admin/api";
import { paymentAccess, uuid } from "@/lib/payments/server";
export async function GET(request: Request) {
  const url = new URL(request.url),
    id = url.searchParams.get("registration"),
    purpose = url.searchParams.get("purpose") || "TRYOUT";
  if (!uuid(id) || !["TRYOUT", "TEAM"].includes(purpose))
    return Response.json(
      { error: "Invalid payment request" },
      { status: 400, headers: privateHeaders },
    );
  try {
    const access = await paymentAccess(id, purpose as "TRYOUT" | "TEAM");
    if (!access)
      return Response.json(
        {
          error:
            "Sign in with the registration parent email to view payment status.",
        },
        { status: 403, headers: privateHeaders },
      );
    const { data: manual, error } = await access.db
      .from("tryout_payments")
      .select("status,source")
      .eq("registration_id", id)
      .maybeSingle();
    if (error) throw error;
    // Status is database/webhook-confirmed; query-string session IDs are never trusted.
    const status =
      purpose === "TRYOUT" && manual?.status === "PAID"
        ? "PAID"
        : access.order?.status || "UNPAID";
    return Response.json(
      {
        status,
        tryout_id: access.registration.tryout_id,
        amount_cents: purpose === "TRYOUT" ? 2000 : 75000,
      },
      { headers: privateHeaders },
    );
  } catch {
    return Response.json(
      {
        error:
          "Unable to load payment confirmation. Contact DMV Attack before paying again.",
      },
      { status: 503, headers: privateHeaders },
    );
  }
}
