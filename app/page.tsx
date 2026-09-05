const ageGroups = ["8U", "10U", "12U", "14U", "15U", "18U"];

const includedItems = [
  "Tournament Entry",
  "Team Practices",
  "Jerseys",
  "Media Coverage",
  "Coaching",
  "Player Development",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">

          <div>
            <p className="text-xl font-black tracking-[0.16em] md:text-2xl">
              DMV ATTACK
            </p>

            <p className="mt-1 text-[9px] font-bold tracking-[0.3em] text-lime-400">
              7V7 FOOTBALL
            </p>
          </div>

          <div className="hidden items-center gap-7 text-sm font-semibold text-white/65 md:flex">
            <a href="#about" className="hover:text-white">
              About
            </a>

            <a href="#teams" className="hover:text-white">
              Teams
            </a>

            <a href="#included" className="hover:text-white">
              Program
            </a>

            <a href="#tryouts" className="hover:text-white">
              Tryouts
            </a>

            <a href="#contact" className="hover:text-white">
              Contact
            </a>
          </div>

        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px]" />

        <div className="pointer-events-none absolute -right-40 top-[-60px] h-[520px] w-[520px] rounded-full bg-lime-500/10 blur-[150px]" />

        <div className="pointer-events-none absolute left-[-180px] bottom-[-100px] h-[400px] w-[400px] rounded-full bg-yellow-400/[0.06] blur-[140px]" />

        <div className="relative mx-auto flex min-h-[760px] max-w-7xl flex-col justify-between px-6 py-16 md:px-8 md:py-20">

          <div>

            <div className="flex items-center gap-3">
              <span className="h-[2px] w-12 bg-lime-400" />

              <p className="text-[10px] font-black tracking-[0.38em] text-lime-400">
                NORTHERN VIRGINIA // DMV
              </p>
            </div>

            <h1 className="mt-8 text-6xl font-black leading-[0.84] tracking-[-0.05em] sm:text-7xl md:text-8xl lg:text-9xl">
              ATTACK
              <br />
              THE
              <br />
              <span className="text-lime-400">
                WORLD.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/65 md:text-xl">
              Competitive 7v7 football built around development,
              competition, exposure, relationships, and opportunity.
            </p>

          </div>

          <div className="mt-16 flex flex-col justify-between gap-8 border-t border-white/10 pt-8 md:flex-row md:items-end">

            <div className="flex flex-col gap-3 sm:flex-row">

              <a
                href="#tryouts"
                className="rounded-full bg-lime-400 px-7 py-3 text-center font-black text-black transition hover:scale-[1.02]"
              >
                Join DMV Attack →
              </a>

              <a
                href="#teams"
                className="rounded-full border border-white/20 px-7 py-3 text-center font-bold transition hover:bg-white hover:text-black"
              >
                View Teams
              </a>

            </div>

            <div className="text-left md:text-right">

              <p className="text-[10px] font-black tracking-[0.3em] text-yellow-300/70">
                DEVELOPMENT // COMPETITION // EXPOSURE
              </p>

              <p className="mt-2 text-sm text-white/40">
                Loudoun • Fairfax • Northern Virginia
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="px-6 py-24 md:px-8 md:py-32"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">

          <div>
            <p className="text-[10px] font-black tracking-[0.35em] text-lime-400">
              ABOUT // DMV ATTACK
            </p>

            <h2 className="mt-5 text-4xl font-black leading-[0.95] md:text-6xl">
              More Than
              <br />
              7v7.
            </h2>
          </div>

          <div>
            <p className="text-lg leading-relaxed text-white/65">
              DMV Attack gives athletes an opportunity to compete,
              develop their game, build relationships, and represent
              the DMV against strong competition.
            </p>

            <p className="mt-6 leading-relaxed text-white/45">
              The goal is bigger than tournament weekends. We want players
              learning how to compete, communicate, prepare, and grow
              alongside teammates and coaches.
            </p>
          </div>

        </div>
      </section>

      {/* AGE GROUPS */}
      <section
        id="teams"
        className="border-y border-white/10 bg-white/[0.02] px-6 py-24 md:px-8"
      >
        <div className="mx-auto max-w-7xl">

          <div className="mb-12">

            <p className="text-[10px] font-black tracking-[0.35em] text-yellow-300">
              TEAMS // AGE GROUPS
            </p>

            <h2 className="mt-4 text-4xl font-black md:text-6xl">
              Find Your Team.
            </h2>

          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

            {ageGroups.map((group, index) => (
              <div
                key={group}
                className="group rounded-2xl border border-white/10 bg-black p-6 transition hover:-translate-y-1 hover:border-lime-400/60"
              >
                <p className="text-[9px] font-black tracking-[0.3em] text-yellow-300/60">
                  {String(index + 1).padStart(2, "0")}
                </p>

                <p className="mt-5 text-4xl font-black transition group-hover:text-lime-400">
                  {group}
                </p>

                <div className="mt-5 h-[2px] w-8 bg-lime-400/60" />

                <p className="mt-4 text-xs uppercase tracking-widest text-white/35">
                  DMV Attack
                </p>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* PROGRAM */}
      <section
        id="included"
        className="px-6 py-24 md:px-8 md:py-32"
      >
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">

            <div>

              <p className="text-[10px] font-black tracking-[0.35em] text-lime-400">
                PROGRAM // INCLUDED
              </p>

              <h2 className="mt-5 text-4xl font-black md:text-6xl">
                Built for
                <br />
                Competition.
              </h2>

              <p className="mt-6 max-w-lg leading-relaxed text-white/50">
                One program. One team experience. Everything centered
                around development and competing together.
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {includedItems.map((item, index) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
                >
                  <p className="text-[9px] font-black tracking-[0.3em] text-yellow-300/60">
                    PROGRAM // {String(index + 1).padStart(2, "0")}
                  </p>

                  <p className="mt-4 text-xl font-black">
                    {item}
                  </p>

                  <div className="mt-5 h-[2px] w-10 bg-lime-400/60" />
                </div>
              ))}

            </div>

          </div>

        </div>
      </section>

      {/* TRYOUTS */}
      <section
        id="tryouts"
        className="px-6 pb-24 md:px-8 md:pb-32"
      >
        <div className="mx-auto max-w-7xl">

          <div className="relative overflow-hidden rounded-[32px] border border-lime-400/30 bg-lime-400 p-8 text-black md:p-14">

            <div className="pointer-events-none absolute -right-12 -top-20 text-[160px] font-black leading-none text-black/[0.06] md:text-[240px]">
              7V7
            </div>

            <div className="relative">

              <p className="text-[10px] font-black tracking-[0.35em] text-black/60">
                TRYOUTS // DMV ATTACK
              </p>

              <h2 className="mt-5 text-5xl font-black leading-[0.9] md:text-7xl">
                READY TO
                <br />
                ATTACK?
              </h2>

              <p className="mt-6 max-w-2xl text-base font-medium text-black/70 md:text-lg">
                Tryout information, registration, dates, and team openings
                will be posted here.
              </p>

              <a
                href="mailto:taenextlevelqbs@gmail.com?subject=DMV%20Attack%207v7"
                className="mt-8 inline-block rounded-full bg-black px-8 py-4 font-black text-white"
              >
                Contact DMV Attack →
              </a>

            </div>

          </div>

        </div>
      </section>

      {/* APPAREL */}
      <section className="border-t border-white/10 px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">

          <p className="text-[10px] font-black tracking-[0.35em] text-yellow-300">
            DMV ATTACK // APPAREL
          </p>

          <div className="mt-5 flex flex-col justify-between gap-8 md:flex-row md:items-end">

            <h2 className="text-4xl font-black md:text-6xl">
              Wear the Brand.
            </h2>

            <a
              href="https://dmvattack.myshopify.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-7 py-3 text-center font-black text-black transition hover:bg-lime-400"
            >
              Shop DMV Attack →
            </a>

          </div>

        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="border-t border-white/10 px-6 py-24 text-center md:px-8"
      >
        <div className="mx-auto max-w-3xl">

          <p className="text-[10px] font-black tracking-[0.35em] text-lime-400">
            CONTACT // DMV ATTACK
          </p>

          <h2 className="mt-5 text-4xl font-black md:text-6xl">
            Attack the Opportunity.
          </h2>

          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-white/50">
            Questions about teams, tryouts, registration, partnerships,
            or DMV Attack 7v7?
          </p>

          <a
            href="mailto:taenextlevelqbs@gmail.com?subject=DMV%20Attack%207v7"
            className="mt-8 inline-block rounded-full bg-lime-400 px-8 py-4 font-black text-black"
          >
            Contact Us →
          </a>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-center md:flex-row md:items-center md:text-left">

          <div>

            <p className="font-black tracking-[0.18em]">
              DMV ATTACK
            </p>

            <p className="mt-2 text-[10px] tracking-[0.25em] text-lime-400/60">
              ATTACK THE WORLD
            </p>

          </div>

          <p className="text-xs text-white/25">
            © 2026 DMV Attack 7v7. All Rights Reserved.
          </p>

        </div>
      </footer>

    </main>
  );
}