"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
type Attempt = {
  id: string;
  purpose: string;
  status: string;
  session_id: string | null;
  payment_intent_id: string | null;
  customer_id: string | null;
  refunded_cents: number;
  paid_at: string | null;
  amount_cents: number;
};
type Row = {
  id: string;
  tryout_id: string;
  athlete_first_name: string;
  athlete_last_name: string;
  age_group: string;
  parent_guardian_name: string;
  parent_email: string;
  parent_phone: string;
  submitted_at: string;
  status: string;
  tryout: {
    status: string;
    paid_cents: number;
    source: string;
    refunded_cents: number;
    payment_note: string;
  };
  team: {
    id: string;
    status: string;
    paid_cents: number;
    balance_cents: number;
  }[];
  payments: Attempt[];
};
const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
export default function Report() {
  const [rows, setRows] = useState<Row[]>([]),
    [totals, setTotals] = useState({ tryout_net_cents: 0, team_net_cents: 0 }),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("ALL"),
    [purpose, setPurpose] = useState("TRYOUT");
  useEffect(() => {
    let active = true;
    fetch("/api/admin/payments/registrations", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        if (active) {
          setRows(d.registrations);
          setTotals(d.totals);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const visible = useMemo(
    () =>
      rows.filter((r) => {
        const statuses =
          purpose === "TRYOUT"
            ? [r.tryout.status]
            : [
                ...r.team.map((t) => t.status),
                ...r.payments
                  .filter((p) => p.purpose === "TEAM")
                  .map((p) => p.status),
              ];
        if (!statuses.length) statuses.push("UNPAID");
        const matches =
          filter === "ALL" ||
          statuses.some((s) =>
            filter === "REFUNDED" ? s.includes("REFUND") : s === filter,
          );
        return (
          matches &&
          [
            r.athlete_first_name,
            r.athlete_last_name,
            r.tryout_id,
            r.age_group,
            r.parent_email,
            r.parent_guardian_name,
          ]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
        );
      }),
    [rows, search, filter, purpose],
  );
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin/payments" className="text-lime-400">
          Existing team fee ledger
        </Link>
        <h1 className="mt-5 text-4xl font-black uppercase">
          Registration Payments
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Net collected excludes refunds. Stripe team credits are counted from
          the existing ledger once. Historical manual payments are preserved.
        </p>
        {loading ? (
          <p role="status" className="mt-5">
            Loading payment report…
          </p>
        ) : error ? (
          <p role="alert" className="mt-5 text-red-300">
            {error}
          </p>
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["Tryout net collected", totals.tryout_net_cents],
                ["Team net collected", totals.team_net_cents],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/20 p-5"
                >
                  <p>{label}</p>
                  <p className="mt-2 text-3xl font-black text-lime-400">
                    {money(Number(value))}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <input
                aria-label="Search registrations"
                placeholder="Athlete, parent, division or ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-white/20 bg-black p-3"
              />
              <select
                aria-label="Payment purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="rounded-xl border border-white/20 bg-black p-3"
              >
                <option value="TRYOUT">Tryout fee</option>
                <option value="TEAM">Team fee</option>
              </select>
              <select
                aria-label="Payment status"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-xl border border-white/20 bg-black p-3"
              >
                {[
                  "ALL",
                  "PAID",
                  "PENDING",
                  "OPEN",
                  "FAILED",
                  "REFUNDED",
                  "UNPAID",
                  "PARTIAL",
                  "EXPIRED",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="mt-6 space-y-4">
              {visible.length === 0 && <p>No matching registrations.</p>}
              {visible.map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl border border-white/20 p-5"
                >
                  <h2 className="text-xl font-black">
                    {r.athlete_first_name} {r.athlete_last_name} · {r.age_group}
                  </h2>
                  <p className="mt-2 text-sm text-white/60">
                    {r.tryout_id} · Registered{" "}
                    {new Date(r.submitted_at).toLocaleDateString("en-US", {
                      timeZone: "America/New_York",
                    })}{" "}
                    · Acceptance: {r.status}
                  </p>
                  <p className="mt-2 break-words text-sm">
                    {r.parent_guardian_name} · {r.parent_email} ·{" "}
                    {r.parent_phone}
                  </p>
                  <p className="mt-3 text-lime-400">
                    Tryout: {r.tryout.status} · {money(r.tryout.paid_cents)} net
                    · {r.tryout.source} · Refunds:{" "}
                    {money(r.tryout.refunded_cents)}
                  </p>
                  {r.tryout.payment_note && (
                    <p className="mt-2 text-xs text-white/55">
                      Historical reference: {r.tryout.payment_note}
                    </p>
                  )}
                  {r.team.map((t) => (
                    <p key={t.id} className="mt-2 text-sm">
                      Team fee: {t.status} · {money(t.paid_cents)} net paid ·{" "}
                      {money(t.balance_cents)} balance
                    </p>
                  ))}
                  {r.payments.map((p) => (
                    <div
                      key={p.id}
                      className="mt-3 break-all border-t border-white/10 pt-3 text-xs leading-6 text-white/55"
                    >
                      <p>
                        {p.purpose} · STRIPE · {p.status} ·{" "}
                        {money(p.amount_cents)} · Refunded{" "}
                        {money(p.refunded_cents)}
                      </p>
                      <p>
                        Session: {p.session_id || "Creating"} · Payment Intent:{" "}
                        {p.payment_intent_id || "Pending"}
                      </p>
                      <p>
                        Customer: {p.customer_id || "Pending"} · Paid at:{" "}
                        {p.paid_at || "Not confirmed"}
                      </p>
                    </div>
                  ))}
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
