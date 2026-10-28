import { summarizeAccount } from "../finance/money.mjs";
export function registrationReport(
  registrations,
  tryoutPayments,
  accounts,
  transactions,
  attempts,
  orders,
) {
  const paymentMap = new Map(tryoutPayments.map((p) => [p.registration_id, p]));
  const rows = registrations.map((r) => {
    const payment = paymentMap.get(r.id);
    const tryout = {
      status: payment?.status || "UNPAID",
      source: payment?.source || "MANUAL",
      payment_note: payment?.payment_note || "",
      paid_cents:
        payment?.verified_at ||
        ["PAID", "REFUNDED", "PARTIALLY_REFUNDED"].includes(payment?.status)
          ? (payment?.amount_cents || 2000) - (payment?.refunded_cents || 0)
          : 0,
      refunded_cents: payment?.refunded_cents || 0,
      session_id: payment?.stripe_session_id || null,
      payment_intent_id: payment?.stripe_payment_intent_id || null,
    };
    const team = accounts
      .filter((a) => a.registration_id === r.id)
      .map((a) => summarizeAccount(a, transactions, ""));
    const payments = orders
      .filter((o) => o.registration_id === r.id)
      .flatMap((o) =>
        attempts
          .filter((a) => a.order_id === o.id)
          .map((a) => ({
            ...a,
            purpose: o.purpose,
            amount_cents: o.amount_cents,
          })),
      );
    return { ...r, tryout, team, payments };
  });
  return {
    registrations: rows,
    totals: {
      tryout_net_cents: rows.reduce((s, r) => s + r.tryout.paid_cents, 0),
      team_net_cents: accounts.reduce(
        (s, a) => s + summarizeAccount(a, transactions, "").paid_cents,
        0,
      ),
      tryout_paid: rows.filter((r) => r.tryout.status === "PAID").length,
    },
  };
}
