import Link from "next/link";
import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Girls Flag | DMV Attack",
  description:
    "DMV Attack Girls Flag Football development opportunities in Northern Virginia. More program details coming soon.",
};

const focusAreas = [
  "Quarterback Development",
  "Receiver Development",
  "Defensive Back Development",
  "Route Running",
  "Coverage Technique",
  "Football IQ",
  "Speed + Agility",
  "Competitive Reps",
];

export default function GirlsFlagPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <DmvPageHeader
        eyebrow="Girls Flag Football"
        title="DMV Attack Girls Flag"
        description="Expanding development opportunities for girls flag football athletes throughout Northern Virginia and the DMV."
      />

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="rounded-[36px] border border-lime-400/25 bg-lime-400 p-8 text-black md:p-12">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-black/55">
              Program Update
            </div>

            <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-7xl">
              More Details Coming Soon.
            </h2>

            <p className="mt-6 max-w-3xl text-sm font-semibold leading-7 text-black/65 md:text-base">
              We are continuing to build out DMV Attack Girls Flag opportunities.
              Additional details regarding age groups, teams, training, tryouts,
              practices, schedules and events will be announced as the program
              develops.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
                Development
              </div>

              <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">
                Built To Grow The Game.
              </h2>

              <p className="mt-6 text-sm leading-7 text-white/55 md:text-base">
                DMV Attack wants to create an environment where girls can learn
                the game, improve position skills, compete and continue developing
                as flag football continues to grow.
              </p>

              <p className="mt-4 text-sm leading-7 text-white/55 md:text-base">
                The focus will remain the same as the rest of DMV Attack:
                development, competition, confidence, football IQ and meaningful
                opportunities for athletes.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {focusAreas.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm font-bold text-white/70"
                >
                  <span className="mr-3 text-lime-400">→</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.025] p-8 md:p-12">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
              Stay Connected
            </div>

            <h2 className="mt-3 text-4xl font-black uppercase md:text-5xl">
              Interested In Girls Flag?
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
              Follow DMV Attack and send us your athlete&apos;s information so you
              can stay connected as additional girls flag details are announced.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-full bg-lime-400 px-7 py-4 text-center text-xs font-black uppercase tracking-[0.16em] text-black"
              >
                Player Interest →
              </Link>

              <a
                href="https://www.instagram.com/dmvattack_7on7/"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 px-7 py-4 text-center text-xs font-black uppercase tracking-[0.16em] text-white"
              >
                Follow DMV Attack →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
