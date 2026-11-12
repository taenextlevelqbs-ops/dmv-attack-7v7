"use client";
import {useState, type FormEvent} from "react";

type Kind = "SPONSORSHIP" | "CONTRIBUTION";
const tiers = [{key:"BRONZE",label:"Bronze · $250"},{key:"SILVER",label:"Silver · $500"},{key:"GOLD",label:"Gold · $1,000"}] as const;

export default function FoundationCheckoutForm({kind}:{kind:Kind}) {
  const sponsor = kind === "SPONSORSHIP";
  const [tier,setTier] = useState<"BRONZE"|"SILVER"|"GOLD">(() => { const selected = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("sponsor") : null; return selected === "BRONZE" || selected === "SILVER" || selected === "GOLD" ? selected : "SILVER"; });
  const [amount,setAmount] = useState("50");
  const [contactName,setContactName] = useState("");
  const [businessName,setBusinessName] = useState("");
  const [website,setWebsite] = useState("");
  const [email,setEmail] = useState("");
  const [agreed,setAgreed] = useState(false);
  const [logo,setLogo] = useState<File|null>(null);
  const [pending,setPending] = useState(false);
  const [error,setError] = useState("");
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if(pending) return;
    setPending(true);setError("");
    try {
      const amountCents = Math.round(Number(amount)*100);
      const payload = new FormData();
      payload.set("data",JSON.stringify({kind,tier,amountCents,contactName,businessName,website,email,agreed,companyWebsiteHidden:""}));
      if(sponsor && logo) payload.set("logo",logo);
      const r = await fetch("/api/foundation/checkout",{method:"POST",body:payload});
      const data = await r.json();
      if(!r.ok || !data.url || typeof data.url!=="string") throw new Error(data.error || "Unable to open checkout");
      const checkout = new URL(data.url);
      if(checkout.protocol!=="https:" || !(checkout.hostname==="checkout.stripe.com" || checkout.hostname.endsWith(".checkout.stripe.com")))
        throw new Error("Unexpected checkout destination");
      window.location.assign(checkout.href);
    } catch(err){setError(err instanceof Error?err.message:"Checkout unavailable");setPending(false);}
  }
  return (
    <form onSubmit={submit} className="rounded-[28px] border border-lime-400/25 bg-white/[0.035] p-6 md:p-9">
      <h3 className="text-2xl font-black uppercase">{sponsor?"Become A 2027 Sponsor":"Make A Community Contribution"}</h3>
      <p className="mt-3 text-sm leading-6 text-white/60">{sponsor?"Choose your package and secure your sponsorship through Stripe. Apparel artwork is subject to approval and printing deadlines.":"Choose an amount to support DMV Attack programs. This contribution is not represented as tax-deductible."}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {sponsor && <>
          <label className="sm:col-span-2 text-sm font-bold">Sponsorship package
            <select className="mt-2 w-full rounded-xl border border-white/25 bg-[#111710] px-4 py-3 text-white" value={tier} onChange={e=>setTier(e.target.value as typeof tier)}>
              {tiers.map(t=><option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </label>
          <label className="sm:col-span-2 text-sm font-bold">Business name
            <input required maxLength={160} value={businessName} onChange={e=>setBusinessName(e.target.value)} className="mt-2 w-full rounded-xl border border-white/25 bg-black px-4 py-3" placeholder="Your company"/>
          </label>
        </>}
        {!sponsor && <label className="sm:col-span-2 text-sm font-bold">Contribution amount (USD)
          <select className="mt-2 w-full rounded-xl border border-white/25 bg-[#111710] px-4 py-3" value={amount} onChange={e=>setAmount(e.target.value)}>
            {["10","25","50","75","100","200","500"].map(x=><option key={x} value={x}>${x}</option>)}
          </select>
        </label>}
        <label className="text-sm font-bold">Contact name
          <input required maxLength={120} autoComplete="name" value={contactName} onChange={e=>setContactName(e.target.value)} className="mt-2 w-full rounded-xl border border-white/25 bg-black px-4 py-3" placeholder="Full name"/>
        </label>
        <label className="text-sm font-bold">Email address
          <input required type="email" maxLength={254} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/25 bg-black px-4 py-3" placeholder="you@business.com"/>
        </label>
        {sponsor && <label className="sm:col-span-2 text-sm font-bold">Business logo (PNG, JPEG or WebP, max 2 MB)
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setLogo(e.target.files?.[0]||null)} className="mt-2 block w-full rounded-xl border border-white/25 bg-black px-4 py-3 text-sm"/>
        </label>}
        {sponsor && <label className="sm:col-span-2 text-sm font-bold">Business website (optional)
          <input type="url" maxLength={300} value={website} onChange={e=>setWebsite(e.target.value)} className="mt-2 w-full rounded-xl border border-white/25 bg-black px-4 py-3" placeholder="https://example.com"/>
        </label>}
      </div>
      <input tabIndex={-1} autoComplete="off" name="companyWebsiteHidden" className="absolute -left-[9999px]" aria-hidden="true"/>
      <label className="mt-6 flex items-start gap-3 text-xs leading-6 text-white/65">
        <input type="checkbox" required checked={agreed} onChange={e=>setAgreed(e.target.checked)} className="mt-1 accent-lime-400"/>
        <span>I understand that contributions are not advertised as tax-deductible; sponsorship logo placement is subject to approval, availability and print deadlines. A paid sponsorship does not guarantee player recruitment, playing time, or tournament outcomes.</span>
      </label>
      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      <button type="submit" disabled={pending} className="mt-6 w-full rounded-full bg-lime-400 px-7 py-4 text-xs font-black uppercase tracking-wider text-black transition hover:bg-lime-300 disabled:opacity-50">{pending?"Opening Secure Checkout…":sponsor?"Continue To Secure Sponsorship Payment":"Continue To Secure Contribution"}</button>
      <p className="mt-3 text-center text-xs text-white/45">Secure payment handled by Stripe. For assistance, email dmvattackfoundation@gmail.com.</p>
    </form>
  );
}
