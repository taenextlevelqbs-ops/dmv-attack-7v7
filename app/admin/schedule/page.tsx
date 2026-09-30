import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const tournaments = [
  {
    month: "FEB",
    dates: "27–28",
    title: "Duel in the DMV",
    location: "Upper Marlboro, MD",
    type: "Tournament",
  },
  {
    month: "MAR",
    dates: "13–14",
    title: "Music City Mayhem",
    location: "Murfreesboro, TN",
    type: "Tournament",
  },
  {
    month: "MAR",
    dates: "20–21",
    title: "Football City Clash",
    location: "Rock Hill, SC",
    type: "Tournament",
  },
  {
    month: "APR",
    dates: "3–4",
    title: "Virginia Frenzy",
    location: "Gainesville, VA",
    type: "Tournament",
  },
  {
    month: "APR",
    dates: "10–11",
    title: "PA Classic",
    location: "West Bradford Township, PA",
    type: "Tournament",
  },
  {
    month: "MAY",
    dates: "1–2",
    title: "National Championship",
    location: "Indianapolis, IN",
    type: "Qualification Required",
    championship: true,
  },
];

export default async function SchedulePage() {
  await requireStaff();

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.25em] text-lime-400">
              Organization Calendar
            </div>

            <h1 className="mt-2 text-4xl font-black uppercase md:text-5xl">
              2027 Schedule
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">
              DMV Attack tournament weekends and major organization dates.
            </p>
          </div>

          <Link
            href="/admin"
            className="text-xs font-black uppercase tracking-[0.12em] text-white/40 transition hover:text-lime-400"
          >
            ← Command Center
          </Link>
        </div>

        <section className="mt-6 grid grid-cols-3 gap-2">
          <Stat label="Events" value="6" />
          <Stat label="States" value="6" />
          <Stat label="Season" value="2027" />
        </section>

        <section className="mt-9">
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-lime-400">
            Tournament Calendar
          </div>

          <h2 className="mt-1 text-2xl font-black uppercase">
            Road To Indy
          </h2>

          <div className="mt-5 space-y-2">
            {tournaments.map((event) => (
              <article
                key={`${event.title}-${event.dates}`}
                className={`grid grid-cols-[70px_1fr] gap-4 rounded-[22px] border p-4 sm:grid-cols-[90px_1fr_auto] sm:items-center ${
                  event.championship
                    ? "border-lime-400/30 bg-lime-400/[0.06]"
                    : "border-white/10 bg-white/[0.025]"
                }`}
              >
                <div className="border-r border-white/10 pr-4 text-center">
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-lime-400">
                    {event.month}
                  </div>

                  <div className="mt-1 text-xl font-black">
                    {event.dates}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black uppercase sm:text-lg">
                    {event.title}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-white/40">
                    {event.location}
                  </p>
                </div>

                <div className="col-start-2 sm:col-start-auto">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.12em] ${
                      event.championship
                        ? "bg-lime-400 text-black"
                        : "bg-white/[0.06] text-white/35"
                    }`}
                  >
                    {event.type}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/teams"
            className="group rounded-[22px] border border-white/10 bg-white/[0.025] p-5 transition hover:border-lime-400/30"
          >
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-lime-400">
              Rosters
            </div>
            <div className="mt-2 flex items-center justify-between">
              <h3 className="font-black uppercase">
                Teams + Rosters
              </h3>
              <span className="text-white/25 transition group-hover:text-lime-400">
                →
              </span>
            </div>
          </Link>

          <div className="rounded-[22px] border border-white/10 bg-white/[0.025] p-5">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">
              Coming Next
            </div>
            <h3 className="mt-2 font-black uppercase">
              Practices + Team Events
            </h3>
            <p className="mt-2 text-xs leading-5 text-white/35">
              Practice dates, times and team-specific events can be added here as the season approaches.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="text-[8px] font-black uppercase tracking-[0.16em] text-white/25">
        {label}
      </div>
      <div className="mt-1 text-lg font-black uppercase">
        {value}
      </div>
    </div>
  );
}
