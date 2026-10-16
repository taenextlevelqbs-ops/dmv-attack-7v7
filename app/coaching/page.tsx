import Image from "next/image";
import Link from "next/link";
import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Coaching Staff",
};

type Coach = {
  number: string;
  name: string;
  title: string;
  school: string;
  photo: string;
  instagram?: string;
  url?: string;
  bio: string;
  playing: string[];
  development: string[];
  program?: string;
};

const staff: Coach[] = [
  {
    number: "01",
    name: "Tae Crews-Naylor",

    title:
      "Co-Founder | QB Development | Offensive Development",

    school:
      "QB Coach • Stone Bridge High School",

    photo:
      "/CoachTae.jpeg",

    instagram:
      "@coachtae3",

    url:
      "https://www.instagram.com/coachtae3/",

    bio:
      "Former college quarterback and experienced quarterback coach focused on offensive development, quarterback mechanics, football IQ and preparing athletes for the next level.",

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
      "Co-Founder | WR Development | Speed & Performance",

    school:
      "Coach • Independence High School",

    photo:
      "/CoachDante.jpeg",

    instagram:
      "@dasp_training",

    url:
      "https://www.instagram.com/dasp_training/",

    bio:
      "Former collegiate and professional wide receiver bringing position development, speed development, agility and athletic performance training, competition and mentorship to DMV Attack athletes.",

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
      "Speed + Agility + Performance",
    ],
  },

  {
    number: "03",
    name: "Ross Madison",

    title:
      "Co-Founder | Defensive Backs | Speed & Performance",

    school:
      "Coach • Loudoun Valley High School",

    photo:
      "/CoachRoss.jpeg",

    instagram:
      "@r.a.m_training",

    url:
      "https://www.instagram.com/r.a.m_training/",

    bio:
      "Former Division I and professional defensive back bringing high-level football experience, speed development, agility and athletic performance training to DMV Attack.",

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
      "Speed + Agility + Performance",
    ],
  },
  {
    number: "04",
    name: "Norman Wallace",
    title: "Big Man 5v5 | Offensive Line Development",
    school: "Fairmont State University • Offensive Line",
    photo: "/normanwallace.jpeg",
    bio: "Former Fairmont State offensive lineman who appeared in 10 games and made seven starts at left guard in 2016. Wallace was part of an offensive front that helped the Falcons set single-season school records for total offense, total first downs and passing first downs. That unit produced 4,690 yards of total offense, averaged nearly 30 points per game and ranked third in its conference in sacks allowed. He brings that collegiate perspective to DMV Attack’s offensive line development, helping athletes build the fundamentals and communication needed up front.",
    playing: [
      "Fairmont State University • Offensive Line",
      "2016 • 10 Games Played • 7 Starts at Left Guard",
      "2016 Offensive Unit • School-Record 4,690 Total Yards",
      "2016 Offensive Unit • School-Record 250 First Downs",
      "2016 Offensive Front • Third in Conference in Sacks Allowed (1.83 per Game)",
    ],
    development: [
      "DMV Attack Big Man 5v5 • O-Line Coach",
      "Program Location • Independence High School",
      "Stance, Footwork + Balance",
      "Hand Placement + Pass Protection",
      "Offensive Line Communication + Teamwork",
    ],
    program: "/big-man",
  },
  {
    number: "05",
    name: "Keionta Davis",
    title: "Big Man 5v5 | Defensive Line Development",
    school: "Chattanooga • New England Patriots",
    photo: "/Keiontadavis.jpeg",
    bio: "Former University of Tennessee at Chattanooga and New England Patriots defensive lineman with experience at both the college and NFL levels. Davis brings a defensive lineman’s perspective to DMV Attack’s Big Man 5v5 program, connecting the work at the line of scrimmage to the demands of tackle football. His development focus includes get-off, leverage, hand use and pass rush technique, helping athletes understand how movement and technique work together in the trenches.",
    playing: [
      "University of Tennessee at Chattanooga • Defensive Line",
      "Chattanooga Mocs • NCAA Division I Football",
      "New England Patriots • NFL Defensive Line",
    ],
    development: [
      "DMV Attack Big Man 5v5 • D-Line Coach",
      "Program Location • Independence High School",
      "Get-Off + Leverage",
      "Hand Use + Pass Rush Fundamentals",
      "Controlled Movement + Defensive Line Responsibilities",
    ],
    program: "/big-man",
  },
];

export default function CoachingPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      <DmvPageHeader
        eyebrow="DMV Attack Leadership"
        title="Coaching Staff"
        description="Former college and professional athletes now developing the next generation across Northern Virginia."
      />


      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

        <div className="space-y-8">

          {staff.map((coach) => (
            <article
              key={coach.name}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]"
            >

              <div className="grid lg:grid-cols-[360px_1fr]">


                <div className="relative min-h-[460px] overflow-hidden">

                  <Image
                    src={coach.photo}
                    alt={coach.name}
                    fill
                    sizes="(min-width: 1024px) 360px, 100vw"
                    className="object-cover object-top"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-7">

                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400">
                      {coach.program ? "Big Man 5v5 Coach" : "Co-Founder"}
                    </div>

                    <div className="mt-2 flex items-end justify-between">

                      <h2 className="text-3xl font-black uppercase">
                        {coach.name}
                      </h2>

                      <div className="text-5xl font-black text-white/20">
                        {coach.number}
                      </div>

                    </div>

                  </div>

                </div>


                <div className="p-7 md:p-10">

                  <div className="text-xs font-black uppercase tracking-[0.14em] text-lime-400">
                    {coach.title}
                  </div>

                  <div className="mt-2 text-xs font-bold uppercase tracking-wider text-white/40">
                    {coach.school}
                  </div>


                  {coach.url && coach.instagram && <a
                    href={coach.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-white/70 transition hover:border-lime-400/40 hover:text-lime-400"
                  >
                    Instagram&nbsp;
                    <span className="text-lime-400">
                      {coach.instagram}
                    </span>
                    &nbsp;↗
                  </a>}
                  {coach.program && (
                    <Link href={coach.program} className="mt-5 inline-flex rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-2 text-xs font-black text-lime-400 transition hover:bg-lime-400 hover:text-black">Big Man 5v5 Program + Signup →</Link>
                  )}


                  <p className="mt-6 max-w-3xl text-sm leading-7 text-white/60">
                    {coach.bio}
                  </p>


                  <div className="mt-8 grid gap-8 md:grid-cols-2">

                    <div>

                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                        Playing Career
                      </div>

                      <div className="mt-4 space-y-2">

                        {coach.playing.map((item) => (
                          <div
                            key={item}
                            className="flex gap-3 text-sm text-white/65"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />

                            {item}
                          </div>
                        ))}

                      </div>

                    </div>


                    <div>

                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                        Coaching + Development
                      </div>

                      <div className="mt-4 space-y-2">

                        {coach.development.map((item) => (
                          <div
                            key={item}
                            className="flex gap-3 text-sm text-white/65"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />

                            {item}
                          </div>
                        ))}

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </article>
          ))}

        </div>

      </section>

    </main>
  );
}
