import { sameOrigin, privateHeaders } from "@/lib/admin/api";
import {
  checkoutOrder,
  enabled,
  paymentAccess,
  uuid,
} from "@/lib/payments/server";
import { summarizeAccount } from "@/lib/finance/money.mjs";
import { allRows } from "@/lib/admin/pagination";
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: privateHeaders });
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return reply({ error: "Request origin rejected" }, 403);
  const body = await request.json().catch(() => null);
  if (
    !uuid(body?.registration_id) ||
    !["TRYOUT", "TEAM"].includes(body?.purpose)
  )
    return reply({ error: "Invalid payment request" }, 400);
  try {
    const access = await paymentAccess(body.registration_id, body.purpose);
    if (!access)
      return reply(
        {
          error:
            "Sign in with the registration parent email to access this payment.",
        },
        403,
      );
    if (!enabled())
      return reply(
        { error: "Online registration payments are not enabled yet." },
        503,
      );
    let order = access.order;
    if (body.purpose === "TEAM") {
      if (!access.userId || access.registration.status !== "ACCEPTED")
        return reply(
          { error: "Only officially accepted athletes may pay the team fee." },
          403,
        );
      const { data: accounts, error } = await access.db
        .from("team_fee_accounts")
        .select("*")
        .eq("registration_id", body.registration_id);
      if (error) throw error;
      const eligible = [];
      for (const account of accounts || []) {
        const { data: assignment, error: offerError } = await access.db
          .from("roster_assignments")
          .select("id")
          .eq("tryout_submission_id", body.registration_id)
          .eq("team_id", account.team_id)
          .in("roster_status", ["ACCEPTED", "ACTIVE"])
          .maybeSingle();
        if (offerError) throw offerError;
        if (assignment) eligible.push(account);
      }
      if (eligible.length !== 1)
        return reply(
          { error: "Staff must confirm the accepted team and fee account." },
          409,
        );
      const account = eligible[0];
      const tx = await allRows((start, end) =>
        access.db
          .from("team_fee_transactions")
          .select("*")
          .eq("account_id", account.id)
          .order("id")
          .range(start, end),
      );
      if (tx.error) throw tx.error;
      if (
        !order?.paid_at &&
        (account.fee_cents !== 75000 ||
          account.discount_cents !== 0 ||
          summarizeAccount(account, tx.data || [], "").balance_cents !== 75000)
      )
        return reply(
          {
            error:
              "This account has an adjustment or existing payment. Contact staff for the correct remaining balance.",
          },
          409,
        );
      if (!order) {
        const result = await access.db
          .from("registration_payment_orders")
          .upsert(
            {
              registration_id: body.registration_id,
              purpose: "TEAM",
              amount_cents: 75000,
              team_account_id: account.id,
            },
            { onConflict: "registration_id,purpose", ignoreDuplicates: true },
          );
        if (result.error) throw result.error;
        const resultOrder = await access.db
          .from("registration_payment_orders")
          .select("*")
          .eq("registration_id", body.registration_id)
          .eq("purpose", "TEAM")
          .single();
        if (resultOrder.error) throw resultOrder.error;
        order = resultOrder.data;
      }
      if (order.team_account_id !== account.id)
        return reply(
          { error: "Team assignment changed. Staff review required." },
          409,
        );
    }
    if (!order && body.purpose === "TRYOUT" && access.userId) {
      const { error: createError } = await access.db
        .from("registration_payment_orders")
        .upsert(
          {
            registration_id: body.registration_id,
            purpose: "TRYOUT",
            amount_cents: 2000,
          },
          { onConflict: "registration_id,purpose", ignoreDuplicates: true },
        );
      if (createError) throw createError;
      const result = await access.db
        .from("registration_payment_orders")
        .select("*")
        .eq("registration_id", body.registration_id)
        .eq("purpose", "TRYOUT")
        .single();
      if (result.error) throw result.error;
      order = result.data;
    }
    if (!order)
      return reply(
        { error: "Payment record unavailable. Contact DMV Attack." },
        404,
      );
    const url = await checkoutOrder(order.id, access.userId);
    return reply({ url });
  } catch (error) {
    console.error("Registration checkout unavailable", {
      type: error instanceof Error ? error.name : "Unknown",
    });
    return reply(
      {
        error:
          "Checkout is unavailable or payment is already recorded. Your registration is saved. Refresh payment status, or contact DMV Attack before trying another payment.",
      },
      503,
    );
  }
}
