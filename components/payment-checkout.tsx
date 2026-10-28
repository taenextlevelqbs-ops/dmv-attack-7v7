"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
export default function PaymentCheckout({
  registrationId,
  purpose,
}: {
  registrationId: string;
  purpose: "TRYOUT" | "TEAM";
}) {
  const [status, setStatus] = useState(""),
    [tryoutId, setTryoutId] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const refresh = useCallback(
    () =>
      fetch(
        `/api/payments/status?registration=${encodeURIComponent(registrationId)}&purpose=${purpose}`,
        { cache: "no-store" },
      )
        .then(async (response) => {
          const result = await response.json();
          if (!response.ok)
            throw Error(result.error || "Unable to confirm payment");
          return result;
        })
        .then((result) => {
          setStatus(result.status);
          setTryoutId(result.tryout_id);
          setError("");
        })
        .catch((reason) =>
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to confirm payment",
          ),
        ),
    [registrationId, purpose],
  );
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 5000);
    return () => clearInterval(timer);
  }, [refresh]);
  async function checkout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_id: registrationId, purpose }),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Unable to open checkout");
      const url = new URL(result.url);
      if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com")
        throw Error("Invalid checkout destination");
      window.location.assign(url.href);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to open checkout",
      );
      setBusy(false);
    }
  }
  const paid = status === "PAID",
    closed = ["REFUNDED", "PARTIALLY_REFUNDED"].includes(status);
  return (
    <div className="rounded-3xl border border-lime-400/25 bg-lime-400/5 p-6 md:p-10">
      <h1 className="text-3xl font-black uppercase">
        {purpose === "TRYOUT" ? "Tryout Payment" : "Team Registration Payment"}
      </h1>
      {tryoutId && (
        <p className="mt-4 text-sm text-white/60">Tryout ID: {tryoutId}</p>
      )}
      <p role="status" className="mt-5 text-lg font-bold text-lime-400">
        {paid
          ? "Payment confirmed"
          : closed
            ? "Refund recorded"
            : status
              ? `Payment status: ${status.replaceAll("_", " ")}`
              : "Checking payment status…"}
      </p>
      <p className="mt-4 text-sm leading-7 text-white/65">
        {paid
          ? "Your payment has been verified. Stripe sends your receipt to the checkout email address."
          : closed
            ? "Contact DMV Attack about your refund or any remaining balance before making another payment."
            : "Your registration is saved. Canceling or closing checkout will not remove it. Confirmation may take a moment after payment; refresh status before retrying."}
      </p>
      {!paid && !closed && status && (
        <button
          onClick={checkout}
          disabled={busy}
          className="mt-6 min-h-12 rounded-full bg-lime-400 px-6 py-3 font-black text-black disabled:opacity-50"
        >
          {busy
            ? "Opening secure checkout…"
            : `Continue to secure checkout — $${purpose === "TRYOUT" ? "20" : "750"}`}
        </button>
      )}
      <div className="mt-6 flex flex-wrap gap-5 text-sm text-lime-400">
        <button onClick={() => void refresh()}>Refresh status</button>
        <Link href="/portal/payments">Family payments</Link>
        {purpose === "TRYOUT" && (
          <Link href="/tryouts">Register another athlete</Link>
        )}
        <Link href="/contact">Contact staff</Link>
      </div>
      {error && (
        <p role="alert" className="mt-5 text-sm text-red-300">
          {error}{" "}
          <Link href="/portal/payments" className="underline">
            Family sign-in
          </Link>
        </p>
      )}
    </div>
  );
}
