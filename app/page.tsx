import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Northern Virginia Youth Football & 7v7",
  description:
    "DMV Attack develops youth football players across Northern Virginia and the DMV with 7v7 teams, position training, tryouts, coaching and mentorship.",
};

const programs = [
  {
    number: "01",
    eyebrow: "The competition",
    title: "7v7 Football",
    description:
      "Team competition from 8U through 18U, with development and preparation at the center of every season.",
    image: "/MECCAchamp.jpeg",
    href: "/7v7",
    alt: "DMV Attack champions celebrating as a team",
  },
  {
    number: "02",
    eyebrow: "The craft",
    title: "Player Training",
    description:
      "Position-specific work for quarterbacks, receivers and defensive backs, with speed and performance training too.",
    image: "/Qb.jpeg",
    href: "/training",
    alt: "DMV Attack quarterback preparing for a throw",
  },
  {
    number: "03",
    eyebrow: "The people",
    title: "Meet The Coaches",
    description:
      "Get to know the staff and the experience behind the coaching and player development program.",
    image: "/CoachTae.jpeg",
    href: "/coaching",
    alt: "DMV Attack coach Tae Crews-Naylor",
  },
  {
    number: "04",
    eyebrow: "Beyond the game",
    title: "DMV Attack Foundation",
    description:
      "Community support, mentorship, equipment resources, camps and opportunities beyond the field.",
    image: "/DMVAttackFoundation.jpeg",
    href: "/foundation",
    alt: "DMV Attack Foundation community program",
  },
];

const coaches = [
  {
    name: "Tae Crews-Naylor",
    role: "Co-Founder · Quarterback Development",
    school: "Stone Bridge High School · QB Coach",
    image: "/CoachTae.jpeg",
    instagram: "@coachtae3",
    instagramUrl: "https://www.instagram.com/coachtae3/",
  },
  {
    name: "Dante Absher",
    role: "Co-Founder · Wide Receiver Development",
    school: "Independence High School · Coach",
    image: "/CoachDante.jpeg",
    instagram: "@dasp_training",
    instagramUrl: "https://www.instagram.com/dasp_training/",
  },
  {
    name: "Ross Madison",
    role: "Co-Founder · Defensive Back / Performance",
    school: "Loudoun Valley High School · Coach",
    image: "/CoachRoss.jpeg",
    instagram: "@r.a.m_training",
    instagramUrl: "https://www.instagram.com/r.a.m_training/",
  },
];

const gallery = [
  { src: "/10Ukid.JPEG", label: "10U" },
  { src: "/10u-kid.jpeg", label: "Next Generation" },
  { src: "/15U.JPEG", label: "15U" },
  { src: "/Aiden18U.JPEG", label: "18U" },
  { src: "/Dylan18U.JPEG", label: "Compete" },
  { src: "/JayB18U.JPEG", label: "Develop" },
  { src: "/dj18U.JPEG", label: "Attack" },
  { src: "/Preston.JPEG", label: "The DMV" },
];

const familySteps = [
  {
    number: "01",
    title: "Choose an age group",
    description: "Review the tryout dates and divisions for your athlete.",
  },
  {
    number: "02",
    title: "Share athlete details",
    description: "Complete the family form and upload a recent athlete photo.",
  },
  {
    number: "03",
    title: "Keep your Tryout ID",
    description: "Use the ID assigned after submission for check-in and updates.",
  },
];

const values = [
  ["Development", "Build the player"],
  ["Competition", "Test the work"],
  ["Exposure", "Create opportunity"],
  ["Relationships", "Build something real"],
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080a08] text-white">
      <section className="relative border-b border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(90deg,transparent_49.8%,rgba(255,255,255,0.14)_50%,transparent_50.2%),linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:100%_100%,100%_92px]"
        />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-5 pb-12 pt-14 sm:px-8 md:gap-12 md:pb-16 md:pt-20 lg:grid-cols-[1fr_0.92fr] lg:px-12 lg:py-16">
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-extrabold uppercase tracking-[0.24em] text-lime-300">
              <span>Northern Virginia</span>
              <span aria-hidden="true" className="text-white/25">/</span>
              <span>The DMV</span>
              <span aria-hidden="true" className="text-white/25">/</span>
              <span>8U—18U</span>
            </div>

            <h1 className="mt-7 max-w-4xl text-[clamp(3.75rem,12vw,8.75rem)] font-black uppercase leading-[0.78] tracking-[-0.075em]">
              Built To
              <br />
              <span className="text-lime-400">Attack.</span>
            </h1>

            <div className="mt-7 flex items-start gap-4 sm:mt-9">
              <span aria-hidden="true" className="mt-1 h-12 w-1 shrink-0 bg-lime-400" />
              <p className="max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
                A Northern Virginia football community built around player
                development, competitive 7v7, mentorship and opportunity.
                Helping young athletes take their next step—on the field and
                beyond it.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/tryouts"
                className="inline-flex min-h-14 items-center justify-center gap-3 bg-lime-400 px-7 text-center text-xs font-black uppercase tracking-[0.15em] text-black transition hover:bg-lime-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Register for tryouts <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/7v7"
                className="inline-flex min-h-14 items-center justify-center border border-white/25 px-7 text-center text-xs font-black uppercase tracking-[0.15em] text-white transition hover:border-lime-400 hover:text-lime-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Explore 7v7
              </Link>
            </div>

            <p className="mt-4 max-w-xl text-xs leading-6 text-white/40">
              Families can register now. Official tryout times will be shared
              when they are finalized.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:ml-auto lg:mr-0">
            <div className="absolute -left-3 top-8 bottom-8 hidden w-px bg-lime-400/70 sm:block" />
            <div className="relative aspect-[1.02/1] overflow-hidden border border-white/15 bg-[#161a16] sm:aspect-[1.08/1]">
              <Image
                src="/fullteam.jpeg"
                alt="DMV Attack athletes representing multiple age divisions"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.23em] text-lime-300">
                    Northern Virginia · 7v7
                  </div>
                  <p className="mt-2 text-2xl font-black uppercase leading-none sm:text-4xl">
                    One team.<br className="sm:hidden" /> Every level.
                  </p>
                </div>
                <span className="hidden border-l border-white/35 pl-4 text-[10px] font-bold uppercase leading-5 tracking-[0.15em] text-white/75 sm:block">
                  Development<br />Competition<br />Community
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
              <span>DMV Attack</span>
              <span>Attack the world</span>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="tryout-dates" className="border-b border-white/10 bg-[#0d110d]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center md:px-12 md:py-9">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-lime-300">
              2027 season · family registration
            </p>
            <h2 id="tryout-dates" className="mt-2 text-2xl font-black uppercase tracking-tight sm:text-3xl">
              Start with tryouts.
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Independence High School · Brambleton, Virginia
            </p>
          </div>
          <div className="grid gap-0 border-y border-white/15 sm:grid-cols-2 sm:border-y-0 sm:border-l">
            <div className="border-b border-white/15 py-4 sm:border-b-0 sm:px-6 sm:py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-lime-300">Youth · 8U—14U</p>
              <p className="mt-2 text-lg font-black uppercase">Sunday, November 8</p>
            </div>
            <div className="py-4 sm:border-l sm:border-white/15 sm:px-6 sm:py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-lime-300">High school · 15U—18U</p>
              <p className="mt-2 text-lg font-black uppercase">Sunday, November 22</p>
            </div>
            <p className="border-t border-white/10 py-3 text-xs leading-5 text-white/40 sm:col-span-2 sm:ml-6 sm:pl-0">
              Times are still being finalized. View tryout details and register your athlete.
              <Link href="/tryouts" className="ml-2 inline-flex min-h-10 items-center font-bold text-lime-300 underline decoration-lime-300/40 underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400">
                Tryout information →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="family-guide" className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:px-12 md:py-20">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-lime-300">A clear first step</p>
              <h2 id="family-guide" className="mt-3 max-w-xl text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-5xl">
                New to<br className="hidden sm:block" /> DMV Attack?
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
              Registration lets our staff review your athlete&apos;s background and
              gives your family a direct way to receive tryout updates. You do
              not need to create a portal account to submit a tryout form.
            </p>
          </div>
          <ol className="mt-9 grid border-t border-white/15 md:grid-cols-3">
            {familySteps.map((step, index) => (
              <li key={step.number} className={`py-6 md:pr-7 ${index > 0 ? "border-t border-white/15 md:border-l md:border-t-0 md:pl-7" : ""}`}>
                <span className="text-[11px] font-black tracking-[0.18em] text-lime-300">{step.number}</span>
                <h3 className="mt-4 text-lg font-black uppercase">{step.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-white/50">{step.description}</p>
              </li>
            ))}
          </ol>
          <Link
            href="/tryouts"
            className="inline-flex min-h-12 items-center border-b border-lime-300/60 text-xs font-black uppercase tracking-[0.15em] text-lime-300 transition hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
          >
            Review registration details <span aria-hidden="true" className="ml-3">→</span>
          </Link>
          <div className="mt-10 grid grid-cols-2 border-t border-white/15 sm:grid-cols-4">
            {values.map(([title, description], index) => (
              <div
                key={title}
                className={`py-4 pr-3 ${index % 2 === 1 ? "border-l border-white/15 pl-3" : ""} ${index > 1 ? "border-t border-white/15" : ""} ${index === 0 ? "sm:border-l-0" : "sm:border-l sm:border-white/15 sm:pl-5"} sm:border-t-0`}
              >
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-lime-300">{title}</p>
                <p className="mt-1 text-sm font-semibold text-white/70 sm:text-base">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="programs" className="border-b border-white/10 bg-[#0d110d]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:px-12 md:py-20">
          <div className="flex flex-col gap-5 border-b border-white/15 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-lime-300">A complete player pathway</p>
              <h2 id="programs" className="mt-3 text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl">
                More than 7v7.
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-white/50">
              Competition is one part of the experience. Explore how training,
              coaching and community connect around the athlete.
            </p>
          </div>

          <div className="mt-4 divide-y divide-white/15">
            {programs.map((program) => (
              <Link
                key={program.number}
                href={program.href}
                className="group grid gap-4 py-6 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 md:grid-cols-[52px_minmax(0,0.82fr)_minmax(220px,0.72fr)_minmax(160px,0.55fr)_24px] md:items-center md:gap-6 md:py-7"
              >
                <span className="hidden text-xs font-black tracking-[0.18em] text-lime-300 md:block">{program.number}</span>
                <div className="grid grid-cols-[84px_1fr] items-center gap-4 sm:grid-cols-[112px_1fr] md:contents">
                  <div className="relative aspect-square overflow-hidden bg-white/5 md:order-none md:col-start-2 md:row-span-2 md:aspect-[1.5/1]">
                    <Image
                      src={program.image}
                      alt={program.alt}
                      fill
                      sizes="(max-width: 768px) 112px, 220px"
                      className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none"
                    />
                  </div>
                  <div className="md:col-start-3">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-lime-300">{program.eyebrow}</span>
                    <h3 className="mt-2 text-xl font-black uppercase leading-tight sm:text-2xl">{program.title}</h3>
                  </div>
                </div>
                <p className="max-w-md text-sm leading-6 text-white/50 md:col-start-4 md:row-span-2">{program.description}</p>
                <span aria-hidden="true" className="hidden text-xl text-white/50 transition group-hover:translate-x-1 group-hover:text-lime-300 md:block">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="age-groups" className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:px-12 md:py-20">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-lime-300">Grow with the program</p>
              <h2 id="age-groups" className="mt-3 text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl">Every level. One standard.</h2>
            </div>
            <Link href="/7v7" className="min-h-11 self-start text-xs font-black uppercase tracking-[0.15em] text-white/60 underline decoration-white/25 underline-offset-4 transition hover:text-lime-300 sm:self-auto">
              Explore the 7v7 program →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {[
              { title: "10U", image: "/10Ukid.JPEG", alt: "DMV Attack 10U athlete" },
              { title: "15U", image: "/15U.JPEG", alt: "DMV Attack 15U athlete" },
              { title: "18U", image: "/Aiden18U.JPEG", alt: "DMV Attack 18U athlete" },
            ].map((team, index) => (
              <div key={team.title} className={`relative min-h-64 overflow-hidden bg-[#161a16] sm:min-h-[380px] ${index === 2 ? "col-span-2 md:col-span-1" : ""}`}>
                <Image src={team.image} alt={team.alt} fill sizes="(max-width: 767px) 50vw, 33vw" className="object-cover transition duration-700 hover:scale-[1.03] motion-reduce:transition-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 border-t border-white/25 p-5 sm:p-7">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-lime-300">DMV Attack · 7v7</p>
                  <p className="mt-2 text-4xl font-black uppercase sm:text-6xl">{team.title}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-white/35">Current team divisions and tryout information are listed on the 7v7 and registration pages.</p>
        </div>
      </section>

      <section aria-labelledby="coaches" className="border-b border-white/10 bg-[#0d110d]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:px-12 md:py-20">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-lime-300">The people behind the work</p>
              <h2 id="coaches" className="mt-3 text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl">Coached with purpose.</h2>
            </div>
            <Link href="/coaching" className="min-h-11 self-start text-xs font-black uppercase tracking-[0.15em] text-white/60 underline decoration-white/25 underline-offset-4 transition hover:text-lime-300 sm:self-auto">Full coaching staff →</Link>
          </div>
          <div className="grid gap-7 border-t border-white/15 pt-6 md:grid-cols-3 md:gap-5">
            {coaches.map((coach, index) => (
              <article key={coach.name} className="grid grid-cols-[100px_1fr] gap-4 sm:grid-cols-[140px_1fr] md:block">
                <div className="relative aspect-[4/5] overflow-hidden bg-white/5 md:aspect-[0.92/1]">
                  <Image src={coach.image} alt={coach.name} fill sizes="(max-width: 767px) 140px, 30vw" className="object-cover object-top" />
                </div>
                <div className="py-1 md:pt-5">
                  <p className="text-[9px] font-black uppercase leading-5 tracking-[0.16em] text-lime-300">0{index + 1} · {coach.role}</p>
                  <h3 className="mt-2 text-lg font-black uppercase leading-tight sm:text-xl">{coach.name}</h3>
                  <p className="mt-2 text-[10px] font-bold uppercase leading-5 tracking-[0.08em] text-white/40">{coach.school}</p>
                  <a href={coach.instagramUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-10 items-center text-xs font-bold text-white/65 underline decoration-white/25 underline-offset-4 transition hover:text-lime-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400">{coach.instagram} →</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="athletes" className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:px-12 md:py-20">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-lime-300">The athletes</p>
              <h2 id="athletes" className="mt-3 text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl">This is DMV Attack.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-white/45">A look at the players, teams and moments that make up the DMV Attack community.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {gallery.map((photo, index) => (
              <div key={photo.src} className={`relative overflow-hidden bg-[#161a16] ${index === 0 || index === 5 ? "row-span-2 aspect-[0.72/1]" : "aspect-[1/1]"}`}>
                <Image src={photo.src} alt={`DMV Attack — ${photo.label}`} fill sizes="(max-width: 639px) 50vw, 25vw" className="object-cover transition duration-500 hover:scale-[1.04] motion-reduce:transition-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-0 left-0 right-0 border-t border-white/25 px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] sm:px-4 sm:py-3 sm:text-[10px]">{photo.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="foundation" className="border-b border-white/10 bg-[#0d110d]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:px-12 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative aspect-[1.2/1] overflow-hidden bg-[#161a16] sm:aspect-[1.4/1]">
            <Image src="/DMVAttackFoundation.jpeg" alt="DMV Attack Foundation supporting the community" fill sizes="(max-width: 1023px) 100vw, 55vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            <span className="absolute bottom-4 left-4 border border-white/40 px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em]">Beyond the field</span>
          </div>
          <div className="lg:pl-8">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-lime-300">DMV Attack Foundation</p>
            <h2 id="foundation" className="mt-3 max-w-xl text-4xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl">Stronger than the game.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/55">
              The Foundation supports youth athletes through equipment,
              mentorship, camps, leadership development and community
              opportunities. The work continues beyond tournament weekends.
            </p>
            <Link href="/foundation" className="mt-7 inline-flex min-h-12 items-center gap-3 border-b border-lime-300/70 text-xs font-black uppercase tracking-[0.15em] text-lime-300 transition hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400">
              Learn about the Foundation <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute -right-32 -top-20 h-[26rem] w-[26rem] rounded-full border border-lime-400/10" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-[1fr_auto] md:items-end md:px-12 md:py-20">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-lime-300">Take the next step</p>
            <h2 className="mt-3 max-w-4xl text-4xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl">Ready to join the attack?</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
              Register for tryouts, meet the coaches or get in touch with our team
              about training, camps, girls flag and other opportunities.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <Link href="/tryouts" className="inline-flex min-h-14 items-center justify-center bg-lime-400 px-7 text-xs font-black uppercase tracking-[0.15em] text-black transition hover:bg-lime-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black">Register for tryouts →</Link>
            <Link href="/contact" className="inline-flex min-h-14 items-center justify-center border border-white/25 px-7 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:border-lime-400 hover:text-lime-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black">Contact DMV Attack</Link>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-3 border-t border-white/15 pt-5 md:col-span-2">
            <a href="https://www.instagram.com/dmvattack_7on7/" target="_blank" rel="noreferrer" className="min-h-10 inline-flex items-center text-xs font-bold text-white/55 underline decoration-white/20 underline-offset-4 hover:text-lime-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400">@dmvattack_7on7 →</a>
            <a href="https://dmvattack.com" target="_blank" rel="noreferrer" className="min-h-10 inline-flex items-center text-xs font-bold text-white/55 underline decoration-white/20 underline-offset-4 hover:text-lime-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400">DMVAttack.com →</a>
          </div>
        </div>
      </section>
    </main>
  );
}
