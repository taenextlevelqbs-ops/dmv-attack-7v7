"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/finance/money.mjs";
import { requestJson } from "@/lib/http.mjs";
type Checkout = { id: string; account_id: string; amount_cents: number; checkout_url: string | null; status: string; refunded_cents: number; paid: boolean };
export default function StripePayments({ accountId, balance, onUpdated }: { accountId: string; balance: number; onUpdated: () => void }) {
  const [links, setLinks] = useState<Checkout[]>([]);
  const [configured, setConfigured] = useState(false);
  const [mode, setMode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const retry = useRef<{ amount: string; key: string } | null>(null);
  const load = useCallback(() => requestJson("/api/admin/finance/checkout", { cache: "no-store" }).then((data: { checkouts: Checkout[]; configured: boolean; mode: string }) => {
      setLinks(data.checkouts || []); setConfigured(data.configured); setMode(data.mode); setError("");
    }).catch((e: Error) => setError(e.message)).finally(() => setLoading(false)), []);
  useEffect(() => { void load(); }, [load]);
  return <div className="my-6 rounded-xl border border-white/20 p-4">
    <h3 className="text-lg font-bold">Private Stripe payment links</h3>
    {configured && <p className="my-2 font-bold text-amber-200">{mode === "LIVE" ? "Live payments" : "TEST MODE · no real money"}</p>}
    <p className="my-3 text-sm text-white/65">Create a full-payment or installment link for this family. Share it privately. Stripe confirms payments automatically; pending bank payments do not count as paid. Links expire after about 24 hours. Existing links keep their original amount even if you change the balance; expire unused links in Stripe before issuing replacements.</p>
    <p className="my-3 text-sm text-white/65">For Stripe payments, issue refunds in Stripe and let them sync here. Do not also record those payments or refunds manually. Processing fees are shown in Stripe; families receive credit for the full amount paid.</p>
    {loading && <p role="status">Loading Stripe payments…</p>}
    {error && <p role="alert" className="my-3 text-red-200">{error} <a className="underline" href="/api/admin/finance/checkout/setup">Download Stripe setup SQL</a></p>}
    {!loading && !configured && <p className="my-3 text-amber-200">Stripe checkout is not enabled. Add server credentials and the webhook in Vercel after database setup.</p>}
    <form className="flex flex-wrap items-end gap-3" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); setError("");
      const amount = String(new FormData(e.currentTarget).get("checkout_amount"));
      if (retry.current?.amount !== amount) retry.current = { amount, key: crypto.randomUUID() };
      try {
        const r = await fetch("/api/admin/finance/checkout", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ account_id: accountId, amount, request_id: retry.current.key }) });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Unable to create link.");
        retry.current = null; await load();
      } catch (e) { setError((e as Error).message); }
      finally { setBusy(false); }
    }}>
      <label className="grid gap-2 text-sm">Checkout amount ($)<input name="checkout_amount" required inputMode="decimal" defaultValue={(balance / 100).toFixed(2)} className="min-h-12 w-full rounded-lg border border-white/20 bg-black px-3" /></label>
      <button disabled={!configured || busy || balance <= 0} className="min-h-12 rounded-lg bg-lime-400 px-4 font-bold text-black disabled:opacity-50">{busy ? "Creating…" : "Create private payment link"}</button>
      <button type="button" className="min-h-12 underline" onClick={() => { void load(); onUpdated(); }}>Refresh payment status</button>
    </form>
    <ul className="mt-4 divide-y divide-white/15">{links.filter(l => l.account_id === accountId).map(l => <li key={l.id} className="py-3 text-sm">
      <strong>{formatMoney(l.amount_cents)} · {l.status === "CREATING" && l.checkout_url ? "OPEN" : l.status}</strong>
      {l.refunded_cents > 0 && <span> · Refunded {formatMoney(l.refunded_cents)}</span>}
      {l.status === "REVIEW_REQUIRED" && <p className="text-amber-200">Disputed payment: review in Stripe. Ledger totals still include the original payment and need owner reconciliation for any bank reversal or dispute outcome.</p>}
      {l.checkout_url && !l.paid && !["EXPIRED", "FAILED"].includes(l.status) && <div className="mt-2 flex flex-wrap gap-3">
        <a href={l.checkout_url} target="_blank" rel="noreferrer" className="text-lime-300 underline">Open private checkout</a>
        <button type="button" className="underline" onClick={async () => { try { await navigator.clipboard.writeText(l.checkout_url!); } catch { setError("Copy unavailable. Open checkout and copy its URL."); } }}>Copy link</button>
      </div>}
      {!l.checkout_url && l.status === "CREATING" && <button type="button" disabled={busy || !configured} className="mt-2 block underline" onClick={async () => {
        setBusy(true);
        try {
          const r = await fetch("/api/admin/finance/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ account_id: accountId, request_id: l.id, amount: (l.amount_cents / 100).toFixed(2) }) });
          const result = await r.json(); if (!r.ok) throw new Error(result.error); await load();
        } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
      }}>Recover interrupted checkout</button>}
    </li>)}</ul>
  </div>;
}
