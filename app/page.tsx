import Image from "next/image";
import Link from "next/link";

const programs = [
  {
    eyebrow: "01 / 7v7 Football",
    title: "Find Your Team.",
    description: "Competitive football for 10U, 12U, 14U, 15U and 18U. Build your game, compete together and prepare for what comes next.",
    image: "/fullteam.jpeg",
    href: "/tryouts",
    action: "Explore tryouts",
  },
  {
    eyebrow: "02 / Big Man 5v5",
    title: "Own The Trenches.",
    description: "O-line and D-line development at Independence High School with Norman Wallace and former NFL defensive lineman Keionta Davis.",
    image: "/defense.jpeg",
    href: "/big-man",
    action: "Meet the line coaches + sign up",
  },
  {
    eyebrow: "03 / Position Training",
    title: "Put In The Work.",
    description: "Quarterback, receiver, defensive back, speed and performance development. Position-specific work with experienced coaches.",
    image: "/Qb.jpeg",
    href: "/training",
    action: "Explore training",
  },
  {
    eyebrow: "04 / Community",
    title: "Bigger Than Football.",
    description: "Equipment, mentorship, training and opportunities beyond the field. Discover how the DMV Attack Foundation supports youth athletes.",
    image: "/DMVAttackFoundation.jpeg",
    href: "/foundation",
    action: "Explore the foundation",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section aria-labelledby="home-heading" className="relative isolate overflow-hidden border-b border-white/10 bg-[#080a06]">
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-lime-400/10 blur-[100px]" />
        <div className="relative mx-auto grid max-w-7xl lg:min-h-[690px] lg:grid-cols-[1fr_1fr]">
          <div className="relative z-10 px-4 pb-12 pt-12 sm:pt-16 md:px-8 lg:py-20">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-lime-400">
              <span className="h-2 w-2 rounded-full bg-lime-400" aria-hidden="true" />
              Northern Virginia roots. Next-level ambition.
            </div>
            <h1 id="home-heading" className="mt-7 text-[clamp(3.75rem,9vw,7rem)] font-black uppercase leading-[0.88] tracking-[-0.06em]">
              Attack<br />The <span className="text-lime-400">World.</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-8 text-white/65 md:text-lg">Build your game. Find your people. Compete with purpose. Football development for the next generation of DMV athletes—on the field and beyond it.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/tryouts" className="inline-flex items-center justify-center gap-5 rounded-full bg-lime-400 px-7 py-4 text-xs font-black uppercase tracking-wider text-black transition hover:bg-lime-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-400">Find Your Team </Link>
              <Link href="#programs" className="inline-flex items-center justify-center gap-5 rounded-full border border-white/25 px-7 py-4 text-xs font-black uppercase tracking-wider transition hover:bg-white/10">Explore Programs </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/15 pt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/45">
              <span>7v7 Football</span><span>Big Man 5v5</span><span>Position Development</span>
            </div>
          </div>
          <div className="relative mx-4 mb-8 min-h-[360px] overflow-hidden rounded-3xl sm:min-h-[460px] md:mx-8 lg:mx-0 lg:mb-0 lg:rounded-none">
            <Image src="/MECCAchamp.jpeg" alt="DMV Attack athletes celebrating together after a championship" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
            <div className="absolute left-5 top-5 rounded-full border border-white/25 bg-black/50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur sm:left-8 sm:top-8">One Team. One Standard.</div>
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">The Work Brings Us Together</p>
              <p className="mt-3 text-3xl font-black uppercase leading-none sm:text-4xl">More Than A Jersey.<br />A Place To Belong.</p>
              <Link href="/coaching" className="mt-5 inline-flex items-center gap-3 text-xs font-black uppercase tracking-wider text-white/80 hover:text-lime-400">Meet The Coaches </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section aria-label="Plan your next step" className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            { number: "01", title: "Join The Team", text: "Find your division and register for tryouts.", href: "/tryouts" },
            { number: "02", title: "Plan Your Season", text: "Explore tournament stops and the schedule.", href: "/7v7" },
            { number: "03", title: "Big Man 5v5", text: "O-line + D-line. Get details and sign up.", href: "/big-man#signup" },
          ].map((item) => (
            <Link key={item.number} href={item.href} className="group flex items-center gap-4 px-4 py-7 transition hover:bg-lime-400/[0.06] md:px-8">
              <span className="text-xs font-black text-lime-400/60">{item.number}</span>
              <div className="flex-1"><h2 className="text-sm font-black uppercase tracking-wide group-hover:text-lime-400">{item.title}</h2><p className="mt-2 text-xs leading-5 text-white/50">{item.text}</p></div>

            </Link>
          ))}
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" className="scroll-mt-24 border-b border-white/10">

        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">

          <div className="mb-10">

            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
              DMV Attack
            </div>

            <h2 className="mt-3 text-4xl font-black uppercase leading-none md:text-6xl">
              Your Game. Your Next Step.
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
              From skill positions to the trenches, find the right place to develop.
              Explore our teams, training and opportunities to get involved.
            </p>

          </div>


          <div className="grid gap-5 md:grid-cols-2">

            {programs.map((program) => (
              <Link
                key={program.title}
                href={program.href}
                className="group relative min-h-[390px] overflow-hidden rounded-[28px] border border-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-400 sm:min-h-[430px]"
              >

                <Image
                  src={program.image}
                  alt={program.title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

                <div className="absolute inset-x-0 bottom-0 p-7 md:p-9">

                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
                    {program.eyebrow}
                  </div>

                  <h3 className="mt-3 text-3xl font-black uppercase md:text-4xl">
                    {program.title}
                  </h3>

                  <p className="mt-4 max-w-lg text-sm leading-7 text-white/65">
                    {program.description}
                  </p>

                  <div className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-white transition group-hover:text-lime-400">
                    {program.action}
                  </div>

                </div>

              </Link>
            ))}

          </div>

        </div>

      </section>


      <section aria-labelledby="home-coaches" className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-9 md:px-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="home-coaches" className="text-xl font-black uppercase sm:text-2xl">Experienced Coaches. A Shared Standard.</h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/55">Meet the former college and professional athletes behind DMV Attack.</p>
          </div>
          <Link href="/coaching" className="inline-flex shrink-0 justify-center rounded-full border border-white/20 px-6 py-3 text-xs font-black uppercase tracking-wider transition hover:border-lime-400/50 hover:text-lime-400">Meet The Coaches</Link>
        </div>
      </section>

      <section aria-labelledby="home-next-step" className="bg-lime-400/[0.04]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:px-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="home-next-step" className="text-2xl font-black uppercase sm:text-3xl">Find Your Place In The Attack.</h2>
            <p className="mt-2 text-sm leading-7 text-white/55">Teams, training and opportunities for DMV athletes.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/tryouts" className="inline-flex justify-center rounded-full bg-lime-400 px-6 py-3 text-xs font-black uppercase tracking-wider text-black transition hover:bg-lime-300">Explore Tryouts</Link>
            <Link href="/contact" className="inline-flex justify-center rounded-full border border-white/20 px-6 py-3 text-xs font-black uppercase tracking-wider transition hover:bg-white/10">Get In Touch</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
