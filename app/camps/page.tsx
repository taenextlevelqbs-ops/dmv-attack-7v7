import Link from "next/link";
import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Camps | DMV Attack",
  description:
    "DMV Attack football camps for athletes throughout Northern Virginia and the DMV. Camp dates for all ages coming soon.",
};

const campFeatures = [
  "Position-specific instruction",
  "Quarterback development",
  "Receiver development",
  "Defensive back development",
  "Football fundamentals",
  "Competitive drills",
  "Football IQ",
  "Speed + movement",
  "Mentorship",
  "High-level coaching",
];

export default function CampsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <DmvPageHeader
        eyebrow="DMV Attack Camps"
        title="Football Camps"
        description="High-level instruction, competition, development and mentorship for athletes throughout Northern Virginia and the DMV."
      />

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="rounded-[36px] border border-lime-400/25 bg-lime-400 p-8 text-black md:p-12">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-black/55">
              Upcoming Camps
            </div>

            <h2 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-none md:text-7xl">
              Camp Dates Coming Soon.
            </h2>

            <p className="mt-5 max-w-2xl text-lg font-black uppercase tracking-wide">
              Camps Available For All Ages
            </p>

            <p className="mt-5 max-w-3xl text-sm font-semibold leading-7 text-black/65 md:text-base">
              Dates, locations, times and registration information will be
              announced soon. DMV Attack camps are designed to provide athletes
              with detailed football instruction, competitive reps and access to
              experienced coaches.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="mb-10">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
              Camp Experience
            </div>

            <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">
              Learn. Compete. Develop.
            </h2>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/55 md:text-base">
              DMV Attack camps bring athletes together for football instruction,
              competition, mentorship and access to coaches with college and
              professional playing experience.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {campFeatures.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm font-bold text-white/70"
              >
                <span className="mr-3 text-lime-400">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="grid gap-5 md:grid-cols-2">
            <Link
              href="/contact"
              className="rounded-[32px] border border-white/10 bg-white/[0.025] p-8 transition hover:border-lime-400/30"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">
                Stay Connected
              </div>

              <h3 className="mt-4 text-3xl font-black uppercase">
                Camp Updates
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/55">
                Connect with DMV Attack to stay updated when camp dates and
                registration become available.
              </p>

              <div className="mt-7 text-xs font-black uppercase tracking-[0.18em]">
                Contact DMV Attack →
              </div>
            </Link>

            <Link
              href="/training"
              className="rounded-[32px] border border-white/10 bg-white/[0.025] p-8 transition hover:border-lime-400/30"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">
                Year Round
              </div>

              <h3 className="mt-4 text-3xl font-black uppercase">
                Training
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/55">
                Looking for development before the next camp? Explore DMV Attack
                quarterback, receiver, defensive back and performance training.
              </p>

              <div className="mt-7 text-xs font-black uppercase tracking-[0.18em]">
                Explore Training →
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
