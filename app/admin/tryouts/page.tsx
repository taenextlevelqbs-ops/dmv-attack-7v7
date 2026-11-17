"use client";
import Image from "next/image";
import {requestJson} from "@/lib/http.mjs";

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
  date_of_birth?: string | null;
  tryout_checked_in?: boolean | null;
  assigned_teams?: {id:string;name:string;status:string}[];
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
  decision_emails?: {decision:string;state:string;sent_at:string|null;error_message:string|null}[];

  submitted_at: string;

  headshot_url: string | null;
};

const divisions = [
  "ALL",
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

function athleteDOB(registration: Registration) {
  const value = registration.date_of_birth?.slice(0,10);
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Not recorded";
  const [year,month,day] = value.split("-");
  return `${month}/${day}/${year}`;
}
function athleteAge(registration: Registration) {
  if (!registration.date_of_birth) return registration.current_age == null ? "Not recorded" : `${registration.current_age} (at registration)`;
  const dob = registration.date_of_birth.slice(0,10);
  const today = new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  const age = Number(today.slice(0,4))-Number(dob.slice(0,4))-(today.slice(5)<dob.slice(5)?1:0);
  return Number.isFinite(age) && age>=0 ? String(age) : "Not recorded";
}
function readableStatus(status: string) {
  return status.replaceAll("_", " ");
}


function ParentMessage({ registration }: { registration: Registration }) {
  const athlete = registration.athlete_first_name;
  const [subject, setSubject] = useState("DMV Attack update for " + athlete);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const email = registration.parent_email?.trim() || "";
  const draft = "mailto:" + encodeURIComponent(email) + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(message);
  return <details className="mt-4 rounded-xl border border-white/20 p-4">
    <summary className="cursor-pointer text-sm font-bold text-lime-300">Message Parent</summary>
    <p className="mt-3 text-xs text-white/60">Write any message to this parent.</p>
    <p className="mt-3 break-all text-sm text-white/80">To: {email || "No parent email recorded"}</p>
    <label className="mt-3 block text-xs text-white/60">Subject
      <input value={subject} onChange={e=>setSubject(e.target.value)} className="mt-2 w-full rounded-xl border border-white/20 bg-black p-3 text-sm text-white" />
    </label>
    <label className="mt-3 block text-xs text-white/60">Message to {athlete}&apos;s parent
      <textarea placeholder="Type your message here…" rows={7} value={message} onChange={e=>{setMessage(e.target.value);setCopied(false);}} className="mt-2 w-full rounded-xl border border-white/20 bg-black p-3 text-sm leading-6 text-white" />
    </label>
    <div className="mt-3 flex flex-wrap gap-3">
      {email && subject.trim() && message.trim() ? <a href={draft} className="rounded-xl bg-lime-400 px-4 py-3 text-sm font-bold text-black">Open Email Draft</a> : null}
      <button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(message);setCopied(true);}catch{setCopied(false);}}} className="rounded-xl border border-white/25 px-4 py-3 text-sm font-bold">Copy Message</button>
    </div>
    <p role="status" className="mt-3 text-xs text-white/55">{copied ? "Message copied. Paste into your text or email." : "Opens your email app for review. Nothing is sent until you send it there. Draft edits are not saved after leaving this page."}</p>
  </details>;
}

export default function AdminTryoutsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<{id:string;name:string;age_group:string;season:string}[]>([]);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [attendance, setAttendance] = useState("ALL");

  const [selected, setSelected] = useState<Registration | null>(null);
  const [updating, setUpdating] = useState("");

  function loadRegistrations() {
    return requestJson("/api/admin/tryouts",{cache:"no-store"}).then(result=>{
      setRegistrations(result.registrations ?? []);
      setError("");
      const registrationId = new URLSearchParams(window.location.search).get("registration");
      if (registrationId) {
        const match = result.registrations?.find((r: Registration) => r.id === registrationId);
        if (match) setSelected(match);
      }

    }).catch((error:unknown)=>{setError(error instanceof Error?error.message:"Unable to load records");}).finally(()=>setLoading(false));
  }

  useEffect(() => {
    loadRegistrations();
    requestJson("/api/admin/teams", {cache:"no-store"})
      .then(result => setTeams(result.teams ?? []))
      .catch(() => setError("Unable to load teams. Refresh before accepting players."));
  }, []);

  async function updateStatus(
    registration: Registration,
    newStatus: string
  ) {
    if (registration.status === newStatus) return;
    if (["ACCEPTED","DECLINED","CALLBACK","OFFERED"].includes(newStatus) &&
      !window.confirm(`Set ${registration.athlete_first_name} ${registration.athlete_last_name} to ${newStatus}? If email notifications are enabled, this will notify the parent/guardian.`)) return;
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

      if (result.email && result.email !== "not_applicable" && result.email !== "sent" && result.email !== "already_sent") {
        alert(`Decision saved. Email status: ${result.email.replaceAll("_"," ")}. Check email settings before notifying family.`);
      }
      await loadRegistrations();
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
        matchesSearch && (attendance === "ALL" || (attendance === "CHECKED_IN" ? registration.tryout_checked_in === true : registration.tryout_checked_in !== true))
      );
    });
  }, [registrations, search, division, status, attendance]);

  const counts = useMemo(() => {
    return {
      total: registrations.length,

      checkedIn: registrations.filter(
        (item) => item.tryout_checked_in === true
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

            <Link href="/admin/family-updates" className="rounded-full border border-lime-400/40 bg-lime-400/10 px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-lime-400">Family Updates by Division</Link>

            <Link href="/admin/direct-invites" className="rounded-full border border-lime-400/40 bg-lime-400/10 px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-lime-400">Direct Player Invites</Link>

            <Link href="/admin/tryouts/payments" className="rounded-full border border-lime-400/40 px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-lime-400">Track $20 Payments</Link>

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

        <div className="mt-6">
          <label className="text-sm font-bold">Tryout attendance
            <select value={attendance} onChange={e=>setAttendance(e.target.value)} className="ml-3 rounded-xl border border-white/20 bg-black px-4 py-3 text-sm">
              <option value="ALL">All athletes</option><option value="CHECKED_IN">Checked in at tryout</option><option value="NOT_RECORDED">No recorded check-in</option>
            </select>
          </label>
          <p className="mt-2 text-xs text-white/55">No recorded check-in does not mean absent. Older roster decisions may have replaced the original check-in status.</p>
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
                    <Image unoptimized width={640} height={800}
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
                      DOB: {athleteDOB(registration)} · Age: {athleteAge(registration)} · {registration.grade || "Grade not listed"}
                      {registration.graduation_year
                        ? ` • Class of ${registration.graduation_year}`
                        : ""}
                    </div>
                  </div>
                </div>
              </button>

              <div className="border-t border-white/10 p-5">
                {registration.decision_emails?.length ? (
                  <div className="mb-3 text-xs text-white/60">
                    {registration.decision_emails.map((email) => <p key={email.decision}>{email.decision}: Email {email.state}</p>)}
                  </div>
                ) : null}
                <p className="mb-3 text-sm text-lime-300">Teams: {registration.assigned_teams?.length ? registration.assigned_teams.map(t=>`${t.name} (${readableStatus(t.status)})`).join(", ") : "Unassigned"}</p>
                <OfferPanel
                  athleteId={registration.id}
                  athleteName={`${registration.athlete_first_name} ${registration.athlete_last_name}`}
                  ageGroup={registration.age_group}
                  status={registration.status}
                  availableTeams={teams}
                  onSuccess={() => { void loadRegistrations(); }}
                />
                <p className="mt-4 rounded-xl border border-white/20 p-3 text-sm font-bold">Tryout: {registration.tryout_checked_in === true ? "✓ Checked in" : "No recorded check-in"}</p>
                <ParentMessage registration={registration} />
                <details className="mt-4"><summary className="cursor-pointer text-sm text-white/60">Other status options</summary>
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
                      <option key={item} value={item} disabled={item==="OFFERED"||item==="ACCEPTED"}>
                        {item==="OFFERED"?"OFFERED (Use Make Offer)":item==="ACCEPTED"?"ACCEPTED (Use Teams & Rosters)":readableStatus(item)}
                      </option>
                    ))}
                </select>
                </details>
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
                    <Image unoptimized width={640} height={800}
                      src={selected.headshot_url}
                      alt={`${selected.athlete_first_name} ${selected.athlete_last_name}`}
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
                        <option key={item} value={item} disabled={item==="OFFERED"||item==="ACCEPTED"}>
                          {item==="OFFERED"?"OFFERED (Use Make Offer)":item==="ACCEPTED"?"ACCEPTED (Use Teams & Rosters)":readableStatus(item)}
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
                    <Info label="Date of birth" value={athleteDOB(selected)} />
                    <Info label="Age" value={athleteAge(selected)} />
                    <Info label="Teams" value={selected.assigned_teams?.map(t=>t.name).join(", ") || "Unassigned"} />
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
                  key={selected.id}
                  status={selected.status}
                  availableTeams={teams}
                  athleteId={selected.id}
                  athleteName={`${selected.athlete_first_name} ${selected.athlete_last_name}`}
                  ageGroup={selected.age_group}
                  onSuccess={() => {
                    void loadRegistrations();
                    setRegistrations((current) =>
                      current.map((item) =>
                        item.id === selected.id
                          ? { ...item, status: "ACCEPTED" }
                          : item
                      )
                    );

                    setSelected((current) =>
                      current
                        ? { ...current, status: "ACCEPTED" }
                        : current
                    );
                  }}
                />

                <ParentMessage key={`parent-${selected.id}`} registration={selected} />

                <EvaluationPanel
                    key={selected.id}
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
