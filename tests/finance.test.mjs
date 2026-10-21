import test from "node:test";
import assert from "node:assert/strict";
import { moneyToCents, summarizeAccount } from "../lib/finance/money.mjs";
test("money parsing uses exact cents and rejects ambiguous/negative input", () => {
  assert.equal(moneyToCents("250.01"), 25001);
  for (const bad of ["-1", "1.001", "1e3", "NaN", "", "$25", "25 dollars"])
    assert.throws(() => moneyToCents(bad));
});
test("deposits, installments, scholarships, refunds and credits reconcile", () => {
  const a = {
    id: "a",
    fee_cents: 100000,
    discount_cents: 10000,
    due_date: "2027-01-01",
  };
  let entries = [
    { account_id: "a", kind: "PAYMENT", amount_cents: 25000 },
    { account_id: "other", kind: "PAYMENT", amount_cents: 99999 },
  ];
  assert.equal(summarizeAccount(a, entries, "2026-12-01").balance_cents, 65000);
  assert.equal(summarizeAccount(a, entries, "2027-01-02").status, "OVERDUE");
  entries.push({ account_id: "a", kind: "PAYMENT", amount_cents: 70000 });
  assert.equal(summarizeAccount(a, entries, "2026-12-01").credit_cents, 5000);
  entries.push({ account_id: "a", kind: "REFUND", amount_cents: 5000 });
  assert.equal(summarizeAccount(a, entries, "2026-12-01").balance_cents, 0);
  assert.equal(summarizeAccount(a, entries, "2026-12-01").paid_cents, 90000);
});
