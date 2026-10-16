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

const coaches = [
  {
    name: "Tae Crews-Naylor",
    role: "Co-Founder • QB Development",
    school: "Stone Bridge High School • QB Coach",
    image: "/CoachTae.jpeg",
    instagram: "@coachtae3",
    instagramUrl: "https://www.instagram.com/coachtae3/",
  },
  {
    name: "Dante Absher",
    role: "Co-Founder • WR Development • Speed & Performance",
    school: "Independence High School • Coach",
    image: "/CoachDante.jpeg",
    instagram: "@dasp_training",
    instagramUrl: "https://www.instagram.com/dasp_training/",
  },
  {
    name: "Ross Madison",
    role: "Co-Founder • DB / Performance",
    school: "Loudoun Valley High School • Coach",
    image: "/CoachRoss.jpeg",
    instagram: "@r.a.m_training",
    instagramUrl: "https://www.instagram.com/r.a.m_training/",
  },
];

const gallery = [
  {
    src: "/10Ukid.JPEG",
    label: "10U",
  },
  {
    src: "/10u-kid.jpeg",
    label: "Next Generation",
  },
  {
    src: "/15U.JPEG",
    label: "15U",
  },
  {
    src: "/Aiden18U.JPEG",
    label: "18U",
  },
  {
    src: "/Dylan18U.JPEG",
    label: "Compete",
  },
  {
    src: "/JayB18U.JPEG",
    label: "Develop",
  },
  {
    src: "/dj18U.JPEG",
    label: "Attack",
  },
  {
    src: "/Preston.JPEG",
    label: "The DMV",
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


      {/* AGE GROUPS */}
      <section className="border-b border-white/10">

        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">

          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
                The Program
              </div>

              <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">
                A Place To Grow.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">7v7 divisions: 10U · 12U · 14U · 15U · 18U. Explore tryouts to find your athlete’s next step.</p>

            </div>

            <Link
              href="/7v7"
              className="text-xs font-black uppercase tracking-[0.18em] text-white/60 hover:text-lime-400"
            >
              View The Schedule
            </Link>

          </div>


          <div className="grid gap-5 md:grid-cols-3">

            {[
              {
                title: "10U",
                image: "/10Ukid.JPEG",
              },
              {
                title: "15U",
                image: "/15U.JPEG",
              },
              {
                title: "18U",
                image: "/Aiden18U.JPEG",
              },
            ].map((team) => (
              <div
                key={team.title}
                className="relative min-h-[350px] overflow-hidden rounded-[30px] border border-white/10"
              >

                <Image
                  src={team.image}
                  alt={`DMV Attack ${team.title}`}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                <div className="absolute bottom-0 p-7">

                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-lime-400">
                    DMV Attack
                  </div>

                  <div className="mt-2 text-5xl font-black uppercase">
                    {team.title}
                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>

      </section>


      {/* COACHES */}
      <section className="border-b border-white/10">

        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">

          <div className="mb-10">

            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
              Leadership
            </div>

            <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">
              Meet The Coaches.
            </h2>

          </div>


          <div className="grid gap-6 lg:grid-cols-3">

            {coaches.map((coach) => (
              <article
                key={coach.name}
                className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.025]"
              >

                <div className="relative h-[360px]">

                  <Image
                    src={coach.image}
                    alt={coach.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover object-top"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                </div>


                <div className="p-7">

                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400">
                    {coach.role}
                  </div>

                  <h3 className="mt-2 text-3xl font-black uppercase">
                    {coach.name}
                  </h3>

                  <div className="mt-2 text-xs font-bold uppercase tracking-wider text-white/40">
                    {coach.school}
                  </div>

                  <a
                    href={coach.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-white/70 transition hover:border-lime-400/40 hover:text-lime-400"
                  >
                    {coach.instagram}
                  </a>

                </div>

              </article>
            ))}

          </div>


          <div className="mt-8 text-center">

            <Link
              href="/coaching"
              className="inline-flex rounded-full bg-lime-400 px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-black"
            >
              Full Coaching Staff
            </Link>

          </div>

        </div>

      </section>


      {/* ATHLETE GALLERY */}
      <section className="border-b border-white/10">

        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">

          <div className="mb-10">

            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
              The Athletes
            </div>

            <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">
              This Is DMV Attack.
            </h2>

          </div>


          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

            {gallery.map((photo, index) => (
              <div
                key={photo.src}
                className={`relative overflow-hidden rounded-2xl border border-white/10 ${
                  index === 0 || index === 5
                    ? "row-span-2 min-h-[360px] sm:min-h-[520px]"
                    : "min-h-[175px] sm:min-h-[250px]"
                }`}
              >

                <Image
                  src={photo.src}
                  alt={photo.label}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                <div className="absolute bottom-0 p-4">

                  <div className="text-xs font-black uppercase tracking-[0.16em] text-white">
                    {photo.label}
                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>

      </section>


      {/* FOUNDATION */}
      <section className="border-b border-white/10">

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-2 lg:items-center">

          <div className="relative min-h-[360px] sm:min-h-[460px] overflow-hidden rounded-[32px] border border-white/10">

            <Image
              src="/DMVAttackFoundation.jpeg"
              alt="DMV Attack Foundation"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          </div>


          <div>

            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
              DMV Attack Foundation
            </div>

            <h2 className="mt-3 text-4xl font-black uppercase leading-tight md:text-6xl">
              Bigger Than Football.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/65 md:text-lg">
              Supporting youth athletes through equipment, travel,
              training, mentorship, leadership development, camps
              and community opportunities.
            </p>

            <Link
              href="/foundation"
              className="mt-8 inline-flex rounded-full bg-lime-400 px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-black"
            >
              Explore The Foundation
            </Link>

          </div>

        </div>

      </section>


      {/* FINAL CTA */}
      <section>

        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">

          <div className="relative overflow-hidden rounded-[36px] border border-lime-400/20 bg-lime-400/[0.07] p-8 md:p-14">

            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-lime-400/10 blur-3xl" />

            <div className="relative">

              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
                Attack The World
              </div>

              <h2 className="mt-3 max-w-4xl text-4xl font-black uppercase leading-tight md:text-7xl">
                Ready To Be Part Of The Attack?
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">
                Connect with DMV Attack for teams, training, camps,
                partnerships and upcoming opportunities.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <Link
                  href="/tryouts"
                  className="rounded-full bg-lime-400 px-8 py-4 text-center text-xs font-black uppercase tracking-[0.18em] text-black"
                >
                  Register For Tryouts
                </Link>

                <a
                  href="https://www.instagram.com/dmvattack_7on7/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/15 bg-black/20 px-8 py-4 text-center text-xs font-black uppercase tracking-[0.18em] text-white"
                >
                  @dmvattack_7on7
                </a>



              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
