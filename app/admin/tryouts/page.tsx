"use client";

import Link from "next/link";
import EvaluationPanel from "./EvaluationPanel";
import OfferPanel from "./OfferPanel";
import { useEffect, useMemo, useState } from "react";

type Registration = {
  id: string;
  tryout_id: string;

  athlete_first_name: string;
  athlete_last_name: string;

  current_age: number | null;
  age_group: string;

  graduation_year: number | null;
  school: string | null;
  grade: string | null;

  height: string | null;
  weight: string | null;

  primary_position: string | null;
  secondary_position: string | null;

  current_team: string | null;
  years_playing: number | null;

  previous_7v7: boolean | null;
  previous_7v7_organization: string | null;

  highlight_url: string | null;
  athlete_social: string | null;
  football_background: string | null;

  parent_guardian_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;

  city: string | null;
  state: string | null;

  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;

  medical_information: string | null;

  referral_source: string | null;
  additional_comments: string | null;

  status: string;

  submitted_at: string;

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

const statuses = [
  "ALL",
  "REGISTERED",
  "CHECKED_IN",
  "EVALUATING",
  "CALLBACK",
  "OFFERED",
  "ACCEPTED",
  "DECLINED",
  "PASS",
];

function readableStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function AdminTryoutsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const [selected, setSelected] = useState<Registration | null>(null);
  const [updating, setUpdating] = useState("");

  async function loadRegistrations() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/tryouts", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load tryouts");
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

  async function updateStatus(
    registration: Registration,
    newStatus: string
  ) {
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
            status: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to update status"
        );
      }

      setRegistrations((current) =>
        current.map((item) =>
          item.id === registration.id
            ? { ...item, status: newStatus }
            : item
        )
      );

      setSelected((current) =>
        current?.id === registration.id
          ? { ...current, status: newStatus }
          : current
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to update status"
      );
    } finally {
      setUpdating("");
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return registrations.filter((registration) => {
      const matchesDivision =
        division === "ALL" ||
        registration.age_group === division;

      const matchesStatus =
        status === "ALL" ||
        registration.status === status;

      const haystack = [
        registration.athlete_first_name,
        registration.athlete_last_name,
        registration.tryout_id,
        registration.school,
        registration.primary_position,
        registration.parent_guardian_name,
        registration.parent_email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !term || haystack.includes(term);

      return (
        matchesDivision &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [registrations, search, division, status]);

  const counts = useMemo(() => {
    return {
      total: registrations.length,

      checkedIn: registrations.filter(
        (item) => item.status === "CHECKED_IN"
      ).length,

      offered: registrations.filter(
        (item) => item.status === "OFFERED"
      ).length,

      accepted: registrations.filter(
        (item) => item.status === "ACCEPTED"
      ).length,
    };
  }, [registrations]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-4 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-sm font-black uppercase tracking-[0.25em] text-lime-400">
            DMV Attack Admin
          </div>

          <h1 className="mt-4 text-4xl font-black uppercase">
            Loading Tryouts...
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-lime-400">
            DMV Attack Admin
          </div>

          <h1 className="mt-3 text-4xl font-black uppercase md:text-6xl">
            Tryout Command Center
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/50">
            Manage registrations, check-in, evaluations,
            callbacks, offers and roster decisions.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin/tryouts/check-in"
              className="rounded-full bg-lime-400 px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-black"
            >
              Open Check-In Mode
            </Link>

            <Link
              href="/admin"
              className="rounded-full border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-white"
            >
              Admin Home
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Registrations", counts.total],
            ["Checked In", counts.checkedIn],
            ["Offers", counts.offered],
            ["Accepted", counts.accepted],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl border border-white/10 bg-white/[0.035] p-5"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                {label}
              </div>

              <div className="mt-2 text-3xl font-black">
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search athlete, Tryout ID, school, position or parent..."
            className="rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 text-sm outline-none placeholder:text-white/25 focus:border-lime-400"
          />

          <select
            value={division}
            onChange={(event) => setDivision(event.target.value)}
            className="rounded-2xl border border-white/10 bg-black px-5 py-4 text-sm font-bold outline-none focus:border-lime-400"
          >
            {divisions.map((item) => (
              <option key={item} value={item}>
                {item === "ALL" ? "All Divisions" : item}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-2xl border border-white/10 bg-black px-5 py-4 text-sm font-bold outline-none focus:border-lime-400"
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item === "ALL"
                  ? "All Statuses"
                  : readableStatus(item)}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-white/35">
          Showing {filtered.length} of {registrations.length} athletes
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((registration) => (
            <article
              key={registration.id}
              className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03]"
            >
              <button
                type="button"
                onClick={() => setSelected(registration)}
                className="block w-full text-left"
              >
                <div className="relative aspect-[16/10] bg-white/5">
                  {registration.headshot_url ? (
                    <img
                      src={registration.headshot_url}
                      alt={`${registration.athlete_first_name} ${registration.athlete_last_name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-black uppercase tracking-[0.2em] text-white/20">
                      No Headshot
                    </div>
                  )}

                  <div className="absolute left-4 top-4 rounded-full bg-black/80 px-4 py-2 text-xs font-black text-lime-400 backdrop-blur">
                    {registration.tryout_id}
                  </div>

                  <div className="absolute right-4 top-4 rounded-full bg-lime-400 px-4 py-2 text-xs font-black text-black">
                    {registration.age_group}
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="text-2xl font-black uppercase">
                    {registration.athlete_first_name}{" "}
                    {registration.athlete_last_name}
                  </h2>

                  <div className="mt-2 text-sm font-bold text-lime-400">
                    {registration.primary_position || "Athlete"}
                    {registration.secondary_position
                      ? ` • ${registration.secondary_position}`
                      : ""}
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-white/50">
                    <div>
                      {registration.school || "School not listed"}
                    </div>

                    <div>
                      {registration.grade || "Grade not listed"}
                      {registration.graduation_year
                        ? ` • Class of ${registration.graduation_year}`
                        : ""}
                    </div>
                  </div>
                </div>
              </button>

              <div className="border-t border-white/10 p-5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                  Status
                </label>

                <select
                  value={registration.status}
                  disabled={updating === registration.id}
                  onChange={(event) =>
                    updateStatus(
                      registration,
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm font-bold outline-none focus:border-lime-400 disabled:opacity-50"
                >
                  {statuses
                    .filter((item) => item !== "ALL")
                    .map((item) => (
                      <option key={item} value={item}>
                        {readableStatus(item)}
                      </option>
                    ))}
                </select>
              </div>
            </article>
          ))}
        </div>

        {!filtered.length && !error && (
          <div className="mt-10 rounded-[30px] border border-white/10 bg-white/[0.025] p-10 text-center">
            <div className="text-xl font-black uppercase">
              No Athletes Found
            </div>

            <p className="mt-2 text-sm text-white/45">
              Change your filters or search terms.
            </p>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-4 backdrop-blur-md md:p-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[34px] border border-white/10 bg-[#080808]">
            <div className="flex items-center justify-between border-b border-white/10 p-5 md:p-7">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400">
                  {selected.tryout_id} • {selected.age_group}
                </div>

                <h2 className="mt-2 text-3xl font-black uppercase">
                  {selected.athlete_first_name}{" "}
                  {selected.athlete_last_name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase"
              >
                Close
              </button>
            </div>

            <div className="grid lg:grid-cols-[340px_1fr]">
              <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r lg:p-7">
                <div className="overflow-hidden rounded-3xl bg-white/5">
                  {selected.headshot_url ? (
                    <img
                      src={selected.headshot_url}
                      alt=""
                      className="aspect-[4/5] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/5] items-center justify-center text-white/20">
                      No Headshot
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                    Decision Status
                  </label>

                  <select
                    value={selected.status}
                    disabled={updating === selected.id}
                    onChange={(event) =>
                      updateStatus(
                        selected,
                        event.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm font-bold outline-none focus:border-lime-400"
                  >
                    {statuses
                      .filter((item) => item !== "ALL")
                      .map((item) => (
                        <option key={item} value={item}>
                          {readableStatus(item)}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="space-y-8 p-5 md:p-7">
                <section>
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
                    Athlete
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Info label="Primary Position" value={selected.primary_position} />
                    <Info label="Secondary Position" value={selected.secondary_position} />
                    <Info label="School" value={selected.school} />
                    <Info label="Grade" value={selected.grade} />
                    <Info label="Height" value={selected.height} />
                    <Info label="Weight" value={selected.weight} />
                    <Info
                      label="Experience"
                      value={
                        selected.years_playing !== null
                          ? `${selected.years_playing} years`
                          : null
                      }
                    />
                    <Info label="Current Team" value={selected.current_team} />
                  </div>
                </section>

                <section>
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
                    Parent / Guardian
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Info label="Name" value={selected.parent_guardian_name} />
                    <Info label="Phone" value={selected.parent_phone} />
                    <Info label="Email" value={selected.parent_email} />
                    <Info
                      label="Location"
                      value={
                        [selected.city, selected.state]
                          .filter(Boolean)
                          .join(", ") || null
                      }
                    />
                  </div>
                </section>

                <section>
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
                    Football Profile
                  </div>

                  <div className="mt-4 space-y-4">
                    <Info
                      label="Previous 7v7"
                      value={
                        selected.previous_7v7 === null
                          ? null
                          : selected.previous_7v7
                            ? "Yes"
                            : "No"
                      }
                    />

                    <Info
                      label="Previous Organization"
                      value={selected.previous_7v7_organization}
                    />

                    <Info
                      label="Football Background"
                      value={selected.football_background}
                    />

                    {selected.highlight_url && (
                      <a
                        href={selected.highlight_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-full bg-lime-400 px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-black"
                      >
                        Watch Highlights
                      </a>
                    )}
                  </div>
                </section>

                <section>
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
                    Emergency Information
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Info
                      label="Emergency Contact"
                      value={selected.emergency_contact_name}
                    />

                    <Info
                      label="Emergency Phone"
                      value={selected.emergency_contact_phone}
                    />
                  </div>

                  <div className="mt-4">
                    <Info
                      label="Medical Information"
                      value={selected.medical_information}
                    />
                  </div>
                </section>

                <OfferPanel
                  athleteId={selected.id}
                  athleteName={`${selected.athlete_first_name} ${selected.athlete_last_name}`}
                  ageGroup={selected.age_group}
                  onSuccess={() => {
                    setRegistrations((current) =>
                      current.map((item) =>
                        item.id === selected.id
                          ? { ...item, status: "OFFERED" }
                          : item
                      )
                    );

                    setSelected((current) =>
                      current
                        ? { ...current, status: "OFFERED" }
                        : current
                    );
                  }}
                />

                <EvaluationPanel
                  tryoutSubmissionId={selected.id}
                />

                <section>
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
                    Registration Notes
                  </div>

                  <div className="mt-4 grid gap-4">
                    <Info
                      label="Additional Registration Comments"
                      value={selected.additional_comments}
                    />

                    <Info
                      label="Referral Source"
                      value={selected.referral_source}
                    />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">
        {label}
      </div>

      <div className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-white/75">
        {value || "Not provided"}
      </div>
    </div>
  );
}
