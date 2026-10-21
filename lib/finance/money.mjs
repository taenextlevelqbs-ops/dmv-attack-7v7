export function moneyToCents(value) {
  if (
    typeof value !== "string" ||
    !/^\d{1,7}(?:\.\d{1,2})?$/.test(value.trim())
  )
    throw new Error(
      "Enter a dollar amount with no more than two decimal places.",
    );
  const [d, c = ""] = value.trim().split(".");
  const cents = Number(d) * 100 + Number(c.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents > 100000000)
    throw new Error("Amount is too large.");
  return cents;
}
export function summarizeAccount(charge, entries, today) {
  const paid = entries
    .filter((e) => e.account_id === charge.id)
    .reduce(
      (sum, e) =>
        sum + (e.kind === "PAYMENT" ? e.amount_cents : -e.amount_cents),
      0,
    );
  const due = charge.fee_cents - charge.discount_cents;
  return {
    ...charge,
    net_fee_cents: due,
    paid_cents: paid,
    balance_cents: Math.max(0, due - paid),
    credit_cents: Math.max(0, paid - due),
    status:
      paid >= due
        ? "PAID"
        : charge.due_date && charge.due_date < today
          ? "OVERDUE"
          : paid > 0
            ? "PARTIAL"
            : "UNPAID",
  };
}
export function formatMoney(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
