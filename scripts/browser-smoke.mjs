import { createServer } from "node:http";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { PGlite } from "@electric-sql/pglite";
const origin = "http://127.0.0.1:4470",
  provider = "http://127.0.0.1:4481";
const owner = "11111111-1111-4111-8111-111111111111",
  admin = "11111111-1111-4111-8111-111111111112",
  parent = "11111111-1111-4111-8111-111111111113",
  registration = "22222222-2222-4222-8222-222222222222",
  team = "33333333-3333-4333-8333-333333333333";
const roles = { [owner]: "OWNER", [admin]: "ADMIN", [parent]: "PARENT" };
const registrations = [
  {
    id: registration,
    tryout_id: "DMV-FIXTURE-001",
    athlete_first_name: "Sam",
    athlete_last_name: "Example",
    age_group: "12U",
    date_of_birth: "2014-01-01",
    parent_guardian_name: "Fixture Parent",
    parent_email: "fixture@example.invalid",
    linked_family_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    linked_athlete_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    school: "Fixture School",
    primary_position: "Quarterback",
    status: "REGISTERED",
    submitted_at: new Date().toISOString(),
    headshot_path: null,
  },
];
const teams = [
  {
    id: team,
    name: "Fixture 12U",
    season: "2027",
    age_group: "12U",
    active: true,
  },
];
const assignments = [
  {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    tryout_submission_id: registration,
    team_id: team,
    roster_status: "OFFERED",
    accepted_at: null,
  },
];
const members = [];
const db = new PGlite();
await db.exec(
  `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create table public.tryout_submissions(id uuid primary key);create table public.teams(id uuid primary key);insert into auth.users values('${owner}'),('${admin}'),('${parent}');insert into tryout_submissions values('${registration}');insert into teams values('${team}');`,
);
await db.exec(
  fs.readFileSync("supabase/migrations/20261021_team_fee_ledger.sql", "utf8"),
);
await db.exec(
  fs.readFileSync("supabase/migrations/20261014_tryout_payments.sql", "utf8"),
);
await db.exec(fs.readFileSync("supabase/migrations/20261021_stripe_checkout.sql", "utf8"));
let uploads = 0,
  removed = 0,
  idCount = 0;
const databaseErrors = [];
function userFrom(req) {
  try {
    return JSON.parse(
      Buffer.from(
        (req.headers.authorization || "").replace("Bearer ", "").split(".")[1],
        "base64url",
      ),
    ).sub;
  } catch {
    return null;
  }
}
const fixture = createServer(async (req, res) => {
  const url = new URL(req.url, provider);
  const send = (code, data) => {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };
  let raw = "";
  for await (const chunk of req) raw += chunk;
  let body;
  try {
    body = JSON.parse(raw || "null");
  } catch {
    body = raw;
  }
  try {
    if (url.pathname === "/auth/v1/user") {
      const id = userFrom(req);
      return roles[id]
        ? send(200, {
            id,
            email: "fixture@example.invalid",
            aud: "authenticated",
            role: "authenticated",
            app_metadata: {},
            user_metadata: {},
          })
        : send(401, { message: "Not authenticated" });
    }
    if (url.pathname === "/rest/v1/profiles") {
      const id =
        url.searchParams.get("id")?.replace("eq.", "") || userFrom(req);
      if (req.method !== "GET") throw new Error("Unexpected profile write");
      return send(200, {
        id,
        role: roles[id],
        first_name: "Fixture",
        last_name: "Owner",
      });
    }
    if (req.headers.apikey !== "fixture-service")
      return send(403, { message: "Service access required" });
    if (url.pathname === "/auth/v1/admin/users")
      return send(200, {
        users: [{ id: owner, email: "fixture@example.invalid" }],
        aud: "authenticated",
      });
    if (url.pathname.startsWith("/storage/")) {
      if (req.method === "POST") uploads++;
      if (req.method === "DELETE") removed++;
      return send(200, { Key: "fixture", signedURL: "/object/signed/fixture" });
    }
    if (url.pathname === "/rest/v1/rpc/generate_public_tryout_id")
      return send(200, `DMV-FIXTURE-${++idCount}`);
    if (url.pathname.startsWith("/rest/v1/rpc/")) {
      const name = url.pathname.split("/").at(-1);
      let result;
      if (name === "record_team_fee_transaction")
        result = await db.query(
          "select record_team_fee_transaction($1,$2,$3,$4,$5,$6,$7,$8,$9) as id",
          [
            body.p_account_id,
            body.p_request_id,
            body.p_kind,
            body.p_amount_cents,
            body.p_method,
            body.p_reference,
            body.p_note,
            body.p_paid_on,
            body.p_recorded_by,
          ],
        );
      else if (name === "adjust_team_fee_account")
        result = await db.query(
          "select adjust_team_fee_account($1,$2,$3,$4,$5,$6,$7,$8) as id",
          [
            body.p_account_id,
            body.p_request_id,
            body.p_fee_cents,
            body.p_discount_cents,
            body.p_discount_note,
            body.p_due_date,
            body.p_reason,
            body.p_recorded_by,
          ],
        );
      else throw new Error("Unexpected RPC");
      return send(200, result.rows[0].id);
    }
    const table = url.pathname.replace("/rest/v1/", "");
    const single = (req.headers.accept || "").includes("vnd.pgrst.object");
    if (["roster_assignments", "family_members"].includes(table)) {
      const rows = table === "roster_assignments" ? assignments : members;
      let found = rows;
      for (const [key, value] of url.searchParams)
        if (value.startsWith("eq."))
          found = found.filter((row) => String(row[key]) === value.slice(3));
      if (req.method === "PATCH") {
        for (const row of found) Object.assign(row, body);
        return send(200, null);
      }
      if (req.method === "POST") {
        rows.push({ id: crypto.randomUUID(), ...body });
        return send(201, null);
      }
      return send(200, single ? found[0] || null : found);
    }
    if (["tryout_submissions", "teams"].includes(table)) {
      const rows = table === "teams" ? teams : registrations;
      if (req.method === "POST") {
        if (
          registrations.some(
            (r) =>
              r.athlete_first_name === body.athlete_first_name &&
              r.athlete_last_name === body.athlete_last_name &&
              r.date_of_birth === body.date_of_birth &&
              r.parent_email === body.parent_email,
          )
        )
          return send(409, { code: "23505" });
        const id = crypto.randomUUID();
        await db.query("insert into tryout_submissions(id)values($1)", [id]);
        registrations.push({
          ...body,
          id,
          status: "REGISTERED",
          submitted_at: new Date().toISOString(),
        });
        return send(201, null);
      }
      const id = url.searchParams.get("id")?.replace("eq.", "");
      if (req.method === "PATCH") {
        Object.assign(
          rows.find((r) => r.id === id),
          body,
        );
        return send(200, null);
      }
      const result = id ? rows.filter((r) => r.id === id) : rows;
      return send(200, single ? result[0] || null : result);
    }
    const allowed = [
      "team_fee_accounts",
      "team_fee_transactions",
      "team_fee_settings",
      "team_fee_adjustments",
      "team_fee_checkouts",
      "tryout_payments",
    ];
    if (!allowed.includes(table)) throw new Error("Unexpected table " + table);
    if (req.method === "GET") {
      let rows = (await db.query(`select * from ${table}`)).rows;
      for (const [key, value] of url.searchParams)
        if (value.startsWith("eq."))
          rows = rows.filter((row) => String(row[key]) === value.slice(3));
      return send(200, single ? rows[0] || null : rows);
    }
    const fields = {
      team_fee_accounts: [
        "registration_id",
        "team_id",
        "season",
        "fee_cents",
        "discount_cents",
        "discount_note",
        "due_date",
        "created_by",
      ],
      team_fee_settings: [
        "id",
        "default_fee_cents",
        "updated_by",
        "updated_at",
      ],
      tryout_payments: [
        "registration_id",
        "status",
        "amount_cents",
        "payment_note",
        "verified_at",
        "verified_by",
        "updated_at",
      ],
    }[table];
    if (!fields) throw new Error("Unexpected table write");
    const conflict =
      table === "team_fee_settings"
        ? " on conflict(id) do update set default_fee_cents=excluded.default_fee_cents,updated_by=excluded.updated_by,updated_at=excluded.updated_at"
        : table === "tryout_payments"
          ? " on conflict(registration_id) do update set status=excluded.status,payment_note=excluded.payment_note,verified_at=excluded.verified_at,verified_by=excluded.verified_by,updated_at=excluded.updated_at"
          : "";
    await db.query(
      `insert into ${table}(${fields.join(",")})values(${fields.map((_, i) => "$" + (i + 1)).join(",")})${conflict}`,
      fields.map((f) => body[f]),
    );
    return send(201, null);
  } catch (error) {
    if (!error.code) databaseErrors.push(error.message);
    send(400, { code: error.code || "FIXTURE_ERROR", message: error.message });
  }
});
await new Promise((resolve) => fixture.listen(4481, "127.0.0.1", resolve));
const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: provider,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fixture-public",
  SUPABASE_SECRET_KEY: "fixture-service",
  NEXT_TELEMETRY_DISABLED: "1",
};
let server, browser;
let logs = "";
let ready = false;
async function run(command, args) {
  const p = spawn(command, args, { env, stdio: ["ignore", "pipe", "pipe"] });
  p.stdout.on("data", (d) => (logs += d));
  p.stderr.on("data", (d) => (logs += d));
  const code = await new Promise((resolve) => p.on("exit", resolve));
  if (code !== 0) throw new Error(logs);
}
function token(id) {
  const encode = (v) => Buffer.from(JSON.stringify(v)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: id, exp: 4102444800, aud: "authenticated", role: "authenticated" })}.fixture-signature`;
}
async function identity(context, id) {
  await context.addCookies([
    {
      name: "sb-127-auth-token",
      value:
        "base64-" +
        Buffer.from(
          JSON.stringify({
            access_token: token(id),
            refresh_token: "fixture-refresh",
            expires_at: 4102444800,
            token_type: "bearer",
            user: { id },
          }),
        ).toString("base64url"),
      url: origin,
    },
  ]);
}
try {
  await run(process.execPath, ["node_modules/next/dist/bin/next", "build"]);
  server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "4470",
    ],
    { env, stdio: ["ignore", "pipe", "pipe"] },
  );
  server.stdout.on("data", (d) => {
    logs += d;
    if (d.toString().includes("Ready")) ready = true;
  });
  server.stderr.on("data", (d) => (logs += d));
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error(logs);
    try {
      if (ready && (await fetch(origin)).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  if (!ready) throw new Error("Owned test server did not start");
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || (fs.existsSync("/usr/bin/chromium")?"/usr/bin/chromium":undefined),
    headless: true,
    args: ["--no-sandbox"],
  });
  const anonymous = await browser.newContext();
  const guest = await anonymous.newPage();
  const pageErrors = [];
  guest.on("response", (response) => {
    if (response.url().includes("/api/tryouts/register"))
      console.log("REGISTRATION RESPONSE", response.status());
  });
  guest.on("pageerror", (e) => pageErrors.push(e.message));
  assert.equal(
    (await guest.request.get(origin + "/api/admin/finance")).status(),
    403,
  );
  assert.equal((await (await guest.request.get(origin+"/api/status")).json()).service,"DMV Attack");
  assert.equal((await guest.request.get(origin + "/api/admin/finance/checkout")).status(), 403);
  assert.equal((await guest.request.get(origin + "/api/admin/finance/checkout/setup")).status(), 403);
  assert.equal((await guest.request.get(origin + "/api/admin/finance/stripe-status")).status(), 403);
  assert.equal((await guest.request.post(origin + "/api/stripe/webhook", { data: {} })).status(), 503);
  await guest.goto(origin + "/admin/tryouts");
  await guest.waitForURL("**/login");
  for (const id of [admin, parent]) {
    const context = await browser.newContext();
    await identity(context, id);
    const response = await context.request.get(origin + "/api/admin/finance");
    assert.equal(response.status(), 403);
    assert.equal((await response.text()).includes("default_fee_cents"), false);
    assert.equal((await context.request.get(origin + "/api/admin/finance/stripe-status")).status(), 403);
    await context.close();
  }
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await identity(context, owner);
  const page = await context.newPage();
  page.on("pageerror", (e) => pageErrors.push(e.message));
  let r = await context.request.get(origin + "/api/admin/finance");
  assert.equal(r.status(), 200, await r.text());
  assert.equal((await r.json()).default_fee_cents, null);
  const post = async (body) =>
    context.request.post(origin + "/api/admin/finance", {
      headers: { Origin: origin },
      data: body,
    });
  assert.equal(
    (
      await context.request.post(origin + "/api/admin/finance", {
        headers: { Origin: "https://other.invalid" },
        data: { action: "set_default_fee", fee: "1000" },
      })
    ).status(),
    403,
  );
  const savedDefault = await post({ action: "set_default_fee", fee: "1000" });
  assert.equal(savedDefault.status(), 200, await savedDefault.text());
  await page.goto(origin + "/admin/payments");
  const connection = page.getByRole("region", { name: "Stripe connection checks" });
  await connection.getByText("Stripe tracking database: Passed", { exact: true }).waitFor();
  await connection.getByText("Server payment key saved: Needs attention", { exact: true }).waitFor();
  const readiness = await context.request.get(origin + "/api/admin/finance/stripe-status");
  assert.equal(readiness.status(), 200);
  const diagnostics = await readiness.json();
  assert.equal(diagnostics.payment_delivery_verified, false);
  assert.equal(diagnostics.checks.credentials, false);
  assert.equal((await db.query("select count(*)::int n from team_fee_accounts")).rows[0].n, 0);
  assert.equal((await db.query("select count(*)::int n from team_fee_checkouts")).rows[0].n, 0);
  assert.equal((await db.query("select count(*)::int n from team_fee_transactions")).rows[0].n, 0);
  await page.getByText("Set up an athlete’s team fee", { exact: true }).click();
  await page.locator('[name="registration_id"]').selectOption(registration);
  await page.locator('[name="team_id"]').selectOption(team);
  await page
    .getByRole("button", { name: "Create fee account", exact: true })
    .click();
  await page.getByRole("status").filter({ hasText: "Saved" }).waitFor();
  assert.ok(
    (await page.locator("article").textContent()).includes("$1,000.00"),
  );
  await page
    .getByRole("button", { name: "Payments & history", exact: true })
    .click();
  const payment = page.getByRole("region", { name: "Record team payment" });
  await payment.getByText("Stripe checkout is not enabled.", { exact: false }).waitFor();
  assert.equal(await payment.getByRole("button", { name: "Create private payment link", exact: true }).isDisabled(), true);
  const stripeSetup = await context.request.get(origin + "/api/admin/finance/checkout/setup");
  assert.equal(stripeSetup.status(), 200);
  assert.ok((await stripeSetup.text()).includes("reserve_team_fee_checkout"));
  await payment.locator('[name="amount"]').fill("250");
  await payment.locator('[name="reference"]').fill("fixture-deposit-001");
  await payment.locator('[name="verified"]').check();
  await payment
    .getByRole("button", { name: "Record verified entry", exact: true })
    .click();
  await page.getByText("Payment · $250.00", { exact: true }).waitFor();
  let body = await (
    await context.request.get(origin + "/api/admin/finance")
  ).json();
  assert.equal(body.accounts[0].paid_cents, 25000);
  assert.equal(body.accounts[0].balance_cents, 100000 - 25000);
  // The fixture price is deliberately unrelated to private production pricing.
  const account = body.accounts[0].id;
  const reqId = crypto.randomUUID();
  const entry = {
    action: "record_transaction",
    account_id: account,
    request_id: reqId,
    kind: "PAYMENT",
    amount: "100",
    method: "VENMO",
    reference: "fixture-installment-002",
    note: "",
    paid_on: "2026-10-01",
    verified: true,
  };
  assert.equal((await post(entry)).status(), 200);
  assert.equal((await post(entry)).status(), 200);
  body = await (
    await context.request.get(origin + "/api/admin/finance")
  ).json();
  assert.equal(body.accounts[0].paid_cents, 35000);
  assert.equal(body.transactions.length, 2);
  assert.equal(
    (await post({ ...entry, request_id: crypto.randomUUID() })).status(),
    409,
  );
  assert.equal(
    (
      await post({
        ...entry,
        request_id: crypto.randomUUID(),
        kind: "REFUND",
        amount: "999",
        reference: "refund-over-limit",
      })
    ).status(),
    400,
  );
  assert.equal(
    (
      await post({
        action: "adjust_account",
        account_id: account,
        request_id: crypto.randomUUID(),
        fee: "1000",
        discount: "100",
        discount_note: "Approved scholarship",
        due_date: "",
        reason: "Owner approval",
      })
    ).status(),
    200,
  );
  body = await (
    await context.request.get(origin + "/api/admin/finance")
  ).json();
  assert.equal(body.accounts[0].balance_cents, 55000);
  assert.equal(body.adjustments.length, 1);
  await page.reload();
  await page.getByRole("button", { name: "Payments & history" }).waitFor();
  assert.ok((await page.locator("article").textContent()).includes("$550.00"));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const [scroll, client] = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
    ]);
    assert.ok(scroll <= client + 1, `Fee page overflow ${width}`);
  }
  const accepted = await context.request.post(
    origin + "/api/admin/rosters/accept",
    {
      headers: { Origin: origin },
      data: { tryout_submission_id: registration, team_id: team },
    },
  );
  assert.equal(accepted.status(), 200, await accepted.text());
  assert.equal(
    (await (await context.request.get(origin + "/api/auth/route-user")).json())
      .destination,
    "/admin",
    "Roster acceptance must preserve owner role",
  );
  const repeatedOffer = await context.request.post(
    origin + "/api/admin/rosters/offer",
    {
      headers: { Origin: origin },
      data: { tryout_submission_id: registration, team_id: team },
    },
  );
  assert.equal(repeatedOffer.status(), 409);
  assert.equal(
    (await context.request.get(origin + "/api/admin/finance/setup")).status(),
    200,
  );
  await page.goto(origin + "/admin/tryouts/payments");
  await page.getByLabel("Update payment for Sam Example").waitFor();
  page.once("dialog", (dialog) => dialog.accept("verified-fixture-reference"));
  await page.getByLabel("Update payment for Sam Example").selectOption("PAID");
  await page.getByText("Verified collected: $20", { exact: false }).waitFor();
  async function fillRegistration() {
    await guest.goto(origin + "/tryouts");
    const fields = {
      "Athlete First Name": "Test",
      "Athlete Last Name": "Registrant",
      "Date of Birth": "2014-01-01",
      School: "Fixture School",
      "Current Age": "12",
      Grade: "7th",
      "Years Playing Football": "3",
      "Relationship To Athlete": "Parent",
      City: "Ashburn",
      State: "VA",
      "Parent Guardian Name": "Example Parent",
      "Parent Email": "test@example.invalid",
      "Parent Phone": "5555550123",
      "Emergency Contact": "Example Emergency",
      "Emergency Phone": "5555550124",
    };
    for (const [name, value] of Object.entries(fields)) {
      const input = guest.locator(`[name="${name}"]`);
      if ((await input.evaluate((el) => el.tagName)) === "SELECT")
        await input.selectOption(value);
      else await input.fill(value);
    }
    await guest.locator('[name="Tryout Division"]').selectOption("12U");
    await guest
      .locator('[name="Primary Position"]')
      .selectOption("Quarterback");
    await guest.locator('[name="Previous 7v7 Experience"]').selectOption("No");
    await guest
      .locator('[name="Athlete Headshot"]')
      .setInputFiles({
        name: "headshot.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZlGkAAAAASUVORK5CYII=",
          "base64",
        ),
      });
    for (const name of [
      "Information Confirmation",
      "Tryout Communication Consent",
      "Roster Understanding",
    ])
      await guest.locator(`[name="${name}"]`).check();
  }
  await fillRegistration();
  assert.deepEqual(
    await guest
      .locator("form [required]")
      .evaluateAll((elements) =>
        elements.filter((el) => !el.checkValidity()).map((el) => el.name),
      ),
    [],
  );
  await guest
    .getByRole("button", { name: "Register Athlete", exact: true })
    .click();
  await guest.waitForURL("**/tryouts/success?**");
  assert.ok(
    (await guest.locator("h1").textContent()).includes("Registration Complete"),
  );
  await fillRegistration();
  await guest
    .getByRole("button", { name: "Register Athlete", exact: true })
    .click();
  await guest
    .getByRole("alert")
    .filter({ hasText: "already registered" })
    .waitFor();
  assert.equal(
    await guest.locator('[name="Athlete First Name"]').inputValue(),
    "Test",
  );
  assert.equal(uploads, 2);
  assert.equal(removed, 1);
  for (const route of ["/", "/tryouts", "/login", "/7v7"]) {
    await guest.goto(origin + route);
    assert.equal((await guest.content()).includes("$1,000.00"), false);
  }
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(databaseErrors, []);
  console.log(
    "BROWSER PASS: owner-only fee settings, deposits/installments, duplicate prevention, refunds/adjustments/history, reload persistence, role denial/CSRF, tryout payments, successful registration, duplicate error preservation, private price absence and four responsive widths. Local fixtures only.",
  );
} finally {
  if (browser) await browser.close();
  if (server && server.exitCode === null) {
    server.kill("SIGTERM");
    await new Promise((resolve) => server.once("exit", resolve));
  }
  await new Promise((resolve) => fixture.close(resolve));
  await db.close();
  const logDir =
    process.env.DMV_TEST_LOG_DIR || path.join(os.tmpdir(), "dmv-smoke");
  fs.mkdirSync(logDir, { recursive: true });
  fs.writeFileSync(path.join(logDir, "browser-server.log"), logs);
}
