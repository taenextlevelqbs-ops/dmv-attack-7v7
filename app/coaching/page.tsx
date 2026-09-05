import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Coaching Staff",
};

type StaffMember = {
  number: string;
  name: string;
  title: string;
  highSchoolRole: string;
  photo: string;
  instagram: string;
  instagramUrl: string;
  bio: string;
  playing: string[];
  development: string[];
};

const staff: StaffMember[] = [
  {
    number: "01",

    name: "Tae Crews-Naylor",

    title:
      "Co-Founder | QB Development | Offensive Development",

    highSchoolRole:
      "QB Coach • Stone Bridge High School",

    photo:
      "/CoachTae.jpeg",

    instagram:
      "@coachtae3",

    instagramUrl:
      "https://www.instagram.com/coachtae3/",

    bio:
      "Tae Crews-Naylor brings quarterback experience, offensive knowledge, and player development to DMV Attack. A former college quarterback, Tae now develops quarterbacks and offensive players through high school coaching, private quarterback training, and DMV Attack.",

    playing: [
      "Loudoun County High School",
      "Fairmont State University • Quarterback",
      "2019 NCAA Passing Efficiency Leader • 178.3",
      "5,683 Career Passing Yards",
      "55 Total Touchdowns",
      "Loudoun County High School Hall of Fame",
    ],

    development: [
      "Stone Bridge High School • QB Coach",
      "Coach Tae QB Development",
      "DMV Attack Co-Founder",
      "Quarterback + Offensive Development",
    ],
  },

  {
    number: "02",

    name: "Dante Absher",

    title:
      "Co-Founder | WR Development",

    highSchoolRole:
      "Coach • Independence High School",

    photo:
      "/CoachDante.jpeg",

    instagram:
      "@dasp_training",

    instagramUrl:
      "https://www.instagram.com/dasp_training/",

    bio:
      "Dante Absher brings high-level wide receiver and professional football experience to DMV Attack. His approach combines position development, athletic performance, competitiveness, and mentorship for the next generation of DMV athletes.",

    playing: [
      "Park View High School",
      "Park View High School Hall of Fame",
      "Glenville State University • Wide Receiver",
      "First Team All-MEC",
      "214 Career Receptions",
      "2,669 Career Receiving Yards",
      "Montreal Alouettes • CFL",
      "Arizona Cardinals • Rookie Minicamp Invite",
    ],

    development: [
      "Independence High School • Coach",
      "DASP Training",
      "DMV Attack Co-Founder",
      "Next Up NOVA",
      "Wide Receiver Development",
    ],
  },

  {
    number: "03",

    name: "Ross Madison",

    title:
      "Co-Founder | Defensive Backs | Speed & Performance",

    highSchoolRole:
      "Coach • Loudoun Valley High School",

    photo:
      "/CoachRoss.png",

    instagram:
      "@r.a.m_training",

    instagramUrl:
      "https://www.instagram.com/r.a.m_training/",

    bio:
      "Ross Madison brings Division I and professional football experience to DMV Attack along with a strong background in defensive back development, speed, agility, and athletic performance.",

    playing: [
      "Heritage High School",
      "Heritage High School Hall of Fame",
      "Hargrave Military Academy",
      "University of Toledo • Safety • #21",
      "Washington • 2014",
      "Denver • 2015",
    ],

    development: [
      "Loudoun Valley High School • Coach",
      "RAM Training",
      "DMV Attack Co-Founder",
      "Defensive Back Development",
      "Speed + Agility + Sports Performance",
    ],
  },
];

export default function CoachingPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      <DmvPageHeader
        eyebrow="Leadership"
        title="Coaching Staff"
        description="Built by former college and professional athletes who now coach, mentor, train, and develop the next generation across Northern Virginia."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

        <div className="mb-10">

          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
            DMV Attack Leadership
          </div>

          <h2 className="mt-3 max-w-4xl text-3xl font-black uppercase leading-tight text-white md:text-5xl">
            Experience that translates to development.
          </h2>

        </div>


        <div className="space-y-8">

          {staff.map(
            (coach) => (
              <article
                key={coach.name}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]"
              >

                <div className="grid lg:grid-cols-[360px_1fr]">


                  <div className="relative min-h-[420px] overflow-hidden border-b border-white/10 lg:border-b-0 lg:border-r">

                    <img
                      src={coach.photo}
                      alt={coach.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-7">

                      <div className="flex items-center justify-between">

                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">
                            Co-Founder
                          </div>

                          <h3 className="mt-2 text-3xl font-black uppercase leading-none text-white">
                            {coach.name}
                          </h3>
                        </div>

                        <div className="text-5xl font-black text-white/20">
                          {coach.number}
                        </div>

                      </div>

                    </div>

                  </div>


                  <div className="p-6 md:p-8 lg:p-10">

                    <div className="text-xs font-black uppercase tracking-[0.14em] text-lime-400">
                      {coach.title}
                    </div>

                    <div className="mt-2 text-xs font-bold uppercase tracking-wider text-white/40">
                      {coach.highSchoolRole}
                    </div>


                    <a
                      href={coach.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-white/70 transition hover:border-lime-400/40 hover:text-lime-400"
                    >
                      Instagram
                      <span className="text-lime-400">
                        {coach.instagram}
                      </span>
                      ↗
                    </a>


                    <p className="mt-6 max-w-3xl text-sm leading-7 text-white/60 md:text-base">
                      {coach.bio}
                    </p>


                    <div className="mt-8 grid gap-8 md:grid-cols-2">

                      <div>

                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
                          Playing Career
                        </div>

                        <div className="mt-4 space-y-2">

                          {coach.playing.map(
                            (item) => (
                              <div
                                key={item}
                                className="flex gap-3 text-sm text-white/65"
                              >
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />

                                <span>
                                  {item}
                                </span>
                              </div>
                            )
                          )}

                        </div>

                      </div>


                      <div>

                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
                          Coaching + Development
                        </div>

                        <div className="mt-4 space-y-2">

                          {coach.development.map(
                            (item) => (
                              <div
                                key={item}
                                className="flex gap-3 text-sm text-white/65"
                              >
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />

                                <span>
                                  {item}
                                </span>
                              </div>
                            )
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </article>
            )
          )}

        </div>

      </section>

    </main>
  );
}
