"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import SignOutButton from "./SignOutButton";
import type { SeasonData } from "./season-data";

const button = "inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-xs font-bold transition hover:border-lime-400 focus-visible:outline-lime-400";
const panel = "rounded-2xl border border-white/15 bg-white/[0.035] p-5";
const divisions = ["10U", "12U", "14U", "15U", "18U Green", "18U Yellow"];

export default function SeasonWorkspace({ name, owner, directory = false }: { name: string; owner: boolean; directory?: boolean }) {
  const [data, setData] = useState<SeasonData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("");
  const [status, setStatus] = useState("");
  const [path, setPath] = useState("");
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/command-center", { cache: "no-store", signal });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to load season records");
      setData(json);
    } catch (e) {
      if (signal?.aborted) return;
      // Do not present a previous response as fresh after a failed refresh.
      setData(null); setError(e instanceof Error ? e.message : "Unable to load season records");
    } finally { if (!signal?.aborted) setLoading(false); }
  }, []);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  const filtered = useMemo(() => (data?.registrations || []).filter(r => {
    const haystack = [r.athlete_first_name,r.athlete_last_name,r.tryout_id,r.id,r.parent_email,r.parent_guardian_name,r.linked_family_id,r.linked_athlete_id,r.school].join(" ").toLowerCase();
    return (!search.trim() || haystack.includes(search.trim().toLowerCase())) && (!division || r.age_group === division) && (!status || r.status === status) && (!path || (path === "invited" ? r.referral_source === "Direct Invitation" : r.referral_source !== "Direct Invitation"));
  }), [data,search,division,status,path]);
  const accepted = data?.assignments ? new Set(data.assignments.filter(a=>a.roster_status==="ACCEPTED").map(a=>a.tryout_submission_id)).size : null;
  const actions = [
    ["Athlete directory", "All registration paths, headshots and linked profiles", "/admin/athletes"],
    ["Check in / walk-up", "Record attendance or register an arriving athlete", "/admin/tryouts/check-in"],
    ["Review & accept", "Review an athlete, make an offer and assign a team", "/admin/tryouts"],
    ["Invite a player", "Guaranteed-play and direct invitations", "/admin/direct-invites"],
    ["Teams & rosters", "Review offers and activate accepted athletes", "/admin/teams"],
    ["Family updates", "Preview unique recipients by team or age group", "/admin/family-updates"],
  ];
  return <main id="main-content" className="min-h-screen bg-black px-4 pb-12 pt-6 text-white md:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-5">
        <Link href="/admin" className="text-sm font-black italic">DMV <span className="text-lime-400">ATTACK</span></Link>
        <div className="flex flex-wrap gap-2"><Link className={button} href="/admin/schedule">Schedule</Link>{owner && <Link className={button} href="/admin/payments">Payments</Link>}<Link className={button} href="/admin/settings">Settings</Link></div>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4 py-7">
        <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">2027 season · {owner ? "Owner" : "Admin"}</p><h1 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-5xl">{directory ? "Athlete directory" : "Command Center"}</h1><p className="mt-3 text-sm text-white/60">{directory ? "One directory for tryout, guaranteed-play, walk-up and invited registrations." : `Welcome back, ${name}. Run the season from your existing DMV Attack account.`}</p></div>
        <button className={button} disabled={loading} onClick={()=>void load()}>{loading ? "Loading records…" : "Refresh records"}</button>
      </div>
      <nav aria-label="Season workspace" className="mb-6 flex gap-2 overflow-x-auto pb-2">{[["Overview","/admin"],["Athletes","/admin/athletes"],["Rosters","/admin/teams"],["Attendance","/admin/tryouts/check-in"],["Families","/admin/families"],["Email groups","/admin/family-updates"]].map(([label,href])=><Link key={href} href={href} className={button+" shrink-0"}>{label}</Link>)}</nav>
      {error && <div role="alert" className="mb-5 rounded-xl border border-red-400/40 p-4 text-sm text-red-200">{error} No records are shown until the connection succeeds.</div>}
      {!!data?.problems.length && <div role="alert" className="mb-5 rounded-xl border border-amber-300/40 p-4 text-sm text-amber-100">{data.problems.join(" ")} Unavailable values are shown as —, never zero.</div>}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{[["Registrations",data?.registrations?.length],["Accepted · 2027",accepted],["Athlete profiles",data?.athlete_count],["Families",data?.family_count]].map(([label,value])=><div key={label} className={panel}><p className="text-[10px] font-bold uppercase tracking-widest text-white/60">{label}</p><p className="mt-3 text-3xl font-black">{loading ? "…" : value ?? "—"}</p></div>)}</div>
      {data && <p className="mb-6 text-xs text-white/55">Records read {new Date(data.fetched_at).toLocaleString("en-US",{timeZone:"America/New_York"})} Eastern. Registration totals include every entry path; acceptance is counted from active 2027 rosters.</p>}
      {!directory && <><section aria-labelledby="quick-actions"><h2 id="quick-actions" className="mb-4 text-xl font-black">Make your next move</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{actions.map(([title,desc,href])=><Link key={href} href={href} className={panel+" min-h-32 transition hover:border-lime-400/60"}><h3 className="font-black text-lime-400">{title} <span aria-hidden>→</span></h3><p className="mt-3 text-xs leading-6 text-white/60">{desc}</p></Link>)}</div></section>
      <section className="mt-8" aria-labelledby="season-teams"><div className="mb-4 flex items-center justify-between"><h2 id="season-teams" className="text-xl font-black">Six teams. One program.</h2><Link className={button} href="/admin/teams">Manage rosters</Link></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{divisions.map(label=>{
        const matches = data?.teams?.filter(t=>t.name.toLowerCase()===label.toLowerCase()) || [];
        const team=matches.length===1?matches[0]:null;
        const rows = team && data?.assignments ? data.assignments.filter(a=>a.team_id===team.id) : null;
        return <article key={label} className={panel+" border-l-2 border-l-lime-400"}><div className="flex justify-between"><h3 className="text-2xl font-black">{label}</h3><span className="text-xs text-white/50">2027</span></div><p className="mt-5 text-sm">Accepted: <strong>{rows ? new Set(rows.filter(a=>a.roster_status==="ACCEPTED").map(a=>a.tryout_submission_id)).size : "—"}</strong> <span className="ml-3 text-white/60">Offers: {rows ? new Set(rows.filter(a=>a.roster_status==="OFFERED").map(a=>a.tryout_submission_id)).size : "—"}</span></p><p className="mt-3 text-xs text-white/60">Coaches: {team?.coaches ? team.coaches.join(", ") || "Unassigned" : "Unavailable"}</p>{!loading && !team && <p className="mt-2 text-xs text-amber-200">{matches.length>1?"Multiple matching teams; review setup.":"Team record not loaded; verify setup."}</p>}<Link href={team ? `/admin/teams?team=${encodeURIComponent(team.id)}` : "/admin/teams"} className={button+" mt-4"}>Open roster</Link></article>;
      })}</div></section></>}
      <section className="mt-8" aria-labelledby="directory"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id="directory" className="text-xl font-black">Find an athlete</h2><Link className={button} href="/admin/tryouts">Open review tools</Link></div><div className={panel}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><input className="min-h-12 rounded-xl border border-white/20 bg-black px-4 text-sm" aria-label="Search all athletes" placeholder="Name, registration ID, family, email…" value={search} onChange={e=>setSearch(e.target.value)}/><select aria-label="Age group" className={button+" bg-black"} value={division} onChange={e=>setDivision(e.target.value)}><option value="">All divisions</option>{["10U","12U","14U","15U","18U"].map(d=><option key={d}>{d}</option>)}</select><select aria-label="Registration status" className={button+" bg-black"} value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option>{["REGISTERED","CHECKED_IN","EVALUATING","CALLBACK","OFFERED","ACCEPTED","DECLINED","PASS"].map(s=><option key={s}>{s}</option>)}</select><select aria-label="Entry path" className={button+" bg-black"} value={path} onChange={e=>setPath(e.target.value)}><option value="">All entry paths</option><option value="invited">Direct invitation / guaranteed-play</option><option value="other">Other / entry path not recorded</option></select></div>
        <p className="mt-4 text-xs text-white/55">Tryout and walk-up records share the same database. Original source labels are shown as recorded; an unknown entry path is never guessed.</p>
        {loading ? <p className="py-10 text-center text-sm" role="status">Loading existing athlete records…</p> : !data?.registrations ? <p className="py-10 text-center text-sm text-amber-200">Registration data unavailable. Refresh to retry.</p> : <><p className="my-4 text-xs text-white/60" aria-live="polite">{filtered.length} matching registrations</p><div className="grid gap-3 lg:grid-cols-2">{(directory?filtered:filtered.slice(0,6)).map(r=><article key={r.id} className="rounded-xl border border-white/15 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-black">{r.athlete_first_name} {r.athlete_last_name}</h3><p className="mt-1 break-all text-xs text-white/55">{r.tryout_id} · {r.age_group} · {r.primary_position || "Position not recorded"}</p></div><span className="rounded-full bg-lime-400/10 px-3 py-2 text-[10px] font-bold text-lime-300">{r.status}</span></div><p className="mt-3 text-xs text-white/60">Source: {r.referral_source || "Not recorded"}<br/>Family: {r.linked_family_id?"Linked":"Not linked"} · Athlete profile: {r.linked_athlete_id?"Linked":"Not linked"}<br/>Headshot: {r.has_headshot?"On file":"Not on file"}</p><Link className={button+" mt-4"} href={`/admin/tryouts?registration=${encodeURIComponent(r.id)}`}>View headshot & registration</Link></article>)}</div>{!filtered.length && <p className="py-8 text-center text-sm text-white/60">No matching registrations. Clear the filters or refresh.</p>}{!directory && filtered.length>6 && <Link href="/admin/athletes" className={button+" mt-5"}>View all {filtered.length} matching records</Link>}</>}
      </div></section>
      <div className="mt-8 grid gap-4 md:grid-cols-2"><section className={panel}><h2 className="font-black">Connected operations</h2><p className="mt-3 text-sm leading-6 text-white/60">Review offers and accept athletes through the current roster workflow. Family profiles and siblings keep their existing links. Team fees and Stripe checkout stay in the current payment system.</p><div className="mt-4 flex flex-wrap gap-2">{owner && <><Link href="/admin/finance" className={button}>Team fee balances</Link><Link href="/admin/foundation" className={button}>Foundation & sponsors</Link></>}<Link href="/admin/family-updates" className={button}>Team email groups</Link></div></section><section className={panel}><h2 className="font-black text-amber-200">Still needs verification</h2><p className="mt-3 text-sm leading-6 text-white/60">Tournament dates are listed in the organization schedule; entry and travel must be confirmed. Practice scheduling, season attendance and a separate coach portal are not enabled by this dashboard. Stripe checkout and email delivery need an end-to-end verification before being called fully tested.</p><Link href="/admin/schedule" className={button+" mt-4"}>Review current schedule</Link></section></div>
      <div className="mt-8 flex justify-end border-t border-white/15 pt-5"><SignOutButton /></div>
    </div>
  </main>;
}
