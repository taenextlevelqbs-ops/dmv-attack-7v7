import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
const id = "11111111-1111-4111-8111-111111111111",
  reg = "22222222-2222-4222-8222-222222222222",
  team = "33333333-3333-4333-8333-333333333333",
  account = "44444444-4444-4444-8444-444444444444";
test("ledger enforces role isolation, exact payments, retry deduplication and refund limits", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create table public.tryout_submissions(id uuid primary key);create table public.teams(id uuid primary key);insert into auth.users values('${id}');insert into tryout_submissions values('${reg}');insert into teams values('${team}');`,
    );
    await db.exec(
      fs.readFileSync(
        "supabase/migrations/20261021_team_fee_ledger.sql",
        "utf8",
      ),
    );
    await db.exec(
      `insert into team_fee_accounts(id,registration_id,team_id,season,fee_cents,created_by)values('${account}','${reg}','${team}','2027',100000,'${id}')`,
    );
    for (const role of ["anon", "authenticated"]) {
      await db.exec("set role " + role);
      await assert.rejects(
        db.query("select * from team_fee_accounts"),
        /permission denied/,
      );
      await assert.rejects(
        db.query("select * from team_fee_transactions"),
        /permission denied/,
      );
      await assert.rejects(
        db.query("select * from team_fee_settings"),
        /permission denied/,
      );
      await db.exec("reset role");
    }
    const record = (key, kind, amount, reference = "receipt-a") =>
      db.query(
        "select record_team_fee_transaction($1,$2,$3,$4,$5,$6,$7,(now() at time zone 'America/New_York')::date,$8) as id",
        [account, key, kind, amount, "VENMO", reference, "", id],
      );
    await db.exec("set role service_role");
    const key = "55555555-5555-4555-8555-555555555555";
    const first = await record(key, "PAYMENT", 25000);
    const repeated = await record(key, "PAYMENT", 25000);
    assert.equal(first.rows[0].id, repeated.rows[0].id);
    assert.equal(
      (
        await db.query(
          "select count(*)::integer as n from team_fee_transactions",
        )
      ).rows[0].n,
      1,
    );
    await assert.rejects(record(key, "PAYMENT", 26000), /different details/);
    await assert.rejects(
      record(
        "66666666-6666-4666-8666-666666666666",
        "REFUND",
        25001,
        "refund-1",
      ),
      /exceeds/,
    );
    await record(
      "77777777-7777-4777-8777-777777777777",
      "REFUND",
      5000,
      "refund-1",
    );
    const totals = await db.query(
      "select sum(case when kind='PAYMENT' then amount_cents else -amount_cents end)::integer as paid from team_fee_transactions",
    );
    assert.equal(totals.rows[0].paid, 20000);
    await assert.rejects(
      record("88888888-8888-4888-8888-888888888888", "PAYMENT", 25000),
      /unique constraint/,
    );
    await db.query(
      "select adjust_team_fee_account($1,$2,100000,10000,'Scholarship',null,'Approved scholarship',$3)",
      [account, "99999999-9999-4999-8999-999999999999", id],
    );
    assert.equal(
      (await db.query("select discount_cents from team_fee_accounts")).rows[0]
        .discount_cents,
      10000,
    );
    assert.equal(
      (await db.query("select count(*)::int as n from team_fee_adjustments"))
        .rows[0].n,
      1,
    );
    await assert.rejects(
      db.query("delete from team_fee_transactions"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("update team_fee_accounts set fee_cents=1"),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});
