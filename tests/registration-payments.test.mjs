import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import {
  validatePrice,
  synchronizeRegistration,
  dispatchStripeEvent,
} from "../lib/payments/core.mjs";
import { registrationReport } from "../lib/payments/report.mjs";

test("configured prices must be active one-time exact USD amounts in the correct mode", () => {
  const price = {
    active: true,
    unit_amount: 2000,
    currency: "usd",
    type: "one_time",
    livemode: false,
    product: { active: true },
  };
  validatePrice(price, "TRYOUT", false);
  validatePrice({ ...price, unit_amount: 75000 }, "TEAM", false);
  for (const changes of [
    { active: false },
    { unit_amount: 1 },
    { currency: "eur" },
    { type: "recurring" },
    { livemode: true },
    { product: { active: false } },
  ])
    assert.throws(() =>
      validatePrice({ ...price, ...changes }, "TRYOUT", false),
    );
  assert.throws(() => validatePrice(price, "TEAM", false));
});
function fixture() {
  const order = {
    id: "order",
    registration_id: "registration",
    purpose: "TRYOUT",
    amount_cents: 2000,
  };
  const attempt = {
    id: "attempt",
    order_id: "order",
    session_id: "cs_fixture",
  };
  const session = {
    id: "cs_fixture",
    mode: "payment",
    currency: "usd",
    amount_total: 2000,
    client_reference_id: "registration",
    metadata: {
      registration_attempt_id: "attempt",
      registration_order_id: "order",
      payment_purpose: "TRYOUT",
    },
    livemode: false,
    payment_intent: "pi_fixture",
    payment_status: "paid",
    status: "complete",
    customer: "cus_fixture",
  };
  const intent = {
    currency: "usd",
    amount: 2000,
    amount_received: 2000,
    status: "succeeded",
    created: 100,
    latest_charge: { created: 200, disputed: false },
  };
  const calls = [];
  const db = {
    from: (table) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: table === "registration_payment_orders" ? order : attempt,
          }),
        }),
      }),
    }),
    rpc: async (name, args) => {
      calls.push({ name, args });
      return {};
    },
  };
  const stripe = {
    checkout: { sessions: { retrieve: async () => session } },
    paymentIntents: { retrieve: async () => intent },
    refunds: { list: async function* () {} },
  };
  return { order, attempt, session, intent, calls, db, stripe };
}
test("paid reconciliation checks registration, mode, exact amount and actual intent settlement", async () => {
  const f = fixture();
  await synchronizeRegistration(f.stripe, f.db, "cs_fixture", false);
  assert.equal(f.calls[0].args.p_paid, true);
  assert.equal(f.calls[0].args.p_paid_at, new Date(200000).toISOString());
  for (const [key, value] of [
    ["amount_total", 75000],
    ["currency", "eur"],
    ["mode", "subscription"],
    ["livemode", true],
    ["client_reference_id", "someone-else"],
  ]) {
    const old = f.session[key];
    f.session[key] = value;
    await assert.rejects(
      synchronizeRegistration(f.stripe, f.db, "cs_fixture", false),
      /verification/,
    );
    f.session[key] = old;
  }
  for (const [key, value] of [
    ["amount_received", 0],
    ["status", "processing"],
    ["currency", "eur"],
  ]) {
    const old = f.intent[key];
    f.intent[key] = value;
    await assert.rejects(
      synchronizeRegistration(f.stripe, f.db, "cs_fixture", false),
      /verification/,
    );
    f.intent[key] = old;
  }
  f.session.metadata.registration_order_id = "wrong";
  await assert.rejects(
    synchronizeRegistration(f.stripe, f.db, "cs_fixture", false),
    /verification/,
  );
});
test("failed card can retry same open checkout; canceled/expired and delayed failure are distinct", async () => {
  const f = fixture();
  f.session.payment_status = "unpaid";
  f.intent.status = "requires_payment_method";
  f.intent.amount_received = 0;
  f.session.status = "open";
  await synchronizeRegistration(f.stripe, f.db, "cs_fixture", false);
  assert.equal(f.calls.at(-1).args.p_status, "OPEN");
  f.session.status = "complete";
  await synchronizeRegistration(f.stripe, f.db, "cs_fixture", false);
  assert.equal(f.calls.at(-1).args.p_status, "FAILED");
  f.session.status = "expired";
  f.session.payment_intent = null;
  await synchronizeRegistration(f.stripe, f.db, "cs_fixture", false);
  assert.equal(f.calls.at(-1).args.p_status, "EXPIRED");
  assert.equal(f.calls.at(-1).args.p_paid, false);
});
test("refunds include only successful amounts and failed ledger writes cause a webhook retry", async () => {
  const f = fixture();
  f.stripe.refunds.list = async function* () {
    yield { status: "succeeded", amount: 500 };
    yield { status: "pending", amount: 100 };
    yield { status: "failed", amount: 100 };
  };
  await synchronizeRegistration(f.stripe, f.db, "cs_fixture", false);
  assert.equal(f.calls[0].args.p_refunded_cents, 500);
  f.db.rpc = async () => ({ error: { code: "503" } });
  await assert.rejects(
    synchronizeRegistration(f.stripe, f.db, "cs_fixture", false),
    /ledger write/,
  );
});
test("all required event families route to current session reconciliation", async () => {
  const events = [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
    "payment_intent.payment_failed",
    "charge.refunded",
  ];
  for (const type of events) {
    const calls = [];
    const stripe = {
      checkout: {
        sessions: {
          list: async function* () {
            yield { id: "cs_related" };
          },
        },
      },
    };
    await dispatchStripeEvent(
      stripe,
      {
        type,
        data: {
          object: {
            id:
              type === "payment_intent.payment_failed"
                ? "pi_x"
                : "cs_or_charge",
            payment_intent: "pi_x",
          },
        },
      },
      async (id) => calls.push(id),
    );
    assert.equal(calls.length, 1, type);
  }
});
test("admin totals count each payment once, subtract refunds and preserve manual Venmo history", () => {
  const rows = [{ id: "a" }, { id: "b" }];
  const manual = [
    {
      registration_id: "a",
      status: "PAID",
      amount_cents: 2000,
      payment_note: "Venmo legacy",
    },
    {
      registration_id: "b",
      status: "PARTIALLY_REFUNDED",
      amount_cents: 2000,
      refunded_cents: 500,
      source: "STRIPE",
    },
  ];
  const accounts = [
    { id: "acct", registration_id: "a", fee_cents: 75000, discount_cents: 0 },
  ];
  const transactions = [
    { account_id: "acct", kind: "PAYMENT", amount_cents: 75000 },
    { account_id: "acct", kind: "REFUND", amount_cents: 5000 },
  ];
  const report = registrationReport(
    rows,
    manual,
    accounts,
    transactions,
    [
      { order_id: "order", paid: true },
      { order_id: "order", paid: false },
    ],
    [{ id: "order", registration_id: "a", purpose: "TEAM" }],
  );
  assert.equal(report.totals.tryout_net_cents, 3500);
  assert.equal(report.totals.team_net_cents, 70000);
  assert.equal(report.registrations[0].tryout.payment_note, "Venmo legacy");
});

test("database migration: RLS, retry reservation, siblings, acceptance, duplicate events and monotonic refunds", async () => {
  const db = new PGlite();
  try {
    const owner = randomUUID(),
      reg = randomUUID(),
      sibling = randomUUID(),
      legacy = randomUUID(),
      team = randomUUID(),
      account = randomUUID();
    await db.exec(
      `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create table tryout_submissions(id uuid primary key,status text);create table teams(id uuid primary key);create table roster_assignments(id uuid primary key default gen_random_uuid(),tryout_submission_id uuid,team_id uuid,roster_status text);insert into auth.users values('${owner}');insert into teams values('${team}');insert into tryout_submissions values('${reg}','REGISTERED'),('${sibling}','REGISTERED'),('${legacy}','REGISTERED');`,
    );
    for (const file of [
      "20261014_tryout_payments.sql",
      "20261021_team_fee_ledger.sql",
      "20261021_stripe_checkout.sql",
      "20261028_registration_stripe.sql",
    ])
      await db.exec(fs.readFileSync("supabase/migrations/" + file, "utf8"));
    // Existing verified Venmo payment must survive migration and Stripe synchronization.
    await db.query(
      "insert into tryout_payments(registration_id,status,payment_note,verified_at)values($1,'PAID','Legacy Venmo reference',now())",
      [legacy],
    );
    const order = randomUUID(),
      siblingOrder = randomUUID(),
      legacyOrder = randomUUID(),
      teamOrder = randomUUID();
    for (const [id, registration] of [
      [order, reg],
      [siblingOrder, sibling],
      [legacyOrder, legacy],
    ])
      await db.query(
        "insert into registration_payment_orders(id,registration_id,purpose,amount_cents)values($1,$2,'TRYOUT',2000)",
        [id, registration],
      );
    for (const role of ["anon", "authenticated"]) {
      await db.exec("set role " + role);
      for (const table of [
        "tryout_payments",
        "registration_payment_orders",
        "registration_payment_attempts",
        "stripe_webhook_events",
      ])
        await assert.rejects(
          db.query("select * from " + table),
          /permission denied/,
        );
      await assert.rejects(
        db.query("select reserve_registration_checkout($1,null)", [order]),
        /permission denied/,
      );
      await db.exec("reset role");
    }
    const reserve = async (o) =>
      (
        await db.query("select (reserve_registration_checkout($1,$2)).*", [
          o,
          owner,
        ])
      ).rows[0];
    const first = await reserve(order),
      repeat = await reserve(order);
    assert.equal(first.id, repeat.id);
    const other = await reserve(siblingOrder);
    assert.notEqual(first.id, other.id);
    await assert.rejects(reserve(legacyOrder), /Already paid/);
    const sync = (id, paid, refund, status = "PAID", session = "cs_" + id) =>
      db.query(
        "select sync_registration_checkout($1,$2,$3,'cus_fixture',$4,$5,$6,now())",
        [id, session, "pi_" + id, paid, refund, status],
      );
    await sync(first.id, false, 0, "EXPIRED");
    const retry = await reserve(order);
    assert.notEqual(first.id, retry.id);
    await sync(retry.id, true, 0);
    await sync(retry.id, true, 0);
    assert.equal((await db.query("select set_manual_tryout_payment($1,'PAID','Not a Stripe proof',$2) as changed",[reg,owner])).rows[0].changed,false);

    await sync(first.id, false, 0, "EXPIRED");
    assert.equal(
      (
        await db.query(
          "select status from registration_payment_orders where id=$1",
          [order],
        )
      ).rows[0].status,
      "PAID",
    );
    await sync(retry.id, true, 500);
    await sync(retry.id, true, 300);
    assert.equal(
      (
        await db.query(
          "select refunded_cents from tryout_payments where registration_id=$1",
          [reg],
        )
      ).rows[0].refunded_cents,
      500,
    );
    await sync(retry.id, true, 2000);
    await sync(retry.id, true, 2000);
    assert.equal(
      (
        await db.query(
          "select status from tryout_payments where registration_id=$1",
          [reg],
        )
      ).rows[0].status,
      "REFUNDED",
    );
    await assert.rejects(reserve(order), /Already paid/);
    await assert.rejects(sync(retry.id, true, 2001), /Invalid state/);
    await assert.rejects(
      sync(retry.id, true, 0, "PAID", "cs_wrong"),
      /Session mismatch/,
    );
    assert.equal(
      (
        await db.query(
          "select payment_note,status from tryout_payments where registration_id=$1",
          [legacy],
        )
      ).rows[0].payment_note,
      "Legacy Venmo reference",
    );
    await db.query(
      "insert into team_fee_accounts(id,registration_id,team_id,season,fee_cents,created_by)values($1,$2,$3,'2027',75000,$4)",
      [account, reg, team, owner],
    );
    await db.query(
      "insert into registration_payment_orders(id,registration_id,purpose,amount_cents,team_account_id)values($1,$2,'TEAM',75000,$3)",
      [teamOrder, reg, account],
    );
    await assert.rejects(reserve(teamOrder), /not accepted/);
    await db.query(
      "insert into roster_assignments(tryout_submission_id,team_id,roster_status)values($1,$2,'ACCEPTED')",
      [reg, team],
    );
    await db.query(
      "update tryout_submissions set status='ACCEPTED' where id=$1",
      [reg],
    );
    const teamAttempt = await reserve(teamOrder);
    await sync(teamAttempt.id, true, 0);
    await sync(teamAttempt.id, true, 0);
    await sync(teamAttempt.id, true, 10000);
    await sync(teamAttempt.id, true, 5000);
    const result = (
      await db.query(
        "select sum(case when kind='PAYMENT' then amount_cents else -amount_cents end)::int net,count(*)::int n from team_fee_transactions where account_id=$1",
        [account],
      )
    ).rows[0];
    assert.equal(result.net, 65000);
    assert.equal(result.n, 2);
  } finally {
    await db.close();
  }
});

test("family authorization requires verified identity and exact email or existing family membership", async () => {
  const { canAccessRegistration } = await import(
    "../lib/payments/authorization.mjs"
  );
  const r = {
    parent_email: "parent@example.com",
    linked_family_id: "family-a",
  };
  const u = {
    id: "parent-a",
    email: "parent@example.com",
    email_confirmed_at: "2026-01-01",
  };
  assert.equal(canAccessRegistration(u, r, []), true);
  assert.equal(
    canAccessRegistration({ ...u, email_confirmed_at: null }, r, []),
    false,
  );
  assert.equal(
    canAccessRegistration({ ...u, email: "other@example.com" }, r, []),
    false,
  );
  assert.equal(
    canAccessRegistration({ ...u, email: "%@example.com" }, r, []),
    false,
  );
  assert.equal(
    canAccessRegistration({ ...u, email: "guardian@example.com" }, r, [
      { profile_id: "parent-a", family_id: "family-a" },
    ]),
    true,
  );
  assert.equal(
    canAccessRegistration({ ...u, email: "guardian@example.com" }, r, [
      { profile_id: "other", family_id: "family-a" },
    ]),
    false,
  );
  assert.equal(
    canAccessRegistration({ ...u, email: "guardian@example.com" }, r, [
      { profile_id: "parent-a", family_id: "other" },
    ]),
    false,
  );
});
test("Checkout parameters use trusted price, saved parent, registration metadata and recoverable return URLs", async () => {
  const { checkoutParameters } = await import("../lib/payments/core.mjs");
  const order = {
    id: "order",
    registration_id: "registration",
    purpose: "TRYOUT",
  };
  const attempt = { id: "attempt", created_at: "2026-01-01T00:00:00Z" };
  const params = checkoutParameters(
    order,
    attempt,
    "saved-parent@example.com",
    "price_configured",
    "https://dmvattack.com",
  );
  assert.deepEqual(params.line_items, [
    { price: "price_configured", quantity: 1 },
  ]);
  assert.equal(params.customer_email, "saved-parent@example.com");
  assert.equal(
    params.payment_intent_data.receipt_email,
    "saved-parent@example.com",
  );
  assert.equal(params.metadata.registration_attempt_id, "attempt");
  assert.equal(params.client_reference_id, "registration");
  assert.equal(
    params.success_url,
    "https://dmvattack.com/tryouts/payment?registration=registration&session_id={CHECKOUT_SESSION_ID}",
  );
  assert.match(params.cancel_url, /canceled=1/);
  assert.equal(
    checkoutParameters(
      { ...order, purpose: "TEAM" },
      attempt,
      "parent@example.com",
      "price_team",
      "https://dmvattack.com",
    ).success_url.includes("/portal/payments"),
    true,
  );
});
