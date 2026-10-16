import Image from "next/image";
import Link from "next/link";
import DmvPageHeader from "@/components/dmv-page-header";
import BigManSignup from "@/components/big-man-signup";

export const metadata = {
  title: "Big Man 5v5",
  description:
    "DMV Attack Big Man 5v5 for offensive and defensive linemen at Independence High School. O-line coaching with Norman Wallace and D-line coaching with Keionta Davis.",
};

const coaches = [
  {
    name: "Norman Wallace",
    image: "/normanwallace.jpeg",
    role: "O-Line Coach",
    background: "Fairmont State University • Offensive Line",
    bio: "Former Fairmont State offensive lineman who appeared in 10 games and made seven starts at left guard in 2016. Wallace was part of an offensive front that helped the Falcons set single-season school records for total offense, total first downs and passing first downs. That unit produced 4,690 yards of total offense, averaged nearly 30 points per game and ranked third in its conference in sacks allowed. He brings that collegiate perspective to DMV Attack’s offensive line development, helping athletes build the fundamentals and communication needed up front.",
    highlights: ["10 appearances • 7 starts at left guard in 2016", "Part of a record-setting Falcons offensive front", "Stance, footwork, hand placement and pass protection"],
  },
  {
    name: "Keionta Davis",
    image: "/Keiontadavis.jpeg",
    role: "D-Line Coach",
    background: "Chattanooga • New England Patriots",
    bio: "Super Bowl LIII champion and former New England Patriots defensive lineman. Davis played college football at the University of Tennessee at Chattanooga before joining the Patriots as an undrafted free agent in 2017. He appeared in NFL games during the 2018 season and was a member of New England’s Super Bowl LIII championship team. He brings experience from the college game and an NFL championship organization to DMV Attack’s Big Man 5v5 program, helping defensive linemen develop get-off, leverage, hand use and pass rush technique. His focus is on building the fundamentals, controlled movement and understanding of responsibilities athletes need at the line of scrimmage.",
    highlights: ["Super Bowl LIII Champion • New England Patriots", "University of Tennessee at Chattanooga • Defensive Line", "Joined New England as an Undrafted Free Agent • 2017", "NFL Game Appearances • 2018 Season", "Get-off, leverage, hand use and pass rush fundamentals"],
  },
];

export default function BigManPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <DmvPageHeader
        eyebrow="DMV Attack • O Line + D Line"
        title="Big Man 5v5"
        description="Built for the trenches. Position-specific development and competition for offensive and defensive linemen at Independence High School."
        buttonText="Sign Up For Big Man 5v5"
        buttonHref="#signup"
      />

      <section aria-labelledby="program-details" className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
          <div className="rounded-3xl border border-lime-400/25 bg-lime-400/[0.06] p-7 md:p-10">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">Where We Work</p>
            <h2 id="program-details" className="mt-3 text-3xl font-black uppercase md:text-5xl">Independence High School</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">Big Man 5v5 will be held at Independence High School. Use the signup form below to connect with our staff about participating age groups, session dates and arrival times.</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["What Is Big Man 5v5?", "A football development and competition format for offensive and defensive linemen. The focus is on the technique, movement and teamwork needed up front."],
              ["Offensive Line", "Work on stance, footwork, balance, hand placement and pass protection. Build the communication and coordination needed to work as a unit."],
              ["Defensive Line", "Develop get-off, leverage, hand use and pass rush technique. Build controlled movement and an understanding of responsibilities at the line of scrimmage."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
                <h3 className="text-lg font-black uppercase text-lime-400">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="line-coaches" className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">Experience Up Front</p>
        <h2 id="line-coaches" className="mt-3 text-4xl font-black uppercase md:text-6xl">Meet Your Coaches.</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {coaches.map((coach) => (
            <article key={coach.name} className="rounded-3xl border border-white/10 bg-white/[0.025] p-7 md:p-9">
              <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <Image
                  src={coach.image}
                  alt={`${coach.name} - ${coach.role}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top"
                />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">{coach.role}</p>
              <h3 className="mt-4 text-3xl font-black uppercase">{coach.name}</h3>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-white/45">{coach.background}</p>
              <p className="mt-6 text-sm leading-7 text-white/65">{coach.bio}</p>
              <ul className="mt-6 space-y-3 border-t border-white/10 pt-6">
                {coach.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3 text-sm leading-6 text-white/65"><span aria-hidden="true" className="text-lime-400">•</span>{highlight}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 p-7 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-2xl font-black uppercase">Ready To Work?</h3>
            <p className="mt-2 text-sm leading-7 text-white/60">Sign up for information about availability and upcoming Big Man 5v5 sessions.</p>
          </div>
          <Link href="#signup" className="inline-flex shrink-0 rounded-full bg-lime-400 px-6 py-3 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-300">Sign Up For 5v5</Link>
        </div>
      </section>

      <BigManSignup />
    </main>
  );
}
