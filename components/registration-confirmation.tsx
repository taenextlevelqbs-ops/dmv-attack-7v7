"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import TryoutPayments from "./tryout-payments";
import {
  CONFIRMATION_STORAGE_KEY,
  validConfirmation,
  TRYOUT_TIME,
  TRYOUT_LOCATION,
  tryoutForDivision,
} from "@/lib/tryouts.mjs";
export type Confirmation = { id: string; athlete: string; division: string };
export default function RegistrationConfirmation({
  legacy,
}: {
  legacy?: Confirmation;
}) {
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null),
    [loaded, setLoaded] = useState(false),
    [copied, setCopied] = useState(false);
  useEffect(() => {
    let saved: Confirmation | null = null;
    try {
      const raw = sessionStorage.getItem(CONFIRMATION_STORAGE_KEY);
      if (raw) {
        const value = JSON.parse(raw);
        if (validConfirmation(value)) saved = value;
      }
    } catch {
      /* Storage can be unavailable in private browsers. */
    }
    const current = legacy && validConfirmation(legacy) ? legacy : saved;
    // Queue the state update after reading external browser state.
    Promise.resolve(current).then((value) => {
      setConfirmation(value);
      setLoaded(true);
    });
    if (legacy && validConfirmation(legacy)) {
      try {
        sessionStorage.setItem(
          CONFIRMATION_STORAGE_KEY,
          JSON.stringify(legacy),
        );
      } catch {}
      window.history.replaceState(null, "", "/tryouts/success");
    }
  }, [legacy]);
  if (!loaded)
    return (
      <p role="status" className="text-sm text-white/70">
        Opening your registration confirmation…
      </p>
    );
  const event = confirmation ? tryoutForDivision(confirmation.division) : null;
  return (
    <>
      <p className="site-eyebrow">DMV Attack · Athlete Registration</p>
      <h1 className="mt-4 text-4xl font-black uppercase tracking-tight sm:text-6xl">
        {confirmation ? "Registration Complete." : "Your Next Step."}
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70">
        {confirmation
          ? "Your athlete’s registration is saved. Keep your Tryout ID for check-in, evaluations and matching your payment. Registration confirmation is not payment confirmation."
          : "Your registration details are available in the browser tab used to submit the form. If you registered earlier, use the Tryout ID you saved or contact staff. Do not submit a second registration."}
      </p>
      {confirmation && (
        <section
          aria-label="Saved registration"
          className="mt-8 rounded-3xl border border-lime-400/30 bg-lime-400/5 p-6 sm:p-8"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">
            Athlete
          </p>
          <h2 className="mt-3 break-words text-3xl font-black uppercase">
            {confirmation.athlete}
          </h2>
          <div className="mt-6 grid gap-5 border-t border-white/15 pt-5 sm:grid-cols-[1fr_2fr]">
            <div>
              <p className="text-xs text-white/60">Division</p>
              <p className="mt-2 text-2xl font-black text-lime-400">
                {confirmation.division}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60">Tryout ID</p>
              <p className="mt-2 break-all text-xl font-black sm:text-2xl">
                {confirmation.id}
              </p>
              <button
                type="button"
                className="mt-3 min-h-11 text-sm font-bold text-lime-400 underline underline-offset-4"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(confirmation.id);
                    setCopied(true);
                  } catch {
                    setCopied(false);
                  }
                }}
              >
                Copy Tryout ID
              </button>
              <span role="status" className="ml-3 text-xs text-white/65">
                {copied ? "Copied" : ""}
              </span>
            </div>
          </div>
          {event && (
            <div className="mt-5 border-t border-white/15 pt-5">
              <h3 className="font-black uppercase">{event.name}</h3>
              <p className="mt-2 text-sm leading-7 text-white/75">
                {event.dateLabel}
                <br />
                <strong className="text-lime-400">{TRYOUT_TIME} EST</strong>
                <br />
                {TRYOUT_LOCATION.name}
                <br />
                {TRYOUT_LOCATION.street}, {TRYOUT_LOCATION.city},{" "}
                {TRYOUT_LOCATION.state} {TRYOUT_LOCATION.postalCode}
              </p>
            </div>
          )}
        </section>
      )}
      <div className="mt-10">
        <TryoutPayments tryoutId={confirmation?.id} />
      </div>
      <section className="mt-9 border-t border-white/15 pt-7">
        <h2 className="text-xl font-black uppercase">What Happens Next?</h2>
        <ol className="mt-4 list-inside list-decimal space-y-3 text-sm leading-7 text-white/70">
          <li>
            Save your athlete’s Tryout ID and attend the date for their
            division.
          </li>
          <li>
            If you haven’t paid, complete the $20 Stripe payment above and keep
            your receipt.
          </li>
          <li>
            Contact staff if registration details need correcting or a payment
            needs matching.
          </li>
        </ol>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/tryouts#registration"
            className="site-button site-button-primary"
          >
            Register Another Athlete
          </Link>
          <Link href="/contact" className="site-button site-button-outline">
            Contact DMV Attack
          </Link>
          <Link href="/" className="site-button site-button-outline">
            Home
          </Link>
        </div>
      </section>
    </>
  );
}
