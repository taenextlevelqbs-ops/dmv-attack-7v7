import Link from "next/link";

import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "7v7 | DMV Attack",
};

export default function SevenOnSevenPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      <DmvPageHeader
        eyebrow="DMV Attack"
        title="7v7 Football"
        description="Competitive 7v7 football development for athletes across Northern Virginia and the DMV. Our program is built around development, competition, exposure, accountability, and relationships."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

        <div className="grid gap-4 md:grid-cols-3">

          {[
            [
              "Development",
              "Position-specific work, football IQ, competitive reps, and a standard that prepares athletes for their school teams.",
            ],
            [
              "Competition",
              "Regional and national tournament opportunities designed to challenge our athletes against quality competition.",
            ],
            [
              "Exposure",
              "A platform for players to compete, create film, build relationships, and continue developing their football résumé.",
            ],
          ].map(
            ([title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="text-xs font-black uppercase tracking-[0.18em] text-lime-400">
                  {
                    title
                  }
                </div>

                <p className="mt-4 text-sm leading-7 text-white/55">
                  {text}
                </p>
              </div>
            )
          )}

        </div>

        <div className="mt-10 rounded-3xl border border-lime-400/20 bg-lime-400/[0.06] p-6 md:p-10">

          <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
            Join DMV Attack
          </div>

          <h2 className="mt-3 text-3xl font-black uppercase text-white">
            Ready to compete?
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
            Follow DMV Attack for tryout announcements, team updates, tournament schedules, camps, and upcoming opportunities.
          </p>

          <a
            href="https://www.instagram.com/dmvattack_7on7/"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-xl bg-lime-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-black"
          >
            Follow DMV Attack
          </a>

        </div>

      </section>

    </main>
  );
}
