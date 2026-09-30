"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Athlete = {
  id: string;
  tryout_id: string;
  athlete_first_name: string;
  athlete_last_name: string;
  age_group: string;
  primary_position: string | null;
  secondary_position: string | null;
  school: string | null;
  grade: string | null;
  headshot_url: string | null;
  status: string;
};

type Assignment = {
  id: string;
  team_id: string;
  tryout_submission_id: string;
  roster_status: string;
  offered_at: string | null;
  accepted_at: string | null;
  athlete: Athlete | null;
};

type Team = {
  id: string;
  name: string;
  age_group: string;
  season: string;
  active: boolean;
  assignments: Assignment[];
};

const statusOrder = [
  "OFFERED",
  "ACCEPTED",
  "ACTIVE",
  "WAITLIST",
  "DECLINED",
  "REMOVED",
];

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] =
    useState<string>("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRosters() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/rosters",
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to load rosters"
        );
      }

      setTeams(result.teams ?? []);
      setError("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load rosters"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRosters();
  }, []);

  const totals = useMemo(() => {
    const assignments = teams.flatMap(
      (team) => team.assignments
    );

    return {
      teams: teams.length,
      offered: assignments.filter(
        (item) =>
          item.roster_status === "OFFERED"
      ).length,
      accepted: assignments.filter(
        (item) =>
          item.roster_status === "ACCEPTED"
      ).length,
      active: assignments.filter(
        (item) =>
          item.roster_status === "ACTIVE"
      ).length,
      total: assignments.filter(
        (item) =>
          !["DECLINED", "REMOVED"].includes(
            item.roster_status
          )
      ).length,
    };
  }, [teams]);

  const visibleAssignments = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase();

    return teams.flatMap((team) =>
      team.assignments
        .filter((assignment) => {
          if (
            selectedTeam !== "ALL" &&
            team.id !== selectedTeam
          ) {
            return false;
          }

          if (
            statusFilter !== "ALL" &&
            assignment.roster_status !==
              statusFilter
          ) {
            return false;
          }

          if (!term) return true;

          const athlete =
            assignment.athlete;

          if (!athlete) return false;

          const haystack = [
            athlete.athlete_first_name,
            athlete.athlete_last_name,
            athlete.tryout_id,
            athlete.school,
            athlete.primary_position,
            athlete.secondary_position,
            team.name,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(term);
        })
        .map((assignment) => ({
          ...assignment,
          team,
        }))
    );
  }, [
    teams,
    selectedTeam,
    statusFilter,
    search,
  ]);

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-lime-400">
              DMV Attack • 2027
            </div>

            <h1 className="mt-3 text-4xl font-black uppercase md:text-6xl">
              Teams & Rosters
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">
              Manage team assignments, offers,
              accepted athletes and active DMV
              Attack rosters.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/tryouts"
              className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.12em]"
            >
              Tryouts
            </Link>

            <Link
              href="/admin"
              className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.12em]"
            >
              Admin Home
            </Link>
          </div>
        </header>

        <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Stat
            label="Teams"
            value={totals.teams}
          />

          <Stat
            label="Rostered"
            value={totals.total}
          />

          <Stat
            label="Offers"
            value={totals.offered}
            highlight
          />

          <Stat
            label="Accepted"
            value={totals.accepted}
          />

          <Stat
            label="Active"
            value={totals.active}
          />
        </section>

        <section className="mt-10">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">
            Active Teams
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => {
              const activeCount =
                team.assignments.filter(
                  (assignment) =>
                    ![
                      "DECLINED",
                      "REMOVED",
                    ].includes(
                      assignment.roster_status
                    )
                ).length;

              const isSelected =
                selectedTeam === team.id;

              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() =>
                    setSelectedTeam(
                      isSelected
                        ? "ALL"
                        : team.id
                    )
                  }
                  className={`rounded-[26px] border p-5 text-left transition ${
                    isSelected
                      ? "border-lime-400 bg-lime-400/[0.08]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/30">
                        {team.age_group} •{" "}
                        {team.season}
                      </div>

                      <div className="mt-2 text-2xl font-black uppercase">
                        {team.name}
                      </div>
                    </div>

                    <div className="text-3xl font-black text-lime-400">
                      {activeCount}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                    <MiniStat
                      label="Offered"
                      value={
                        team.assignments.filter(
                          (item) =>
                            item.roster_status ===
                            "OFFERED"
                        ).length
                      }
                    />

                    <MiniStat
                      label="Accepted"
                      value={
                        team.assignments.filter(
                          (item) =>
                            item.roster_status ===
                            "ACCEPTED"
                        ).length
                      }
                    />

                    <MiniStat
                      label="Active"
                      value={
                        team.assignments.filter(
                          (item) =>
                            item.roster_status ===
                            "ACTIVE"
                        ).length
                      }
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">
                Athletes
              </div>

              <h2 className="mt-2 text-3xl font-black uppercase">
                Roster Board
              </h2>
            </div>

            <div className="text-xs font-bold text-white/30">
              {visibleAssignments.length}{" "}
              athletes
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search athlete, Tryout ID, school or position..."
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold outline-none placeholder:text-white/25 focus:border-lime-400"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-2xl border border-white/10 bg-black px-5 py-4 text-sm font-bold outline-none"
            >
              <option value="ALL">
                All Statuses
              </option>

              {statusOrder.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}
            </select>
          </div>

          {selectedTeam !== "ALL" && (
            <button
              type="button"
              onClick={() =>
                setSelectedTeam("ALL")
              }
              className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-lime-400"
            >
              × Show All Teams
            </button>
          )}

          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-xs font-black uppercase tracking-[0.2em] text-white/30">
              Loading Rosters...
            </div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleAssignments.map(
                (assignment) => {
                  const athlete =
                    assignment.athlete;

                  if (!athlete) return null;

                  return (
                    <article
                      key={assignment.id}
                      className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]"
                    >
                      <div className="flex gap-4 p-4">
                        <div className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/5">
                          {athlete.headshot_url ? (
                            <img
                              src={
                                athlete.headshot_url
                              }
                              alt={`${athlete.athlete_first_name} ${athlete.athlete_last_name}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[8px] font-black uppercase text-white/20">
                              No Photo
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-[9px] font-black uppercase tracking-[0.15em] text-lime-400">
                            {
                              assignment.team
                                .name
                            }
                          </div>

                          <h3 className="mt-1 truncate text-xl font-black uppercase">
                            {
                              athlete.athlete_first_name
                            }{" "}
                            {
                              athlete.athlete_last_name
                            }
                          </h3>

                          <div className="mt-2 text-xs font-bold text-white/50">
                            {athlete.primary_position ||
                              "Position N/A"}

                            {athlete.secondary_position
                              ? ` • ${athlete.secondary_position}`
                              : ""}
                          </div>

                          <div className="mt-1 truncate text-xs text-white/30">
                            {athlete.school ||
                              "School not listed"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
                        <div
                          className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${
                            assignment.roster_status ===
                            "OFFERED"
                              ? "bg-lime-400/10 text-lime-400"
                              : "bg-white/10 text-white/60"
                          }`}
                        >
                          {
                            assignment.roster_status
                          }
                        </div>

                        <div className="text-[9px] font-black uppercase tracking-[0.1em] text-white/25">
                          {athlete.tryout_id}
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}

          {!loading &&
            !error &&
            visibleAssignments.length ===
              0 && (
              <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.025] p-12 text-center">
                <div className="text-2xl font-black uppercase">
                  No Athletes Yet
                </div>

                <p className="mt-3 text-sm text-white/40">
                  Athletes will appear here
                  after a team offer or roster
                  assignment is created.
                </p>
              </div>
            )}
        </section>
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
      className={`rounded-3xl border p-5 ${
        highlight
          ? "border-lime-400/25 bg-lime-400/[0.07]"
          : "border-white/10 bg-white/[0.025]"
      }`}
    >
      <div
        className={`text-[9px] font-black uppercase tracking-[0.18em] ${
          highlight
            ? "text-lime-400"
            : "text-white/30"
        }`}
      >
        {label}
      </div>

      <div className="mt-2 text-3xl font-black">
        {value}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-black/30 p-2">
      <div className="text-lg font-black">
        {value}
      </div>

      <div className="text-[7px] font-black uppercase tracking-[0.1em] text-white/25">
        {label}
      </div>
    </div>
  );
}
