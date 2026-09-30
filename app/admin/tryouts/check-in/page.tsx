"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Registration = {
  id: string;
  tryout_id: string;
  athlete_first_name: string;
  athlete_last_name: string;
  age_group: string;
  primary_position: string | null;
  secondary_position: string | null;
  school: string | null;
  grade: string | null;
  status: string;
  headshot_url: string | null;
};

const divisions = [
  "ALL",
  "8U",
  "10U",
  "12U",
  "14U",
  "15U",
  "18U",
];

export default function TryoutCheckInPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("ALL");
  const [show, setShow] = useState<
    "ALL" | "ARRIVED" | "NOT_ARRIVED"
  >("ALL");

  const [updating, setUpdating] = useState("");

  async function loadRegistrations() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/tryouts", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to load registrations"
        );
      }

      setRegistrations(result.registrations ?? []);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load registrations"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRegistrations();
  }, []);

  function hasArrived(status: string) {
    return status !== "REGISTERED";
  }

  async function checkIn(registration: Registration) {
    try {
      setUpdating(registration.id);

      const response = await fetch(
        "/api/admin/tryouts/status",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: registration.id,
            status: "CHECKED_IN",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to check athlete in"
        );
      }

      setRegistrations((current) =>
        current.map((item) =>
          item.id === registration.id
            ? { ...item, status: "CHECKED_IN" }
            : item
        )
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to check athlete in"
      );
    } finally {
      setUpdating("");
    }
  }

  async function undoCheckIn(registration: Registration) {
    if (
      registration.status !== "CHECKED_IN"
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Mark ${registration.athlete_first_name} ${registration.athlete_last_name} as not arrived?`
    );

    if (!confirmed) return;

    try {
      setUpdating(registration.id);

      const response = await fetch(
        "/api/admin/tryouts/status",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: registration.id,
            status: "REGISTERED",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to undo check-in"
        );
      }

      setRegistrations((current) =>
        current.map((item) =>
          item.id === registration.id
            ? { ...item, status: "REGISTERED" }
            : item
        )
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to undo check-in"
      );
    } finally {
      setUpdating("");
    }
  }

  const stats = useMemo(() => {
    const scoped =
      division === "ALL"
        ? registrations
        : registrations.filter(
            (item) => item.age_group === division
          );

    const arrived = scoped.filter((item) =>
      hasArrived(item.status)
    ).length;

    return {
      registered: scoped.length,
      arrived,
      notArrived: scoped.length - arrived,
    };
  }, [registrations, division]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return registrations
      .filter((registration) => {
        if (
          division !== "ALL" &&
          registration.age_group !== division
        ) {
          return false;
        }

        const arrived = hasArrived(
          registration.status
        );

        if (show === "ARRIVED" && !arrived) {
          return false;
        }

        if (show === "NOT_ARRIVED" && arrived) {
          return false;
        }

        if (!term) return true;

        const haystack = [
          registration.athlete_first_name,
          registration.athlete_last_name,
          registration.tryout_id,
          registration.school,
          registration.primary_position,
          registration.secondary_position,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(term);
      })
      .sort((a, b) =>
        `${a.athlete_last_name} ${a.athlete_first_name}`.localeCompare(
          `${b.athlete_last_name} ${b.athlete_first_name}`
        )
      );
  }, [
    registrations,
    search,
    division,
    show,
  ]);

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-lime-400">
              DMV Attack Tryouts
            </div>

            <h1 className="mt-2 text-4xl font-black uppercase md:text-6xl">
              Check-In
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/45">
              Find the athlete, verify the headshot and
              check them in.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/tryouts"
              className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.12em]"
            >
              Tryout Dashboard
            </Link>

            <Link
              href="/admin"
              className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.12em]"
            >
              Admin Home
            </Link>
          </div>
        </header>

        <section className="mt-7 grid grid-cols-3 gap-2 md:gap-4">
          <Stat
            label="Registered"
            value={stats.registered}
          />

          <Stat
            label="Checked In"
            value={stats.arrived}
            highlight
          />

          <Stat
            label="Not Arrived"
            value={stats.notArrived}
          />
        </section>

        <section className="sticky top-0 z-30 -mx-4 mt-6 border-y border-white/10 bg-black/95 px-4 py-4 backdrop-blur-xl md:-mx-8 md:px-8">
          <div className="mx-auto max-w-7xl">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              autoFocus
              placeholder="Search name, Tryout ID, school or position..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-base font-semibold outline-none placeholder:text-white/25 focus:border-lime-400"
            />

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {divisions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDivision(item)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${
                    division === item
                      ? "bg-lime-400 text-black"
                      : "border border-white/10 bg-white/[0.035] text-white/60"
                  }`}
                >
                  {item === "ALL"
                    ? "ALL DIVISIONS"
                    : item}
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              {[
                ["ALL", "Everyone"],
                ["NOT_ARRIVED", "Not Arrived"],
                ["ARRIVED", "Checked In"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setShow(
                      value as
                        | "ALL"
                        | "ARRIVED"
                        | "NOT_ARRIVED"
                    )
                  }
                  className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] ${
                    show === value
                      ? "bg-white text-black"
                      : "border border-white/10 text-white/45"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm font-bold uppercase tracking-[0.2em] text-white/30">
            Loading Athletes...
          </div>
        ) : (
          <>
            <div className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-white/30">
              {filtered.length} athletes
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((registration) => {
                const arrived = hasArrived(
                  registration.status
                );

                return (
                  <article
                    key={registration.id}
                    className={`overflow-hidden rounded-[28px] border ${
                      arrived
                        ? "border-lime-400/30 bg-lime-400/[0.05]"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex gap-4 p-4">
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/5">
                        {registration.headshot_url ? (
                          <img
                            src={
                              registration.headshot_url
                            }
                            alt={`${registration.athlete_first_name} ${registration.athlete_last_name}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-2 text-center text-[8px] font-black uppercase text-white/20">
                            No Photo
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-[9px] font-black uppercase tracking-[0.15em] text-lime-400">
                              {registration.tryout_id}
                            </div>

                            <h2 className="mt-1 truncate text-xl font-black uppercase">
                              {
                                registration.athlete_first_name
                              }{" "}
                              {
                                registration.athlete_last_name
                              }
                            </h2>
                          </div>

                          <div className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                            {registration.age_group}
                          </div>
                        </div>

                        <div className="mt-2 text-xs font-bold text-white/55">
                          {registration.primary_position ||
                            "Position N/A"}

                          {registration.secondary_position
                            ? ` • ${registration.secondary_position}`
                            : ""}
                        </div>

                        <div className="mt-1 truncate text-xs text-white/35">
                          {registration.school ||
                            "School not listed"}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/10 p-4">
                      {!arrived ? (
                        <button
                          type="button"
                          disabled={
                            updating === registration.id
                          }
                          onClick={() =>
                            checkIn(registration)
                          }
                          className="w-full rounded-2xl bg-lime-400 px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-lime-300 disabled:opacity-50"
                        >
                          {updating ===
                          registration.id
                            ? "Checking In..."
                            : "Check In"}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-2xl bg-lime-400/10 px-5 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-lime-400">
                            ✓ Checked In
                          </div>

                          {registration.status ===
                            "CHECKED_IN" && (
                            <button
                              type="button"
                              disabled={
                                updating ===
                                registration.id
                              }
                              onClick={() =>
                                undoCheckIn(
                                  registration
                                )
                              }
                              className="rounded-2xl border border-white/10 px-4 py-4 text-[10px] font-black uppercase text-white/40"
                            >
                              Undo
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {!filtered.length && !error && (
              <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.025] p-10 text-center">
                <div className="text-xl font-black uppercase">
                  No Athletes Found
                </div>

                <p className="mt-2 text-sm text-white/40">
                  Try another search or filter.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 md:rounded-3xl md:p-5 ${
        highlight
          ? "border-lime-400/25 bg-lime-400/[0.07]"
          : "border-white/10 bg-white/[0.025]"
      }`}
    >
      <div
        className={`text-[8px] font-black uppercase tracking-[0.15em] md:text-[10px] ${
          highlight
            ? "text-lime-400"
            : "text-white/30"
        }`}
      >
        {label}
      </div>

      <div className="mt-2 text-2xl font-black md:text-3xl">
        {value}
      </div>
    </div>
  );
}
