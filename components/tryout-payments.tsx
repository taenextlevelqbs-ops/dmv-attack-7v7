import {
  STRIPE_TRYOUT_URL,
  VENMO_TRYOUT_URL,
  TRYOUT_FEE,
} from "@/lib/tryouts.mjs";
export default function TryoutPayments({ tryoutId }: { tryoutId?: string }) {
  return (
    <section
      id="payment"
      aria-labelledby="tryout-payment-heading"
      className="scroll-mt-24"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="site-eyebrow">
            Register First. Then Choose One Payment Method.
          </p>
          <h2
            id="tryout-payment-heading"
            className="mt-3 text-3xl font-black uppercase tracking-tight"
          >
            ${TRYOUT_FEE} Per Athlete.
          </h2>
        </div>
        <span className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/65">
          One tryout fee · Two ways to pay
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="flex flex-col rounded-3xl border border-white/15 bg-[#0c0f0a] p-6 sm:p-7">
          <p className="text-xs font-black uppercase tracking-widest text-lime-400">
            Option 01
          </p>
          <h3 className="mt-3 text-2xl font-black">Stripe</h3>
          <p className="mb-6 mt-3 flex-1 text-sm leading-7 text-white/70">
            Pay securely on DMV Attack’s existing Stripe checkout using the
            payment methods available there. Use the parent name and email from
            your athlete’s registration, and keep your receipt.
          </p>
          <a
            href={STRIPE_TRYOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="site-button site-button-primary w-full"
            aria-describedby="payment-link-note"
          >
            Pay $20 with Stripe
          </a>
        </article>
        <article className="flex flex-col rounded-3xl border border-white/15 bg-[#0c0f0a] p-6 sm:p-7">
          <p className="text-xs font-black uppercase tracking-widest text-lime-400">
            Option 02
          </p>
          <h3 className="mt-3 text-2xl font-black">Venmo</h3>
          <p className="mb-6 mt-3 flex-1 text-sm leading-7 text-white/70">
            Include the athlete’s full name, division and Tryout ID
            {tryoutId ? ` (${tryoutId})` : ""} in the payment note so staff can
            match the payment to the correct registration.
          </p>
          <a
            href={VENMO_TRYOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="site-button site-button-outline w-full"
            aria-describedby="payment-link-note"
          >
            Pay $20 with Venmo
          </a>
        </article>
      </div>
      <p
        id="payment-link-note"
        className="mt-5 text-xs leading-6 text-white/60"
      >
        Payment links open a new tab. Choose one method and pay only once.
        Stripe uses a shared payment link; payments are collected separately
        from athlete registration and verified by staff. Opening a link or
        returning to this page does not confirm payment.
      </p>
    </section>
  );
}
