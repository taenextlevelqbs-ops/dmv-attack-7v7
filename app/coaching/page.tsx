import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Coaching Staff | DMV Attack",
};

type StaffMember = {
  number: string;
  name: string;
  initials: string;
  title: string;
  highSchoolRole: string;
  bio: string;
  playing: string[];
  development: string[];
};

const staff: StaffMember[] = [
  {
    number: "01",

    name:
      "Tae Crews-Naylor",

    initials:
      "TC",

    title:
      "Co-Founder | QB Development | Offensive Development",

    highSchoolRole:
      "QB Coach • Stone Bridge High School",

    bio:
      "Tae Crews-Naylor brings quarterback experience, offensive knowledge, and player development to DMV Attack. A former college quarterback, Tae now works with quarterbacks and offensive players through high school coaching, private training, and DMV Attack.",

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

    name:
      "Dante Absher",

    initials:
      "DA",

    title:
      "Co-Founder | WR Development",

    highSchoolRole:
      "Coach • Independence High School",

    bio:
      "Dante Absher brings high-level wide receiver experience and professional football experience to DMV Attack. His approach combines position development, athletic performance, competitiveness, and mentorship for the next generation of DMV athletes.",

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
      "DASAP Training",
      "DMV Attack Co-Founder",
      "Next Up NOVA",
      "Wide Receiver Development",
    ],
  },

  {
    number: "03",

    name:
      "Ross Madison",

    initials:
      "RM",

    title:
      "Co-Founder | Defensive Backs | Speed & Performance",

    highSchoolRole:
      "Coach • Loudoun Valley High School",

    bio:
      "Ross Madison brings Division I and professional football experience to DMV Attack along with a strong background in speed, agility, athletic performance, and defensive back development. His work centers on preparing athletes physically and technically for the next level.",

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
        description="Built by former college and professional athletes who now coach, mentor, and develop the next generation across Northern Virginia."
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


        <div className="space-y-6">

          {staff.map(
            (coach) => (
              <article
                key={
                  coach.name
                }
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]"
              >

                <div className="grid lg:grid-cols-[300px_1fr]">

                  <div className="flex min-h-[300px] flex-col justify-between border-b border-white/10 bg-gradient-to-br from-lime-400/15 via-black to-black p-7 lg:border-b-0 lg:border-r">

                    <div className="flex items-start justify-between">

                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/10 text-2xl font-black text-lime-300">
                        {
                          coach.initials
                        }
                      </div>

                      <div className="text-4xl font-black text-white/10">
                        {
                          coach.number
                        }
                      </div>

                    </div>

                    <div>

                      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">
                        Co-Founder
                      </div>

                      <h3 className="mt-2 text-3xl font-black uppercase leading-none text-white">
                        {
                          coach.name
                        }
                      </h3>

                    </div>

                  </div>


                  <div className="p-6 md:p-8 lg:p-10">

                    <div className="text-xs font-black uppercase tracking-[0.14em] text-lime-400">
                      {
                        coach.title
                      }
                    </div>

                    <div className="mt-2 text-xs font-bold uppercase tracking-wider text-white/40">
                      {
                        coach.highSchoolRole
                      }
                    </div>

                    <p className="mt-6 max-w-3xl text-sm leading-7 text-white/60 md:text-base">
                      {
                        coach.bio
                      }
                    </p>


                    <div className="mt-8 grid gap-8 md:grid-cols-2">

                      <div>

                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
                          Playing Career
                        </div>

                        <div className="mt-4 space-y-2">

                          {coach.playing.map(
                            (
                              item
                            ) => (
                              <div
                                key={
                                  item
                                }
                                className="flex gap-3 text-sm text-white/65"
                              >
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />

                                <span>
                                  {
                                    item
                                  }
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
                            (
                              item
                            ) => (
                              <div
                                key={
                                  item
                                }
                                className="flex gap-3 text-sm text-white/65"
                              >
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />

                                <span>
                                  {
                                    item
                                  }
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
