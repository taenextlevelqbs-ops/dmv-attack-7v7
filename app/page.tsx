import Image from "next/image";
import Link from "next/link";

const programCards = [
  {
    title: "7v7 Program",
    text: "Competitive teams, development, exposure, and real relationships throughout the DMV.",
    href: "/7v7",
    image: "/fullteeam.jpeg",
  },
  {
    title: "QB Training",
    text: "Position-specific development and quarterback work led by Coach Tae.",
    href: "/training",
    image: "/Qb.jpeg",
  },
  {
    title: "Coaching Staff",
    text: "Meet Tae Crews-Naylor, Dante Absher, and Ross Madison.",
    href: "/coaching",
    image: "/CoachTae.jpeg",
  },
  {
    title: "Foundation",
    text: "Community impact, mentorship, support, and opportunities for young athletes.",
    href: "/foundation",
    image: "/DMVAttackFoundation.jpeg",
  },
];

const coaches = [
  {
    name: "Tae Crews Naylor",
    role: "Co Founder  •  Stone Bridge HS",
    image: "/CoachTae.jpeg",
    ig: "coachtae3",
    igUrl: "https://www.instagram.com/coachtae3/",
    bio: "Former college quarterback and current QB developer. Loudoun County High School Hall of Fame member, former Elite 11 regional quarterback, and founder focused on development, leadership, and helping DMV athletes grow on and off the field.",
  },
  {
    name: "Dante Absher",
    role: "Co Founder  •  Independence HS",
    image: "/CoachDante.jpeg",
    ig: "dasp_training",
    igUrl: "https://www.instagram.com/dasp_training/",
    bio: "Former wide receiver, Park View Hall of Fame member, and Glenville State product with pro football experience. Coach Dante brings energy, skill development, and leadership through DMV Attack, DASP Training, and Next Up Nova.",
  },
  {
    name: "Ross Madison",
    role: "Co Founder  •  Loudoun Valley",
    image: "/CoachRoss.png",
    ig: "r.a.m_training",
    igUrl: "https://www.instagram.com/r.a.m_training/",
    bio: "Former Heritage standout and University of Toledo safety who also spent time in the NFL with Washington and Denver. Ross is a performance coach and founder of RAM Training with a focus on speed, athletic movement, and complete athlete development.",
  },
];

const gallery = [
  { src: "/fullteeam.jpeg", title: "DMV Attack Team" },
  { src: "/MECCAchamp.jpeg", title: "Championship Moment" },
  { src: "/ShyChamp.jpeg", title: "Player Spotlight" },
  { src: "/defense.jpeg", title: "Defense" },
  { src: "/10Ukid.JPG", title: "10U" },
  { src: "/15U.JPEG", title: "15U" },
  { src: "/Aiden18U.JPEG", title: "18U" },
  { src: "/RjQb.JPEG", title: "QB Work" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-lime-400">
                Northern Virginia  •  DMV
              </div>

              <h1 className="mt-6 max-w-4xl text-5xl font-black uppercase leading-[0.92] tracking-[-0.04em] md:text-7xl xl:text-8xl">
                Attack
                <br />
                The
                <br />
                <span className="text-lime-400">World.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                DMV Attack is built around development, competition, exposure,
                relationships, and opportunity. We want athletes to grow their
                game, compete the right way, and represent the DMV at a high level.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/7v7"
                  className="rounded-full bg-lime-400 px-8 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.01]"
                >
                  Join DMV Attack
                </Link>

                <Link
                  href="/coaching"
                  className="rounded-full border border-white/20 bg-white/[0.03] px-8 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
                >
                  Meet The Coaches
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/45">
                    Focus
                  </p>
                  <p className="mt-3 text-2xl font-black text-white">
                    Development
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/45">
                    Standard
                  </p>
                  <p className="mt-3 text-2xl font-black text-white">
                    Compete
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/45">
                    Identity
                  </p>
                  <p className="mt-3 text-2xl font-black text-white">
                    DMV Built
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-rows-[1.15fr_0.85fr]">
              <div className="relative overflow-hidden rounded-[32px] border border-white/10">
                <Image
                  src="/fullteeam.jpeg"
                  alt="DMV Attack team"
                  width={1600}
                  height={1000}
                  className="h-[420px] w-full object-cover md:h-[520px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8">
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-lime-400">
                    Family
                  </p>
                  <h2 className="mt-2 text-3xl font-black uppercase md:text-5xl">
                    Attack The World.
                  </h2>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="relative overflow-hidden rounded-[28px] border border-white/10">
                  <Image
                    src="/MECCAchamp.jpeg"
                    alt="DMV Attack champions"
                    width={1200}
                    height={1200}
                    className="h-[240px] w-full object-cover md:h-[280px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-lime-400">
                      Champions
                    </p>
                    <p className="mt-2 text-2xl font-black uppercase">
                      Built Different.
                    </p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[28px] border border-white/10">
                  <Image
                    src="/ShyChamp.jpeg"
                    alt="DMV Attack player spotlight"
                    width={1200}
                    height={1200}
                    className="h-[240px] w-full object-cover md:h-[280px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-lime-400">
                      Player Spotlight
                    </p>
                    <p className="mt-2 text-2xl font-black uppercase">
                      Compete. Develop.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/45">
                  Teams
                </p>
                <p className="mt-2 text-4xl font-black text-lime-400">6+</p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/45">
                  Age Groups
                </p>
                <p className="mt-2 text-4xl font-black text-white">10U to 18U</p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/45">
                  Coaches
                </p>
                <p className="mt-2 text-4xl font-black text-white">3 Leaders</p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/45">
                  Mission
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  Development  •  Competition  •  Exposure
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-lime-400">
                What We Do
              </p>
              <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">
                More Than 7v7.
              </h2>
            </div>

            <p className="max-w-2xl text-base leading-8 text-white/65">
              We are building athletes through coaching, training, community,
              mentorship, and real development opportunities.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {programCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-white/20"
              >
                <Image
                  src={card.image}
                  alt={card.title}
                  width={1200}
                  height={800}
                  className="h-[260px] w-full object-cover"
                />
                <div className="p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-lime-400">
                    DMV Attack
                  </p>
                  <h3 className="mt-3 text-2xl font-black uppercase">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/65">
                    {card.text}
                  </p>
                  <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-white group-hover:text-lime-400">
                    Explore →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-lime-400">
              Coaching Staff
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">
              Meet The Coaches
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {coaches.map((coach) => (
              <div
                key={coach.name}
                className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03]"
              >
                <Image
                  src={coach.image}
                  alt={coach.name}
                  width={1200}
                  height={1200}
                  className="h-[360px] w-full object-cover object-top"
                />

                <div className="p-6 md:p-7">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-lime-400">
                    {coach.role}
                  </p>
                  <h3 className="mt-3 text-3xl font-black uppercase">
                    {coach.name}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/68">
                    {coach.bio}
                  </p>

                  <a
                    href={coach.igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-black uppercase tracking-[0.15em] text-white transition hover:border-lime-400 hover:text-lime-400"
                  >
                    @{coach.ig}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-lime-400">
                Gallery
              </p>
              <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">
                Real Photos. Big Energy.
              </h2>
            </div>

            <p className="max-w-2xl text-base leading-8 text-white/65">
              Bigger visuals on the homepage so the site actually feels alive and
              looks like DMV Attack.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {gallery.map((photo) => (
              <div
                key={photo.title + photo.src}
                className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03]"
              >
                <Image
                  src={photo.src}
                  alt={photo.title}
                  width={1200}
                  height={1400}
                  className="h-[340px] w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white">
                    {photo.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="overflow-hidden rounded-[32px] border border-white/10">
              <Image
                src="/DMVAttackFoundation.jpeg"
                alt="DMV Attack Foundation"
                width={1600}
                height={1100}
                className="h-[360px] w-full object-cover md:h-[500px]"
              />
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-lime-400">
                Foundation
              </p>
              <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">
                Bigger Than Football.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                DMV Attack Foundation is about giving back, helping athletes,
                building character, and creating more access to opportunity.
                The mission goes beyond wins and losses.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/foundation"
                  className="rounded-full bg-lime-400 px-8 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-black"
                >
                  Learn More
                </Link>

                <Link
                  href="/contact"
                  className="rounded-full border border-white/20 bg-white/[0.03] px-8 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-white"
                >
                  Connect With Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
          <div className="rounded-[36px] border border-white/10 bg-gradient-to-br from-lime-400/12 via-white/[0.03] to-white/[0.02] p-8 md:p-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-lime-400">
              Ready To Compete
            </p>
            <h2 className="mt-3 max-w-4xl text-4xl font-black uppercase md:text-6xl">
              Join The DMV Attack Movement.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 md:text-lg">
              If you want to compete, grow, and be part of something real, this
              is where it starts.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-full bg-lime-400 px-8 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-black"
              >
                Get In Touch
              </Link>

              <Link
                href="/7v7"
                className="rounded-full border border-white/20 bg-black/30 px-8 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-white"
              >
                View Program
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}