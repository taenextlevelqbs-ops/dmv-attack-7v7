import Link from "next/link";
import { TRYOUT_EVENTS, TRYOUT_TIME, TRYOUT_LOCATION } from "@/lib/tryouts.mjs";
export default function TryoutEvents({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <section
      aria-labelledby="tryout-events-heading"
      className="border-b border-white/10"
    >
      <div
        className={`mx-auto max-w-7xl px-4 md:px-8 ${compact ? "py-10 md:py-12" : "py-12 md:py-16"}`}
      >
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="site-eyebrow">2027 Season · Confirmed Dates</p>
            <h2
              id="tryout-events-heading"
              className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-4xl"
            >
              Find Your Tryout.
            </h2>
          </div>
          {compact && (
            <Link
              href="/tryouts#registration"
              className="site-button site-button-outline"
            >
              Register Your Athlete
            </Link>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {TRYOUT_EVENTS.map((event) => (
            <article
              key={event.id}
              aria-labelledby={`event-${event.id}`}
              className="rounded-3xl border border-white/15 bg-[#0c0f0a] p-5 sm:p-7"
            >
              <div className="flex items-start gap-5">
                <div
                  aria-hidden="true"
                  className="flex w-16 shrink-0 flex-col items-center rounded-2xl bg-lime-400 py-3 text-black"
                >
                  <span className="text-[10px] font-black tracking-widest">
                    {event.month}
                  </span>
                  <span className="text-3xl font-black leading-tight">
                    {event.day}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3
                    id={`event-${event.id}`}
                    className="text-xl font-black uppercase sm:text-2xl"
                  >
                    {event.name}
                  </h3>
                  <time
                    dateTime={event.date}
                    className="mt-2 block text-sm leading-6 text-white/70"
                  >
                    {event.dateLabel}
                  </time>
                </div>
              </div>
              <p className="mt-6 text-3xl font-black tracking-tight text-lime-400 sm:text-4xl">
                {TRYOUT_TIME}{" "}
                <span className="text-sm font-bold tracking-wide text-white/65">
                  EST
                </span>
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {event.divisions.map((division) => (
                  <span
                    key={division}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-black"
                  >
                    {division}
                  </span>
                ))}
              </div>
              <p className="mt-5 border-t border-white/10 pt-4 text-sm text-white/65">
                {TRYOUT_LOCATION.name} · Ashburn, Virginia
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
