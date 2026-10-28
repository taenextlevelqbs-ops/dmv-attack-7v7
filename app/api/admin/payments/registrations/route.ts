import { ownerApi, privateHeaders } from "@/lib/admin/api";
import { allRows } from "@/lib/admin/pagination";
import { registrationReport } from "@/lib/payments/report.mjs";
export async function GET() {
  try {
    const auth = await ownerApi();
    if (!auth)
      return Response.json(
        { error: "Owner access required" },
        { status: 403, headers: privateHeaders },
      );
    const specs = [
      [
        "tryout_submissions",
        "id,tryout_id,athlete_first_name,athlete_last_name,age_group,parent_guardian_name,parent_email,parent_phone,submitted_at,status",
      ],
      ["tryout_payments", "*"],
      ["team_fee_accounts", "*"],
      ["team_fee_transactions", "*"],
      [
        "registration_payment_attempts",
        "id,order_id,session_id,payment_intent_id,customer_id,status,paid,refunded_cents,paid_at,created_at",
      ],
      [
        "registration_payment_orders",
        "id,registration_id,purpose,amount_cents,status",
      ],
    ];
    const results = await Promise.all(
      specs.map(([table, fields]) =>
        allRows((start, end) =>
          auth.admin
            .from(table)
            .select(fields)
            .order(table === "tryout_payments" ? "registration_id" : "id")
            .range(start, end),
        ),
      ),
    );
    if (results.some((r) => r.error))
      return Response.json(
        {
          error:
            "Payment reporting requires the registration Stripe migration. Existing ledgers remain available.",
        },
        { status: 503, headers: privateHeaders },
      );
    return Response.json(
      registrationReport(
        ...(results.map((r) => r.data || []) as [
          unknown[],
          unknown[],
          unknown[],
          unknown[],
          unknown[],
          unknown[],
        ]),
      ),
      { headers: privateHeaders },
    );
  } catch {
    return Response.json(
      { error: "Unable to load payment report" },
      { status: 503, headers: privateHeaders },
    );
  }
}
