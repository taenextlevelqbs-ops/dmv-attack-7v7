import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { PGlite } from "@electric-sql/pglite";
import { syncCheckoutState } from "../lib/finance/stripe-sync.mjs";
import { isLiveStripeKey } from "../lib/finance/stripe-key.mjs";

test("restricted live keys work while test and publishable keys stay outside live mode", () => {
  for (const key of ["rk_live_fixture", "sk_live_fixture"]) assert.equal(isLiveStripeKey(key), true);
  for (const key of [undefined, "", "rk_test_fixture", "sk_test_fixture", "pk_live_fixture", "rk_live_"]) assert.equal(isLiveStripeKey(key), false);
});

test("Stripe signatures reject modified and stale payloads", () => {
  const stripe = new Stripe("sk_test_fixture_only");
  const payload = JSON.stringify({ id: "evt_fixture", type: "checkout.session.completed" });
  const secret = "whsec_fixture_only";
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
  assert.equal(stripe.webhooks.constructEvent(payload, header, secret).id, "evt_fixture");
  assert.throws(() => stripe.webhooks.constructEvent(payload + " ", header, secret));
  assert.throws(() => stripe.webhooks.constructEvent(payload, stripe.webhooks.generateTestHeaderString({ payload, secret, timestamp: 1 }), secret));
});

test("Stripe reconciliation uses current provider state and validates account, amount, currency and mode", async () => {
  const session = { id: "cs_test_fixture", mode: "payment", livemode: false, currency: "usd", amount_total: 10000,
    client_reference_id: "link", metadata: { fee_checkout_id: "link", fee_account_id: "account" },
    payment_intent: "pi_fixture", payment_status: "unpaid", status: "complete" };
  const calls = [];
  const link = { id: "link", account_id: "account", amount_cents: 10000, session_id: session.id };
  const db = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: link }) }) }) }),
    rpc: async (_, args) => { calls.push(args); return {}; } };
  let intent = { status: "processing", latest_charge: { disputed: false } };
  const stripe = { checkout: { sessions: { retrieve: async () => session } },
    paymentIntents: { retrieve: async () => intent },
    refunds: { list: async function* () { yield { status: "pending", amount: 1000 }; yield { status: "succeeded", amount: 2000 }; } } };
  // No refund is possible before a payment succeeds.
  stripe.refunds.list = async function* () {};
  await syncCheckoutState(stripe, db, session.id, false);
  assert.equal(calls.at(-1).p_paid, false);
  assert.equal(calls.at(-1).p_status, "PENDING");
  session.payment_status = "paid"; intent.status = "succeeded";
  stripe.refunds.list = async function* () { yield { status: "pending", amount: 1000 }; yield { status: "succeeded", amount: 2000 }; };
  await syncCheckoutState(stripe, db, session.id, false);
  assert.equal(calls.at(-1).p_refunded_cents, 2000);
  assert.equal(calls.at(-1).p_paid, true);
  intent.latest_charge.disputed = true;
  await syncCheckoutState(stripe, db, session.id, false);
  assert.equal(calls.at(-1).p_status, "REVIEW_REQUIRED");
  for (const [field, bad] of [["currency", "eur"], ["amount_total", 1], ["livemode", true], ["client_reference_id", "other"], ["mode", "subscription"]]) {
    const original = session[field]; session[field] = bad;
    await assert.rejects(syncCheckoutState(stripe, db, session.id, false), /verification/);
    session[field] = original;
  }
  session.metadata.fee_account_id = "other";
  await assert.rejects(syncCheckoutState(stripe, db, session.id, false), /verification/);
});

test("checkout ledger reserves balances and atomically deduplicates payments and cumulative refunds", async () => {
  const db = new PGlite();
  try {
    const owner = randomUUID(), registration = randomUUID(), team = randomUUID(), account = randomUUID(), link = randomUUID();
    await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create table public.tryout_submissions(id uuid primary key);create table public.teams(id uuid primary key);insert into auth.users values('${owner}');insert into tryout_submissions values('${registration}');insert into teams values('${team}');`);
    for (const file of ["20261021_team_fee_ledger.sql", "20261021_stripe_checkout.sql"])
      await db.exec(fs.readFileSync("supabase/migrations/" + file, "utf8"));
    await db.query("insert into team_fee_accounts(id,registration_id,team_id,season,fee_cents,created_by)values($1,$2,$3,'2027',10000,$4)", [account, registration, team, owner]);
    for (const role of ["anon", "authenticated"]) {
      await db.exec("set role " + role);
      await assert.rejects(db.query("select * from team_fee_checkouts"), /permission denied/);
      await assert.rejects(db.query("select sync_team_fee_checkout($1,'cs_fixture','pi_fixture',true,0,'PAID')", [link]), /permission denied/);
      await db.exec("reset role");
    }
    await db.exec("set role service_role");
    const reserve = (id, amount) => db.query("select reserve_team_fee_checkout($1,$2,$3,$4)", [id, account, amount, owner]);
    await reserve(link, 10000); await reserve(link, 10000);
    await assert.rejects(reserve(randomUUID(), 50), /already reserve/);
    await assert.rejects(reserve(link, 5000), /Retry details/);
    const sync = (paid, refunds, state = "PAID") => db.query("select sync_team_fee_checkout($1,'cs_fixture','pi_fixture',$2,$3,$4)", [link, paid, refunds, state]);
    await sync(false, 0, "PENDING");
    assert.equal((await db.query("select count(*)::int n from team_fee_transactions")).rows[0].n, 0);
    await sync(true, 0); await sync(true, 0);
    await sync(true, 2000); await sync(true, 2000); await sync(true, 1000);
    assert.equal((await db.query("select count(*)::int n from team_fee_transactions")).rows[0].n, 2);
    assert.equal((await db.query("select refunded_cents from team_fee_checkouts")).rows[0].refunded_cents, 2000);
    await sync(false, 0, "EXPIRED");
    assert.equal((await db.query("select paid,status from team_fee_checkouts")).rows[0].status, "PARTIALLY_REFUNDED");
    await assert.rejects(sync(true, 10001), /Invalid checkout/);
    await assert.rejects(db.query("select sync_team_fee_checkout($1,'cs_wrong','pi_fixture',true,0,'PAID')", [link]), /Session mismatch/);
    await assert.rejects(db.query("update team_fee_checkouts set paid=false"), /permission denied/);
    await sync(true, 10000); await sync(true, 10000);
    assert.equal((await db.query("select sum(case when kind='PAYMENT' then amount_cents else -amount_cents end)::int net from team_fee_transactions")).rows[0].net, 0);
  } finally { await db.close(); }
});
