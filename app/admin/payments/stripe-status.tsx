"use client";
import { useCallback, useEffect, useState } from "react";
import { requestJson } from "@/lib/http.mjs";
type Status = { checks: Record<string, boolean>; mode: string };
const labels: Record<string, string> = {
  database: "Stripe tracking database",
  credentials: "Server payment key saved",
  webhook_secret: "Webhook signing secret saved",
  checkout_read: "Stripe checkout access",
  payment_read: "Stripe payment access",
  refund_read: "Stripe refund access",
};
export default function StripeStatus() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const check = useCallback(() => requestJson("/api/admin/finance/stripe-status", { cache: "no-store" })
    .then((result: Status) => { setStatus(result); setError(""); })
    .catch((e: Error) => setError(e.message)).finally(() => setBusy(false)), []);
  useEffect(() => { void check(); }, [check]);
  return <section aria-label="Stripe connection checks" className="my-6 rounded-xl border border-white/20 p-5">
    <h2 className="text-xl font-bold">Stripe connection</h2>
    <p className="my-3 text-sm text-white/65">You can check the connection before selecting your team. This does not assign athletes, create fee accounts or charge anyone.</p>
    {busy && <p role="status">Checking Stripe…</p>}
    {error && <p role="alert" className="text-red-200">{error}</p>}
    {status && <><p className="my-2 text-sm">{status.mode === "LIVE" ? "Live account configuration" : "Test account or missing live key"}</p>
      <ul className="grid gap-2 text-sm sm:grid-cols-2">{Object.entries(labels).map(([key, label]) => <li key={key} className={status.checks[key] ? "text-lime-300" : "text-amber-200"}>{label}: {status.checks[key] ? "Passed" : "Needs attention"}</li>)}</ul>
      {!status.checks.database && <a href="/api/admin/finance/checkout/setup" className="mt-3 inline-block underline">Download Stripe database setup</a>}
    </>}
    <p className="my-3 text-sm text-white/65">A successful payment and webhook delivery are not yet verified by these checks. Checkout creation and payment methods still need a Stripe sandbox test. Team fees begin only when you create an account for a selected athlete.</p>
    <button type="button" disabled={busy} className="min-h-11 text-lime-300 underline disabled:opacity-50" onClick={() => { setBusy(true); void check(); }}>Recheck connection</button>
  </section>;
}
