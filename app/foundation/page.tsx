import FoundationCheckoutForm from "@/components/foundation-checkout-form";
import { stripeDatabase } from "@/lib/finance/stripe";
import Image from "next/image";
import Link from "next/link";
import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Foundation",
  description:
    "The DMV Attack Foundation supports youth athletes throughout Northern Virginia and the DMV through equipment, travel assistance, camps, mentorship, training and community opportunities.",
};

const initiatives = [
  {
    title: "Equipment + Uniform Support",
    text: "Helping athletes and families access football equipment, uniforms and other resources that can remove barriers to participation.",
  },
  {
    title: "Travel Assistance",
    text: "Supporting qualifying athletes and families with travel-related needs connected to football opportunities, events and development.",
  },
  {
    title: "Free Camps",
    text: "Creating opportunities for young athletes to receive quality instruction, compete, learn and experience the game without cost being the barrier.",
  },
  {
    title: "Training + Development",
    text: "Connecting athletes with football instruction, position development and athletic training designed to help them continue improving.",
  },
  {
    title: "Mentorship",
    text: "Providing athletes with access to coaches and mentors who can help guide them through football, school, leadership and personal growth.",
  },
  {
    title: "Leadership + Character",
    text: "Using football as a platform to develop accountability, confidence, discipline, teamwork and leadership beyond the field.",
  },
];

export const dynamic = "force-dynamic";
export default async function FoundationPage() {
  const paymentsEnabled = process.env.FOUNDATION_PAYMENTS_ENABLED === "true" && Boolean(process.env.FOUNDATION_STRIPE_SECRET_KEY && process.env.FOUNDATION_STRIPE_WEBHOOK_SECRET);
  let sponsors: Array<{id:string;business_name:string;website:string|null;logo_path:string|null;tier:string|null;logo_url?:string|null}> = [];
  try {
    if (process.env.SUPABASE_SECRET_KEY) {
      const db = stripeDatabase();
      const {data} = await db.from("foundation_contributions").select("id,business_name,website,logo_path,tier").eq("kind","SPONSORSHIP").eq("status","PAID").eq("sponsor_approved",true).eq("published",true).order("created_at",{ascending:false}).limit(100);
      sponsors = await Promise.all((data || []).map(async (item) => {
        if (!item.logo_path) return {...item, logo_url:null};
        const {data:signed} = await db.storage.from("foundation-logos").createSignedUrl(item.logo_path, 3600);
        return {...item,logo_url:signed?.signedUrl || null};
      }));
    }
  } catch { /* Sponsor list is optional if database unavailable. */ }
  return (
    <main className="min-h-screen bg-black text-white">
      <DmvPageHeader
        eyebrow="DMV Attack Foundation"
        title="Impact Beyond Football"
        description="Supporting youth athletes with resources, development, mentorship and opportunities throughout Northern Virginia and the DMV."
      />

      {/* Business sponsorships are displayed first for easy access. Payments require verified Stripe configuration. */}
      <section id="sponsor" className="scroll-mt-24 border-b border-white/10 bg-[#0b1008]">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-lime-400">2027 Business Partnerships</p>
          <h2 className="mt-3 max-w-4xl text-4xl font-black uppercase leading-tight md:text-6xl">Put Your Business Behind The Next Generation.</h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/70">Partner with DMV Attack to support athlete development, equipment, mentorship and travel opportunities. Select a season sponsorship below and business logos are reviewed before publication and apparel placement depends on printing schedules.</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {[
              {name:"Bronze",price:"$250",subtitle:"Community Supporter",perks:["Business logo and link in the sponsor directory","Social media sponsor thank-you","Digital sponsorship recognition"],featured:false},
              {name:"Silver",price:"$500",subtitle:"Team Partner",perks:["Everything in Bronze","Business logo on team warmup shirts","Featured website sponsor listing","Two social media recognition posts"],featured:true},
              {name:"Gold",price:"$1,000",subtitle:"Official Season Partner",perks:["Everything in Silver","Priority larger warmup logo placement","Featured sponsor placement on the homepage","Dedicated business spotlight","Season-long sponsor recognition"],featured:false}
            ].map(tier => (
              <article key={tier.name} className={`flex flex-col rounded-[28px] border p-7 md:p-9 ${tier.featured?"border-lime-400 bg-lime-400/[0.08]":"border-white/15 bg-white/[0.03]"}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black uppercase tracking-widest text-lime-400">{tier.name}</p>
                  {tier.featured && <span className="rounded-full bg-lime-400 px-3 py-1 text-[10px] font-black uppercase text-black">Popular</span>}
                </div>
                <p className="mt-5 text-5xl font-black">{tier.price}</p>
                <p className="mt-2 text-sm text-white/60">{tier.subtitle} · 2027 season</p>
                <ul className="mt-7 flex-1 space-y-3">
                  {tier.perks.map(perk => <li key={perk} className="flex gap-3 text-sm leading-6 text-white/80"><span className="shrink-0 text-lime-400">✓</span><span>{perk}</span></li>)}
                </ul>
                <a href={`?sponsor=${tier.name.toUpperCase()}#foundation-checkout`} className="mt-9 inline-flex justify-center rounded-full bg-lime-400 px-6 py-4 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-300">Select {tier.name} Sponsorship</a>
              </article>
            ))}
          </div>
          <div id="foundation-checkout" className="mt-10 scroll-mt-24">{paymentsEnabled ? <FoundationCheckoutForm kind="SPONSORSHIP" /> : <div className="rounded-[28px] border border-lime-400/25 p-8"><h3 className="text-2xl font-black uppercase">Reserve Your Sponsorship</h3><p className="mt-4 text-sm leading-7 text-white/70">Online sponsorship payments are being prepared. Contact our Foundation team to reserve a package, confirm artwork and learn about availability.</p><a href="mailto:dmvattackfoundation@gmail.com?subject=2027%20Business%20Sponsorship" className="mt-6 inline-flex rounded-full bg-lime-400 px-7 py-4 text-xs font-black uppercase text-black">Contact Sponsorship Team</a></div>}</div>
          <p className="mt-6 text-xs leading-6 text-white/50">Sponsorship benefits depend on final artwork approval, production deadlines, available placement and a written agreement. Logo placement is not guaranteed until confirmed. Fees and benefits are proposed for the 2027 season.</p>
        </div>
      </section>
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="relative min-h-[420px] overflow-hidden rounded-[32px] border border-white/10">
              <Image
                src="/DMVAttackFoundation.jpeg"
                alt="DMV Attack Foundation"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
                Our Mission
              </div>

              <h2 className="mt-3 text-4xl font-black uppercase leading-none md:text-6xl">
                Opportunity Should Not Stop At The Sideline.
              </h2>

              <p className="mt-6 text-sm leading-7 text-white/60 md:text-base">
                The DMV Attack Foundation supports youth athletes through
                equipment, uniforms, travel assistance, training, mentorship,
                leadership development, free camps and community opportunities.
              </p>

              <p className="mt-4 text-sm leading-7 text-white/60 md:text-base">
                Our goal is to help young athletes continue participating,
                developing and pursuing opportunities regardless of the financial
                or logistical barriers that may stand in their way.
              </p>

              <a
                href="mailto:dmvattackfoundation@gmail.com"
                className="mt-8 inline-flex rounded-full bg-lime-400 px-7 py-4 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:scale-[1.02]"
              >
                Email The Foundation
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="mb-10">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
              What We Support
            </div>

            <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">
              Building Access.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {initiatives.map((item, index) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/[0.025] p-7"
              >
                <div className="text-sm font-black text-lime-400">
                  0{index + 1}
                </div>

                <h3 className="mt-5 text-2xl font-black uppercase">
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-white/70">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="rounded-[32px] border border-lime-400/20 bg-white/[0.025] p-7 md:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
                  Community
                </div>

                <h2 className="mt-3 text-4xl font-black uppercase md:text-5xl">
                  More Than The Game.
                </h2>

                <p className="mt-5 text-sm leading-7 text-white/70 md:text-base">
                  Football can open doors, build confidence and create lifelong
                  relationships. The Foundation exists to help make sure more
                  young athletes have access to those experiences.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Youth Development",
                  "Community Camps",
                  "Mentorship",
                  "Leadership",
                  "Athlete Resources",
                  "Family Support",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm font-bold text-white/70"
                  >
                    <span className="mr-3 text-lime-400">•</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      <section id="donate" className="scroll-mt-24 border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-lime-400">Give Back</p>
            <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">Every Athlete Deserves Opportunity.</h2>
            <p className="mt-6 text-base leading-8 text-white/70">Not a business owner? You can still support equipment assistance, athlete development, camps and travel opportunities. Reach our team to arrange a contribution or discuss how your gift can make an impact.</p>
            <p className="mt-4 text-sm leading-7 text-white/50">Contributions are not represented as tax-deductible unless the organization has confirmed the applicable tax status. We will share payment details only through a verified DMV Attack channel.</p>
          </div>
          {paymentsEnabled ? <FoundationCheckoutForm kind="CONTRIBUTION" /> : <div className="rounded-[28px] border border-lime-400/20 bg-white/[0.03] p-8"><h3 className="text-2xl font-black uppercase">Support DMV Attack</h3><p className="mt-4 text-sm leading-7 text-white/70">Secure online contributions are being prepared. Contact us to discuss a gift supporting youth athletic development.</p><a href="mailto:dmvattackfoundation@gmail.com?subject=Community%20Contribution" className="mt-6 inline-flex rounded-full bg-lime-400 px-7 py-4 text-xs font-black uppercase text-black">Contact The Foundation</a></div>}
        </div>
      </section>
      <section id="our-sponsors" className="scroll-mt-24 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-lime-400">Community Partners</p>
          <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">Our Sponsors.</h2>
          {sponsors.length > 0 ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sponsors.map(sponsor => {
                const logo = sponsor.logo_url;
                const validUrl = sponsor.website && (sponsor.website.startsWith("https://") || sponsor.website.startsWith("http://")) ? sponsor.website : null;
                return <div key={sponsor.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 text-center">
                  {logo && <img src={logo} alt={`${sponsor.business_name} logo`} loading="lazy" className="mx-auto mb-5 h-24 w-full object-contain" />}
                  <h3 className="text-xl font-black uppercase">{sponsor.business_name}</h3>
                  <p className="mt-2 text-xs uppercase tracking-widest text-lime-400">{sponsor.tier} Partner</p>
                  {validUrl && <a href={validUrl} target="_blank" rel="noopener noreferrer nofollow sponsored" className="mt-4 inline-flex text-sm font-semibold text-white/75 underline underline-offset-4 hover:text-lime-400">Visit Business Website</a>}
                </div>;
              })}
            </div>
          ) : (<div className="mt-8 rounded-[28px] border border-dashed border-white/20 p-9 text-center">
            <p className="text-lg font-bold">The 2027 sponsor lineup is coming together.</p>
            <p className="mt-3 text-sm leading-7 text-white/60">Approved businesses will be featured here with their logos and website links. Be among the first to back DMV Attack.</p>
            <a href="#sponsor" className="mt-6 inline-flex rounded-full border border-lime-400/50 px-6 py-3 text-xs font-black uppercase tracking-wider text-lime-400">Explore Sponsorships</a>
          </div>
          )}
        </div>
      </section>
      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="rounded-[32px] bg-lime-400 p-8 text-black md:p-12">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-black/55">
              Connect With Us
            </div>

            <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl">
              Support. Partner. Get Involved.
            </h2>

            <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-black/65 md:text-base">
              For community partnerships, donations, athlete assistance,
              volunteer opportunities or Foundation questions, contact our team.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:dmvattackfoundation@gmail.com"
                className="rounded-full bg-black px-7 py-4 text-center text-xs font-black uppercase tracking-[0.16em] text-white"
              >
                Email The Foundation
              </a>

              <Link
                href="/camps"
                className="rounded-full border border-black/20 px-7 py-4 text-center text-xs font-black uppercase tracking-[0.16em] text-black"
              >
                View Camps
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
