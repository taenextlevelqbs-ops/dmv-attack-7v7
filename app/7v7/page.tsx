import Link from "next/link";
import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "7v7 Football",
  description:
    "DMV Attack 7v7 Football in Northern Virginia. Competitive teams from 8U through 18U focused on development, competition, exposure and preparing athletes for tackle football.",
};

const divisions = [
  {
    label: "8U",
    description: "Early development, confidence and competitive experience.",
  },
  {
    label: "10U",
    description: "Fundamentals, football IQ and competitive development.",
  },
  {
    label: "12U",
    description: "Position development and increased competitive reps.",
  },
  {
    label: "14U",
    description: "Preparing athletes for the transition into high school football.",
  },
  {
    label: "15U",
    description: "High school development, competition and exposure.",
  },
  {
    label: "18U",
    description: "Varsity level competition, development and exposure.",
  },
];

const featuredTeams = [
  {
    label: "10U",
    image: "/10Ukid.JPEG",
  },
  {
    label: "15U",
    image: "/15U.JPEG",
  },
  {
    label: "18U",
    image: "/Aiden18U.JPEG",
  },
];

const athletes = [
  "/10u-kid.jpeg",
  "/Dylan18U.JPEG",
  "/JayB18U.JPEG",
  "/dj18U.JPEG",
  "/Preston.JPEG",
  "/ShyChamp.jpeg",
];

const pillars = [
  {
    number: "01",
    title: "Development",
    text: "Everything starts with becoming a better football player. Athletes get position-specific coaching, competitive reps and instruction they can carry back to their school teams.",
  },
  {
    number: "02",
    title: "Competition",
    text: "Players compete against talented athletes and programs in environments that challenge technique, confidence, decision-making and consistency.",
  },
  {
    number: "03",
    title: "Exposure",
    text: "Older athletes compete in events designed to put them in competitive environments while continuing to build film, relationships and opportunities.",
  },
  {
    number: "04",
    title: "Relationships",
    text: "DMV Attack is about more than tournament weekends. Players build relationships with coaches, teammates and athletes throughout Northern Virginia and the DMV.",
  },
];

const included = [
  "5–6 tournament schedule",
  "Weekly team practices",
  "Position-specific coaching",
  "Team jerseys",
  "Photography + media",
  "Program insurance",
  "Tournament-day snacks + drinks",
  "Player development + mentorship",
];

export default function SevenOnSevenPage() {
  const tournamentSchedule = [
    {
      date: "FEB 27–28",
      title: "Duel in the DMV",
      location: "Upper Marlboro, MD",
    },
    {
      date: "MAR 13–14",
      title: "Music City Mayhem",
      location: "Murfreesboro, TN",
    },
    {
      date: "MAR 20–21",
      title: "Football City Clash",
      location: "Rock Hill, SC",
    },
    {
      date: "APR 3–4",
      title: "Virginia Frenzy",
      location: "Gainesville, VA",
    },
    {
      date: "APR 10–11",
      title: "PA Classic",
      location: "West Bradford Township, PA",
    },
    {
      date: "MAY 1–2",
      title: "National Championship",
      location: "Indianapolis, IN",
      note: "Qualification Required",
    },
  ];




  return (
    <main className="min-h-screen bg-black text-white">
      <DmvPageHeader
        eyebrow="DMV Attack"
        title="7v7 Football"
        description="Development. Competition. Exposure. An environment built to prepare athletes for their school teams and beyond."
      />

      {/* FEATURED AGE GROUPS */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">

          <div className="mb-10 max-w-3xl">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
              The Program
            </div>

            <h2 className="mt-3 text-4xl font-black uppercase leading-none md:text-6xl">
              Compete. Develop. Attack.
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/55 md:text-base">
              DMV Attack provides athletes with competitive 7v7 opportunities
              while keeping player development at the center of everything we do.
              Our goal is simple: help players become more confident, more
              technically sound and better prepared for tackle football.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {featuredTeams.map((group) => (
              <div
                key={group.label}
                className="group relative min-h-[420px] overflow-hidden rounded-3xl border border-white/10"
              >
                <img
                  src={group.image}
                  alt={`DMV Attack ${group.label}`}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />

                <div className="absolute bottom-0 p-7">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400">
                    DMV Attack
                  </div>

                  <div className="mt-2 text-5xl font-black uppercase">
                    {group.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ALL DIVISIONS */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">

          <div className="mb-10">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
              Age Divisions
            </div>

            <h2 className="mt-3 text-4xl font-black uppercase leading-none md:text-6xl">
              Built At Every Level.
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
              DMV Attack fields teams across multiple age groups so athletes can
              continue developing inside the program as they grow.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {divisions.map((division) => (
              <div
                key={division.label}
                className="rounded-3xl border border-white/10 bg-white/[0.025] p-7 transition hover:border-lime-400/30"
              >
                <div className="flex items-center justify-between">
                  <div className="text-4xl font-black uppercase">
                    {division.label}
                  </div>

                  <div className="h-3 w-3 rounded-full bg-lime-400" />
                </div>

                <p className="mt-5 text-sm leading-7 text-white/55">
                  {division.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* WHAT MAKES THE PROGRAM */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">

          <div className="mb-10">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
              The Standard
            </div>

            <h2 className="mt-3 text-4xl font-black uppercase leading-none md:text-6xl">
              More Than Tournament Reps.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {pillars.map((pillar) => (
              <div
                key={pillar.number}
                className="rounded-3xl border border-white/10 bg-white/[0.025] p-7 md:p-9"
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">
                      DMV Attack
                    </div>

                    <h3 className="mt-3 text-2xl font-black uppercase md:text-3xl">
                      {pillar.title}
                    </h3>
                  </div>

                  <div className="text-5xl font-black text-white/10">
                    {pillar.number}
                  </div>
                </div>

                <p className="mt-6 max-w-xl text-sm leading-7 text-white/55">
                  {pillar.text}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">

          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">

            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
                The Experience
              </div>

              <h2 className="mt-3 text-4xl font-black uppercase leading-none md:text-6xl">
                What&apos;s Included.
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-white/55 md:text-base">
                The DMV Attack experience is designed to cover more than tournament
                entry. Athletes receive coaching, practice opportunities, team gear,
                media and support throughout the season.
              </p>

              <div className="mt-8 inline-flex rounded-full border border-lime-400/25 bg-lime-400/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-lime-400">
                Travel + Hotel Not Included
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {included.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime-400 text-sm font-black text-black">
                    ✓
                  </div>

                  <div className="text-sm font-bold text-white/75">
                    {item}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* DEVELOPMENT */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">

          <div className="rounded-[32px] border border-lime-400/20 bg-white/[0.025] p-7 md:p-12">

            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
                  Player Development
                </div>

                <h2 className="mt-3 text-4xl font-black uppercase leading-none md:text-6xl">
                  Football Comes First.
                </h2>

                <p className="mt-6 text-sm leading-7 text-white/55 md:text-base">
                  7v7 gives athletes valuable space, coverage and one-on-one reps,
                  but the goal is not to create athletes who are only good at 7v7.
                  DMV Attack uses the format to develop skills that transfer back
                  to tackle football.
                </p>

                <p className="mt-4 text-sm leading-7 text-white/55 md:text-base">
                  Quarterbacks work on processing, timing and ball placement.
                  Receivers develop releases, route detail and coverage recognition.
                  Defensive backs work leverage, footwork, vision and ball skills.
                  Every rep should have a purpose.
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  "Position specific fundamentals",
                  "Football IQ + coverage recognition",
                  "Competitive one-on-one situations",
                  "Communication + leadership",
                  "Confidence under pressure",
                  "Skills that transfer to tackle football",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm font-bold text-white/70"
                  >
                    <span className="mr-3 text-lime-400">→</span>
                    {item}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ATHLETE GALLERY */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">

          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">
            The Athletes
          </div>

          <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">
            Built Through Reps.
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
            {athletes.map((image) => (
              <div
                key={image}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10"
              >
                <img
                  src={image}
                  alt="DMV Attack athlete"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* COACHING CTA */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">

          <div className="grid gap-5 md:grid-cols-2">

            <Link
              href="/coaching"
              className="group rounded-[32px] border border-white/10 bg-white/[0.025] p-8 transition hover:border-lime-400/30 md:p-10"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">
                Leadership
              </div>

              <h3 className="mt-4 text-3xl font-black uppercase">
                Meet The Coaches.
              </h3>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">
                Learn more about the playing experience, coaching backgrounds and
                development programs behind the DMV Attack staff.
              </p>

              <div className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-white transition group-hover:text-lime-400">
                Coaching Staff →
              </div>
            </Link>

            <Link
              href="/training"
              className="group rounded-[32px] border border-white/10 bg-white/[0.025] p-8 transition hover:border-lime-400/30 md:p-10"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">
                Development
              </div>

              <h3 className="mt-4 text-3xl font-black uppercase">
                Train Year Round.
              </h3>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">
                Quarterback, receiver, defensive back, speed and performance
                development are available outside the 7v7 season.
              </p>

              <div className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-white transition group-hover:text-lime-400">
                Training →
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* PLAYER INTEREST CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">

          <div className="relative overflow-hidden rounded-[36px] border border-lime-400/25 bg-lime-400 p-8 text-black md:p-12">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[40px] border-black/5" />

            <div className="relative">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-black/55">
                Join DMV Attack
              </div>

              <h2 className="mt-4 max-w-3xl text-4xl font-black uppercase leading-none md:text-6xl">
                Interested In Playing?
              </h2>

              <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-black/65 md:text-base">
                Send us your athlete&apos;s information so our coaching staff can
                learn more about them and keep you connected to upcoming team,
                tryout and program opportunities.
              </p>

              <Link
                href="/tryouts"
                className="mt-8 inline-flex rounded-full bg-black px-8 py-4 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:scale-[1.02]"
              >
                Register For Tryouts →
              </Link>
            </div>

          </div>
        </div>
      </section>



      <section className="border-t border-white/10 bg-black px-4 py-12 text-white md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">2027 National Circuit</div>
          <h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">Road to Nationals</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
            Follow our tournament stops from the DMV to Indianapolis. Select any stop to view its location.
          </p>
          <div className="mt-7 overflow-hidden rounded-3xl border border-lime-400/20 bg-[#0c1411] p-3 sm:p-6">
            <svg viewBox="0 0 760 440" role="img" aria-label="Map of 2027 DMV Attack tournament locations in Virginia, Maryland, Tennessee, South Carolina, Pennsylvania and Indiana" className="h-auto w-full">
              <defs>
                <pattern id="mapGrid" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M 38 0 L 0 0 0 38" fill="none" stroke="#a3e635" strokeOpacity=".09" strokeWidth="1"/></pattern>
              </defs>
              <rect width="760" height="440" rx="18" fill="#0c1411"/>
              <rect width="760" height="440" rx="18" fill="url(#mapGrid)"/>
              <text x="22" y="34" fill="#a3e635" fontSize="12" fontWeight="800" letterSpacing="3">DMV ATTACK • 2027</text>
              <text x="22" y="56" fill="#ffffff" fillOpacity=".5" fontSize="11">TOURNAMENT ROUTE • SCHEMATIC MAP</text>
              <path d="M 553 143 L 255 320 L 445 352 L 515 181 L 612 108 L 246 119" stroke="#a3e635" strokeWidth="3" strokeDasharray="9 9" fill="none" strokeLinecap="round" opacity=".85"/>
              {[
                {x:553,y:143,n:"1",city:"UPPER MARLBORO",date:"FEB 27–28",dx:-15,dy:-25},
                {x:255,y:320,n:"2",city:"MURFREESBORO",date:"MAR 13–14",dx:-95,dy:40},
                {x:445,y:352,n:"3",city:"ROCK HILL",date:"MAR 20–21",dx:20,dy:30},
                {x:515,y:181,n:"4",city:"GAINESVILLE",date:"APR 3–4",dx:-130,dy:35},
                {x:612,y:108,n:"5",city:"WEST BRADFORD",date:"APR 10–11",dx:20,dy:-14},
                {x:246,y:119,n:"★",city:"INDIANAPOLIS",date:"MAY 1–2",dx:-60,dy:-25},
              ].map((stop)=>(
                <g key={stop.city}>
                  <circle cx={stop.x} cy={stop.y} r="17" fill="#a3e635" stroke="#0c1411" strokeWidth="4"/>
                  <text x={stop.x} y={stop.y+4} fill="#111" fontSize="12" textAnchor="middle" fontWeight="900">{stop.n}</text>
                  <text x={stop.x+stop.dx} y={stop.y+stop.dy} fill="#fff" fontSize="11" fontWeight="900">{stop.city}</text>
                  <text x={stop.x+stop.dx} y={stop.y+stop.dy+15} fill="#a3e635" fontSize="10">{stop.date}</text>
                </g>
              ))}
              <text x="22" y="418" fill="#fff" fillOpacity=".4" fontSize="10">Illustrative route • not turn-by-turn navigation</text>
            </svg>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tournamentSchedule.map((event,index)=>(
              <a key={event.title} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-lime-400/50">
                <div className="text-xs font-black text-lime-400">{String(index+1).padStart(2,"0")} • {event.date}</div>
                <div className="mt-2 text-sm font-black uppercase">{event.title} ↗</div>
                <div className="mt-1 text-xs text-white/55">{event.location}</div>
                {event.note&&<div className="mt-2 text-xs font-bold text-lime-400">{event.note}</div>}
              </a>
            ))}
          </div>
          <p className="mt-5 text-xs leading-5 text-white/45">National Championship qualification is required. Dates and locations are subject to event updates.</p>
        </div>
      </section>

    </main>
  );
}
