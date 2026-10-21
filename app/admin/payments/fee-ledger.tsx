"use client";
import { requestJson } from "@/lib/http.mjs";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { formatMoney } from "@/lib/finance/money.mjs";
import StripePayments from "./stripe-payments";
type Account = {
  id: string;
  registration_id: string;
  team_id: string;
  season: string;
  fee_cents: number;
  discount_cents: number;
  discount_note: string;
  due_date: string | null;
  paid_cents: number;
  balance_cents: number;
  credit_cents: number;
  status: string;
};
type Registration = {
  id: string;
  tryout_id: string;
  athlete_first_name: string;
  athlete_last_name: string;
  age_group: string;
  parent_guardian_name: string;
  parent_email: string;
};
type Team = {
  id: string;
  name: string;
  age_group: string;
  season: string;
  active: boolean;
};
type Transaction = {
  id: string;
  account_id: string;
  kind: string;
  amount_cents: number;
  method: string;
  reference: string;
  note: string;
  paid_on: string;
  recorded_at: string;
};
type Adjustment = {
  id: string;
  account_id: string;
  reason: string;
  before_values: { fee_cents: number; discount_cents: number };
  after_values: { fee_cents: number; discount_cents: number };
  recorded_at: string;
};
type Data = {
  accounts: Account[];
  transactions: Transaction[];
  adjustments: Adjustment[];
  registrations: Registration[];
  teams: Team[];
  default_fee_cents: number | null;
};
const control =
  "min-h-12 w-full min-w-0 rounded-xl border border-white/20 bg-black px-3 py-3 text-base text-white";
export default function FeeLedger() {
  const [data, setData] = useState<Data | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [message, setMessage] = useState(""),
    [saving, setSaving] = useState(false),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("ALL"),
    [teamFilter, setTeamFilter] = useState("ALL"),
    [selected, setSelected] = useState("");
  const retry = useRef<{ payload: string; key: string } | null>(null);
  const load = useCallback(
    () =>
      requestJson("/api/admin/finance", { cache: "no-store" })
        .then((body: Data) => {
          setData(body);
          setError("");
        })
        .catch((e: unknown) =>
          setError(
            e instanceof Error ? e.message : "Unable to load team fees.",
          ),
        )
        .finally(() => setLoading(false)),
    [],
  );
  useEffect(() => {
    void load();
  }, [load]);
  async function save(payload: Record<string, unknown>) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (
        payload.action === "record_transaction" ||
        payload.action === "adjust_account"
      ) {
        const signature = JSON.stringify(payload);
        if (retry.current?.payload !== signature)
          retry.current = { payload: signature, key: crypto.randomUUID() };
        payload = { ...payload, request_id: retry.current.key };
      }
      const r = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error || "Unable to save.");
      retry.current = null;
      setMessage("Saved to the team fee ledger.");
      await load();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setSaving(false);
    }
  }
  const registrations = new Map(
      data?.registrations.map((r) => [r.id, r]) || [],
    ),
    teams = new Map(data?.teams.map((t) => [t.id, t]) || []);
  const rows = (data?.accounts || []).filter((a) => {
    const r = registrations.get(a.registration_id);
    return (
      (status === "ALL" || status === a.status) &&
      (teamFilter === "ALL" || teamFilter === a.team_id) &&
      [
        r?.athlete_first_name,
        r?.athlete_last_name,
        r?.parent_guardian_name,
        r?.tryout_id,
        a.season,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    );
  });
  const current = data?.accounts.find((a) => a.id === selected);
  const sum = (key: "paid_cents" | "balance_cents" | "credit_cents") =>
    rows.reduce((total, a) => total + a[key], 0);
  function exportCsv() {
    if (!data) return;
    const quote = (v: unknown) =>
      `"${String(v ?? "")
        .replace(/^[\s]*[=+@\-]|^[\t\r\n]/, "'$&")
        .replaceAll('"', '""')}"`;
    const csv = [
      [
        "Athlete",
        "Tryout ID",
        "Team",
        "Season",
        "Fee",
        "Discount",
        "Paid",
        "Balance",
        "Credit",
        "Status",
      ],
      ...rows.map((a) => {
        const r = registrations.get(a.registration_id);
        return [
          `${r?.athlete_first_name || ""} ${r?.athlete_last_name || ""}`,
          r?.tryout_id,
          teams.get(a.team_id)?.name,
          a.season,
          formatMoney(a.fee_cents),
          formatMoney(a.discount_cents),
          formatMoney(a.paid_cents),
          formatMoney(a.balance_cents),
          formatMoney(a.credit_cents),
          a.status,
        ];
      }),
    ]
      .map((row) => row.map(quote).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "dmv-team-fee-balances.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-sm font-bold text-lime-400">
          ← Command Center
        </Link>
        <p className="mt-7 text-xs font-black uppercase tracking-widest text-lime-400">
          Private · Owner only
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase sm:text-5xl">
          Team fees &amp; balances
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-white/65">
          Record the agreed team fee, then add each verified deposit or
          installment. The balance updates automatically. Venmo transfers must
          be checked in Venmo. Tryout payments are tracked separately.
        </p>
        <Link
          href="/admin/tryouts/payments"
          className="mt-3 inline-block py-3 text-sm text-lime-400 underline"
        >
          View $20 tryout payments →
        </Link>
        {loading && (
          <p role="status" className="py-8">
            Loading fee records…
          </p>
        )}
        {error && (
          <div
            role="alert"
            className="my-5 rounded-xl border border-red-400/40 p-4 text-red-200"
          >
            {error}
            <p className="mt-3 text-sm">
              If database setup is required, an owner can{" "}
              <a href="/api/admin/finance/setup" className="underline">
                download the setup SQL
              </a>{" "}
              and run it in the DMV Attack Supabase SQL editor.
            </p>
            <button onClick={() => void load()} className="ml-3 underline">
              Retry
            </button>
          </div>
        )}
        {message && (
          <p role="status" className="my-4 text-lime-300">
            {message}
          </p>
        )}
        {data && (
          <>
            <div className="my-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ["Athletes with fees", rows.length],
                ["Verified collected", formatMoney(sum("paid_cents"))],
                ["Still owed", formatMoney(sum("balance_cents"))],
                ["Overpayments / credits", formatMoney(sum("credit_cents"))],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/15 p-4"
                >
                  <p className="text-xs text-white/55">{label}</p>
                  <strong className="mt-2 block text-2xl">{value}</strong>
                </div>
              ))}
            </div>
            <details className="mb-5 rounded-xl border border-white/15 p-5">
              <summary className="cursor-pointer py-2 font-bold">
                Private default team fee
              </summary>
              <p className="my-3 text-sm text-white/60">
                Set the fee used for new accounts. This setting is visible only
                to owners and does not change existing athlete balances.
              </p>
              <form
                className="flex flex-wrap gap-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  await save({ action: "set_default_fee", fee: f.get("fee") });
                }}
              >
                <label className="grid gap-2 text-sm">
                  Default fee ($)
                  <input
                    key={String(data.default_fee_cents)}
                    name="fee"
                    required
                    inputMode="decimal"
                    defaultValue={
                      data.default_fee_cents === null
                        ? ""
                        : (data.default_fee_cents / 100).toFixed(2)
                    }
                    className={control}
                  />
                </label>
                <button
                  disabled={saving}
                  className="min-h-12 self-end rounded-xl bg-lime-400 px-5 py-3 font-bold text-black"
                >
                  Save private default
                </button>
              </form>
            </details>
            <details className="mb-7 rounded-xl border border-lime-400/25 p-5">
              <summary className="cursor-pointer py-2 font-bold text-lime-300">
                Set up an athlete’s team fee
              </summary>
              <p className="my-3 text-sm text-white/55">
                Create one account per athlete, team and season. A discount or
                scholarship reduces the amount owed; it is not a payment
                received.
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const f = new FormData(form);
                  const team = teams.get(String(f.get("team_id")));
                  if (
                    await save({
                      action: "create_account",
                      registration_id: f.get("registration_id"),
                      team_id: f.get("team_id"),
                      season: team?.season || "",
                      fee: f.get("fee"),
                      discount: f.get("discount"),
                      discount_note: f.get("discount_note"),
                      due_date: f.get("due_date"),
                    })
                  )
                    form.reset();
                }}
                className="grid gap-4 pt-3 sm:grid-cols-2"
              >
                <label className="grid gap-2 text-sm">
                  Athlete
                  <select name="registration_id" required className={control}>
                    <option value="">Select athlete</option>
                    {data.registrations.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.athlete_first_name} {r.athlete_last_name} ·{" "}
                        {r.age_group} · {r.tryout_id}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm">
                  Team / season
                  <select name="team_id" required className={control}>
                    <option value="">Select team</option>
                    {data.teams
                      .filter((t) => t.active)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} · {t.season}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm">
                  Agreed team fee ($)
                  <input
                    name="fee"
                    inputMode="decimal"
                    defaultValue={
                      data.default_fee_cents === null
                        ? ""
                        : (data.default_fee_cents / 100).toFixed(2)
                    }
                    required
                    className={control}
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Discount / scholarship ($)
                  <input
                    name="discount"
                    inputMode="decimal"
                    defaultValue="0.00"
                    required
                    className={control}
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Discount / scholarship reason
                  <input
                    name="discount_note"
                    maxLength={500}
                    className={control}
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  Balance due date (optional)
                  <input name="due_date" type="date" className={control} />
                </label>
                <button
                  disabled={saving}
                  className="min-h-12 rounded-xl bg-lime-400 px-5 py-3 font-bold text-black disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Create fee account"}
                </button>
              </form>
            </details>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                aria-label="Search fee accounts"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Athlete, parent, Tryout ID or season"
                className={control}
              />
              <select
                aria-label="Filter fee status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={control}
              >
                {["ALL", "UNPAID", "PARTIAL", "OVERDUE", "PAID"].map((v) => (
                  <option key={v} value={v}>
                    {v === "ALL" ? "All payment statuses" : v}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter fee team"
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className={control}
              >
                <option value="ALL">All teams / seasons</option>
                {data.teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} · {t.season}
                  </option>
                ))}
              </select>
            </div>
            <div className="my-4 flex flex-wrap items-center justify-between gap-3 text-sm text-white/60">
              <span>
                {rows.length} fee accounts · totals reflect filters ·{" "}
                {
                  data.registrations.filter(
                    (r) =>
                      !data.accounts.some((a) => a.registration_id === r.id),
                  ).length
                }{" "}
                registrations have no fee account yet
              </span>
              <button
                onClick={exportCsv}
                className="min-h-11 text-lime-400 underline"
              >
                Export balances CSV
              </button>
            </div>
            {!rows.length && (
              <p className="rounded-xl border border-white/15 p-6 text-white/60">
                No fee accounts match. Set up each athlete’s fee to start
                tracking balances.
              </p>
            )}
            <div className="space-y-3">
              {rows.map((a) => {
                const r = registrations.get(a.registration_id);
                return (
                  <article
                    key={a.id}
                    className="rounded-xl border border-white/15 p-5"
                  >
                    <div className="flex flex-wrap justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold">
                          {r?.athlete_first_name} {r?.athlete_last_name}
                        </h2>
                        <p className="mt-1 text-sm text-white/55">
                          {r?.tryout_id} ·{" "}
                          {teams.get(a.team_id)?.name || "Team"} · {a.season}
                        </p>
                        <p className="text-xs text-white/50">
                          {r?.parent_guardian_name}{" "}
                          {a.due_date ? `· Due ${a.due_date}` : ""}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-lime-300">
                        {a.status}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {[
                        [
                          "Team fee",
                          formatMoney(a.fee_cents - a.discount_cents),
                        ],
                        ["Paid", formatMoney(a.paid_cents)],
                        ["Owes", formatMoney(a.balance_cents)],
                        ["Credit", formatMoney(a.credit_cents)],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p className="text-xs text-white/50">{label}</p>
                          <strong className="text-xl">{value}</strong>
                        </div>
                      ))}
                    </div>
                    {a.discount_cents > 0 && (
                      <p className="mt-3 text-xs text-white/60">
                        Discount / scholarship: {formatMoney(a.discount_cents)}{" "}
                        · {a.discount_note}
                      </p>
                    )}
                    <button
                      onClick={() => {
                        setSelected(selected === a.id ? "" : a.id);
                        setMessage("");
                        requestAnimationFrame(() =>
                          document
                            .getElementById("fee-account-editor")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            }),
                        );
                      }}
                      className="mt-4 min-h-11 rounded-lg border border-lime-400/40 px-4 py-2 text-sm font-bold text-lime-300"
                      aria-expanded={selected === a.id}
                    >
                      Payments &amp; history
                    </button>
                  </article>
                );
              })}
            </div>
            {current && (
              <section
                id="fee-account-editor"
                aria-label="Record team payment"
                className="my-7 rounded-xl border border-lime-400/30 p-5"
              >
                <h2 className="text-xl font-bold">
                  Payments ·{" "}
                  {
                    registrations.get(current.registration_id)
                      ?.athlete_first_name
                  }{" "}
                  {
                    registrations.get(current.registration_id)
                      ?.athlete_last_name
                  }
                </h2>
                <StripePayments key={current.id} accountId={current.id} balance={current.balance_cents} onUpdated={() => void load()} />
                <p className="my-2 text-sm text-white/60">
                  Current balance: {formatMoney(current.balance_cents)}. Each
                  entry stays in the history. Use a unique Venmo transaction ID
                  or cash/check receipt reference. Record a refund to reverse
                  returned money.
                </p>
                <form
                  key={selected}
                  className="mt-5 grid gap-4 sm:grid-cols-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const f = new FormData(form);
                    if (
                      await save({
                        action: "record_transaction",
                        account_id: current.id,
                        kind: f.get("kind"),
                        amount: f.get("amount"),
                        method: f.get("method"),
                        reference: f.get("reference"),
                        note: f.get("note"),
                        paid_on: f.get("paid_on"),
                        verified: f.get("verified") === "on",
                      })
                    )
                      form.reset();
                  }}
                >
                  <label className="grid gap-2 text-sm">
                    Entry type
                    <select name="kind" className={control}>
                      <option value="PAYMENT">Payment received</option>
                      <option value="REFUND">Refund sent</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm">
                    Amount ($)
                    <input
                      name="amount"
                      required
                      inputMode="decimal"
                      className={control}
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    Payment method
                    <select name="method" className={control}>
                      {["VENMO", "CASH", "CHECK", "BANK", "OTHER"].map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm">
                    Payment date
                    <input
                      name="paid_on"
                      type="date"
                      defaultValue={new Intl.DateTimeFormat("en-CA", {
                        timeZone: "America/New_York",
                      }).format(new Date())}
                      required
                      className={control}
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    Transaction / receipt reference
                    <input
                      name="reference"
                      required
                      maxLength={200}
                      className={control}
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    Note (optional)
                    <input name="note" maxLength={500} className={control} />
                  </label>
                  <label className="flex gap-3 text-sm sm:col-span-2">
                    <input
                      name="verified"
                      type="checkbox"
                      required
                      className="h-5 w-5 accent-lime-400"
                    />
                    I checked that this payment was received or this refund was
                    sent.
                  </label>
                  <button
                    disabled={saving}
                    className="min-h-12 rounded-xl bg-lime-400 px-5 py-3 font-bold text-black disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Record verified entry"}
                  </button>
                </form>
                <details className="mt-7 rounded-xl border border-white/15 p-4">
                  <summary className="cursor-pointer py-2 font-bold">
                    Adjust fee, scholarship or due date
                  </summary>
                  <p className="my-3 text-sm text-white/55">
                    Payments remain in the ledger. Any reduced balance below the
                    amount already paid appears as a credit; a refund must be
                    recorded separately.
                  </p>
                  <form
                    key={`${selected}-${current.fee_cents}-${current.discount_cents}`}
                    className="grid gap-3 sm:grid-cols-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      await save({
                        action: "adjust_account",
                        account_id: current.id,
                        fee: f.get("fee"),
                        discount: f.get("discount"),
                        discount_note: f.get("discount_note"),
                        due_date: f.get("due_date"),
                        reason: f.get("reason"),
                      });
                    }}
                  >
                    <label className="grid gap-2 text-sm">
                      Updated fee ($)
                      <input
                        name="fee"
                        defaultValue={(current.fee_cents / 100).toFixed(2)}
                        inputMode="decimal"
                        required
                        className={control}
                      />
                    </label>
                    <label className="grid gap-2 text-sm">
                      Updated discount ($)
                      <input
                        name="discount"
                        defaultValue={(current.discount_cents / 100).toFixed(2)}
                        inputMode="decimal"
                        required
                        className={control}
                      />
                    </label>
                    <label className="grid gap-2 text-sm">
                      Discount reason
                      <input
                        name="discount_note"
                        defaultValue={current.discount_note}
                        maxLength={500}
                        className={control}
                      />
                    </label>
                    <label className="grid gap-2 text-sm">
                      Updated due date
                      <input
                        name="due_date"
                        type="date"
                        defaultValue={current.due_date || ""}
                        className={control}
                      />
                    </label>
                    <label className="grid gap-2 text-sm sm:col-span-2">
                      Reason for this change
                      <input
                        name="reason"
                        required
                        maxLength={500}
                        className={control}
                      />
                    </label>
                    <button
                      disabled={saving}
                      className="min-h-12 rounded-lg border border-lime-400/40 px-4 py-3 font-bold text-lime-300"
                    >
                      Save adjustment
                    </button>
                  </form>
                </details>
                <h3 className="mt-7 font-bold">Transaction history</h3>
                <ol className="mt-3 divide-y divide-white/10">
                  {data.transactions
                    .filter((t) => t.account_id === current.id)
                    .map((t) => (
                      <li key={t.id} className="py-4 text-sm">
                        <strong>
                          {t.kind === "PAYMENT" ? "Payment" : "Refund"} ·{" "}
                          {formatMoney(t.amount_cents)}
                        </strong>
                        <p className="mt-1 text-white/60">
                          {t.paid_on} · {t.method} · {t.reference}
                        </p>
                        {t.note && <p className="text-white/60">{t.note}</p>}
                        <p className="mt-1 break-all text-xs text-white/40">
                          Receipt {t.id} · Recorded{" "}
                          {new Date(t.recorded_at).toLocaleString("en-US")}
                        </p>
                      </li>
                    ))}
                </ol>
                {data.adjustments
                  ?.filter((a) => a.account_id === current.id)
                  .map((a) => (
                    <p
                      key={a.id}
                      className="border-t border-white/10 py-3 text-sm text-white/60"
                    >
                      Fee adjustment · {a.reason} ·{" "}
                      {formatMoney(
                        a.before_values.fee_cents -
                          a.before_values.discount_cents,
                      )}{" "}
                      →{" "}
                      {formatMoney(
                        a.after_values.fee_cents -
                          a.after_values.discount_cents,
                      )}{" "}
                      · {new Date(a.recorded_at).toLocaleDateString("en-US")}
                    </p>
                  ))}
                {!data.transactions.some(
                  (t) => t.account_id === current.id,
                ) && (
                  <p className="mt-3 text-sm text-white/50">
                    No payments recorded for this account.
                  </p>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
