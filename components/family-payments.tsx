"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PaymentCheckout from "./payment-checkout";
type Registration = {
  id: string;
  tryout_id: string;
  athlete_first_name: string;
  athlete_last_name: string;
  age_group: string;
  status: string;
  offers?: {
    team_id: string;
    roster_status: string;
    teams?: { name: string; season: string; age_group: string } | null;
  }[];
};
export default function FamilyPayments() {
  const [registrations, setRegistrations] = useState<Registration[]>([]),
    [error, setError] = useState(""),
    [signedIn, setSignedIn] = useState(false),
    [loading, setLoading] = useState(true),
    [message, setMessage] = useState(""),
    [sending, setSending] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/payments/family", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!active) return;
        if (r.status === 401) return;
        if (!r.ok) throw Error(data.error);
        setRegistrations(data.registrations);
        setSignedIn(true);
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
  if (loading) return <p role="status">Loading family payments…</p>;
  return (
    <>
      <h1 className="text-4xl font-black uppercase">Family Payments</h1>
      <p className="mt-4 text-sm leading-7 text-white/60">
        Use the parent email on your registration. Team payments are available
        only after official acceptance.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-red-300">
          {error}
        </p>
      )}
      {!signedIn ? (
        <form
          className="mt-8 max-w-lg space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setSending(true);
            try {
              const email = new FormData(e.currentTarget).get("email");
              const r = await fetch("/api/payments/access", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
              const d = await r.json();
              if (!r.ok) throw Error(d.error);
              setMessage(d.message);
            } catch (reason) {
              setError(
                reason instanceof Error ? reason.message : "Sign-in failed",
              );
            } finally {
              setSending(false);
            }
          }}
        >
          <label className="block text-sm font-bold">
            Parent email
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-white/25 bg-black p-4"
            />
          </label>
          <button
            disabled={sending}
            className="rounded-full bg-lime-400 px-6 py-3 font-black text-black disabled:opacity-50"
          >
            {sending ? "Sending…" : "Email a sign-in link"}
          </button>
          <Link href="/login" className="ml-4 text-sm text-lime-400">
            Sign in with password
          </Link>
          {message && (
            <p role="status" className="text-sm leading-7 text-lime-400">
              {message}
            </p>
          )}
        </form>
      ) : (
        <div className="mt-8 space-y-8">
          {registrations.length === 0 && (
            <p>No registrations are linked to this email yet.</p>
          )}
          {registrations.map((r) => (
            <section key={r.id} className="space-y-5">
              <h2 className="text-2xl font-black">
                {r.athlete_first_name} {r.athlete_last_name} · {r.age_group}
              </h2>
              <p className="text-sm text-white/55">
                Acceptance status: {r.status}
              </p>
              {r.offers?.map((offer) => (
                <p key={offer.team_id} className="text-sm text-lime-400">
                  {offer.teams?.name || "Team assignment"}
                  {offer.teams?.season ? ` · ${offer.teams.season}` : ""} ·{" "}
                  {offer.roster_status}
                </p>
              ))}
              <PaymentCheckout registrationId={r.id} purpose="TRYOUT" />
              {r.status === "ACCEPTED" && (
                <PaymentCheckout registrationId={r.id} purpose="TEAM" />
              )}
            </section>
          ))}
        </div>
      )}
    </>
  );
}
