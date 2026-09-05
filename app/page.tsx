import Image from "next/image";
import Link from "next/link";

const programs = [
  {
    eyebrow: "7v7",
    title: "Compete With DMV Attack",
    description:
      "Competitive teams, development, exposure, relationships and opportunities across Northern Virginia.",
    image: "/fullteam.jpeg",
    href: "/7v7",
  },
  {
    eyebrow: "Development",
    title: "Train With Purpose",
    description:
      "Quarterback, receiver, defensive back, speed and performance development from experienced coaches.",
    image: "/RjQb.JPEG",
    href: "/training",
  },
  {
    eyebrow: "Leadership",
    title: "Meet The Coaches",
    description:
      "Former college and professional athletes now developing the next generation of DMV players.",
    image: "/CoachTae.jpeg",
    href: "/coaching",
  },
  {
    eyebrow: "Community",
    title: "DMV Attack Foundation",
    description:
      "Resources, mentorship, equipment support, camps and opportunities beyond the football field.",
    image: "/DMVAttackFoundation.jpeg",
    href: "/foundation",
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
    role: "Co-Founder • WR Development",
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
      <section className="relative overflow-hidden border-b border-white/10">

        <div className="absolute inset-0">
          <Image
            src="/fullteam.jpeg"
            alt="DMV Attack"
            fill
            priority
            className="object-cover opacity-35"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        </div>

        <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-12 px-4 py-20 md:px-8 lg:grid-cols-[1fr_0.9fr]">

          <div>

            <div className="inline-flex rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-lime-400">
              Northern Virginia • DMV
            </div>

            <h1 className="mt-7 text-6xl font-black uppercase leading-[0.86] tracking-[-0.06em] sm:text-7xl md:text-8xl xl:text-[110px]">
              Attack
              <br />
              The
              <br />
              <span className="text-lime-400">
                World.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 md:text-lg">
              DMV Attack is built around development, competition,
              exposure, mentorship, relationships and opportunity.
              We prepare athletes to compete now and grow for what
              comes next.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/7v7"
                className="rounded-full bg-lime-400 px-8 py-4 text-center text-xs font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.02]"
              >
                Join DMV Attack →
              </Link>

              <Link
                href="/coaching"
                className="rounded-full border border-white/20 bg-black/30 px-8 py-4 text-center text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
              >
                Meet The Coaches
              </Link>

            </div>

          </div>


          <div className="grid gap-4 sm:grid-cols-2">

            <div className="relative min-h-[520px] overflow-hidden rounded-[32px] border border-white/10 sm:col-span-2">

              <Image
                src="/MECCAchamp.jpeg"
                alt="DMV Attack champions"
                fill
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-7">

                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
                  Championship Standard
                </div>

                <div className="mt-2 text-3xl font-black uppercase">
                  Built To Compete.
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* BRAND STRIP */}
      <section className="border-b border-white/10">

        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 md:grid-cols-4 md:px-8">

          {[
            ["Development", "Build the player"],
            ["Competition", "Test the work"],
            ["Exposure", "Create opportunity"],
            ["Relationships", "Build something real"],
          ].map(([title, text]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">
                {title}
              </div>

              <div className="mt-2 text-lg font-black text-white">
                {text}
              </div>
            </div>
          ))}

        </div>

      </section>


      {/* PROGRAMS */}
      <section className="border-b border-white/10">

        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">

          <div className="mb-10">

            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
              DMV Attack
            </div>

            <h2 className="mt-3 text-4xl font-black uppercase leading-none md:text-6xl">
              More Than 7v7.
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
              The organization connects competition, training, coaching,
              mentorship and community into one ecosystem.
            </p>

          </div>


          <div className="grid gap-5 md:grid-cols-2">

            {programs.map((program) => (
              <Link
                key={program.title}
                href={program.href}
                className="group relative min-h-[430px] overflow-hidden rounded-[32px] border border-white/10"
              >

                <Image
                  src={program.image}
                  alt={program.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

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
                    Explore →
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
                Built At Every Level.
              </h2>

            </div>

            <Link
              href="/7v7"
              className="text-xs font-black uppercase tracking-[0.18em] text-white/60 hover:text-lime-400"
            >
              View 7v7 Program →
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
                className="relative min-h-[470px] overflow-hidden rounded-[30px] border border-white/10"
              >

                <Image
                  src={team.image}
                  alt={`DMV Attack ${team.title}`}
                  fill
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

                <div className="relative h-[430px]">

                  <Image
                    src={coach.image}
                    alt={coach.name}
                    fill
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
                    {coach.instagram} ↗
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
              Full Coaching Staff →
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
                    ? "row-span-2 min-h-[520px]"
                    : "min-h-[250px]"
                }`}
              >

                <Image
                  src={photo.src}
                  alt={photo.label}
                  fill
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

          <div className="relative min-h-[560px] overflow-hidden rounded-[32px] border border-white/10">

            <Image
              src="/DMVAttackFoundation.jpeg"
              alt="DMV Attack Foundation"
              fill
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
              Explore The Foundation →
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
                  href="/contact"
                  className="rounded-full bg-lime-400 px-8 py-4 text-center text-xs font-black uppercase tracking-[0.18em] text-black"
                >
                  Contact DMV Attack
                </Link>

                <a
                  href="https://www.instagram.com/dmvattack_7on7/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/15 bg-black/20 px-8 py-4 text-center text-xs font-black uppercase tracking-[0.18em] text-white"
                >
                  @dmvattack_7on7 ↗
                </a>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
