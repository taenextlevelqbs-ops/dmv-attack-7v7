"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { draftTeams } from "@/lib/tryout-draft-teams";

type Player = { id:string; athlete_first_name:string; athlete_last_name:string; age_group:string; primary_position:string|null; secondary_position:string|null; school:string|null; checked_in:boolean; tryout_id:string; headshot_url:string|null };
type Placement = { registration_id:string; division:string; team:string; parent_email:string|null; registration_email:string|null };
type Guest = { id:string; team:string; name:string; parent_email:string|null };
type Board = { players:Player[]; placements:Placement[]; guests:Guest[] };

function PlayerPhoto({ url }: { url: string | null }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  return (
    <div aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 text-center text-xs text-white/70">
      {url && url !== failedUrl ? (
        // The signed registration photo is loaded directly from private storage.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailedUrl(url)} className="h-full w-full object-cover" />
      ) : "No photo"}
    </div>
  );
}

function ParentEmail({ name, email, registrationEmail, disabled, button, onSave }: {
  name: string;
  email: string | null;
  registrationEmail?: string | null;
  disabled: boolean;
  button: string;
  onSave: (email: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const currentEmail = email || registrationEmail;

  if (!editing) {
    return <div className="mt-2 flex flex-wrap items-center gap-2">
      {currentEmail && <p className="break-all text-sm text-white/70">{currentEmail}</p>}
      <button type="button" className={button} disabled={disabled} aria-label={`${currentEmail ? "Edit" : "Add"} parent email for ${name}`} onClick={() => {
        setValue(currentEmail || "");
        setEditing(true);
      }}>{currentEmail ? "Edit email" : "Add parent email"}</button>
    </div>;
  }

  return <form className="mt-3" onSubmit={async event => {
    event.preventDefault();
    if (await onSave(value)) setEditing(false);
  }}>
    <label className="block text-sm font-bold">Parent email for {name}
      <input type="email" autoComplete="off" maxLength={254} value={value} disabled={disabled}
        onChange={event => setValue(event.target.value)}
        className="mt-1 w-full rounded-lg border border-white/25 bg-black p-2 text-base" />
    </label>
    {registrationEmail && <p className="mt-1 text-xs text-white/70">Leave blank to use the registration email.</p>}
    <div className="mt-2 flex flex-wrap gap-2">
      <button type="submit" className={button + " bg-lime-400 text-black"} disabled={disabled}>Save email</button>
      <button type="button" className={button} disabled={disabled} onClick={() => setEditing(false)}>Cancel</button>
    </div>
  </form>;
}

export default function TryoutDraftBoard() {
  const [board, setBoard] = useState<Board|null>(null);
  const [teamId, setTeamId] = useState<string>(draftTeams[0].id);
  const [guestName, setGuestName] = useState("");
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("");
  const [view, setView] = useState<"players" | "roster">("roster");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const version = useRef(0);
  const load = useCallback(async () => {
    const current = ++version.current;
    try {
      const response = await fetch("/api/admin/tryouts/draft-board", {cache:"no-store"});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (current === version.current) { setBoard(data); setError(""); }
    } catch (e) {
      if (current === version.current) setError(e instanceof Error ? e.message : "Couldn’t load the board.");
    }
  }, []);
  useEffect(() => {
    if (busy) return;
    void load();
    const timer = window.setInterval(() => { if (!document.hidden) void load(); }, 5000);
    return () => { ++version.current; window.clearInterval(timer); };
  }, [busy, load]);
  const team = draftTeams.find(item => item.id === teamId) ?? draftTeams[0];
  const placements = board?.placements ?? [];
  const guests = board?.guests ?? [];
  const teamGuests = guests.filter(guest => guest.team === team.id);
  const teamPlayers = board?.players.filter(player => placements.some(row => row.team === team.id && row.registration_id === player.id)) ?? [];
  const pool = board?.players.filter(player =>
    (!division || player.age_group === division)
    && [player.athlete_first_name, player.athlete_last_name, player.school, player.primary_position, player.secondary_position, player.tryout_id].join(" ").toLowerCase().includes(search.trim().toLowerCase())
    && !teamPlayers.some(member => member.id === player.id)) ?? [];
  async function save(change: {registrationId:string; remove:boolean} | {action:"addGuest"; name:string} | {action:"removeGuest"; id:string} | {action:"saveParentEmail"; kind:"registered"|"guest"; id:string; email:string}) {
    if (busy) return false;
    setBusy(true);
    setSaveError("");
    try {
      const response = await fetch("/api/admin/tryouts/draft-board", {
        method: "PATCH", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({...change, team:team.id}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if ("action" in change && change.action === "addGuest") setGuestName("");
      return true;
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Couldn’t save the change.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  function playerName(player:Player) { return player.athlete_first_name + " " + player.athlete_last_name; }
  const button = "rounded-xl border border-white/25 px-3 py-2 text-sm font-bold disabled:opacity-50";
  return <main className="min-h-screen bg-black px-4 py-7 text-white">
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/tryouts" className="text-sm font-bold text-lime-300">Back to Tryouts</Link>
      <h1 className="mt-3 text-4xl font-black">Draft Roster Board</h1>
      <p className="mt-2 text-white/70">Pick a team to view its roster. Draft changes are shared with coaches only.</p>
      <nav aria-label="Draft teams" className="my-5 flex flex-wrap gap-2">
        {draftTeams.map(item => <button key={item.id} type="button" aria-pressed={team.id === item.id} disabled={busy} onClick={() => { setTeamId(item.id); setGuestName(""); }}
          className={button + (team.id === item.id ? " bg-lime-400 text-black" : "")}>
          {item.label}{board && ` (${placements.filter(row => row.team === item.id).length + guests.filter(guest => guest.team === item.id).length})`}
        </button>)}
      </nav>
      {error && <p role="alert" className="mb-4 text-red-300">{error}{board && " Showing the last loaded roster."}</p>}
      {saveError && <p role="alert" className="mb-4 text-red-300">{saveError}</p>}
      {busy && <p role="status" className="mb-3 text-lime-300">Saving draft change…</p>}
      {!board && !error && <p>Loading draft rosters…</p>}
      {board && <nav aria-label="Draft board view" className="mb-4 grid grid-cols-2 gap-2 md:hidden">
        <button type="button" aria-pressed={view === "roster"} className={button + (view === "roster" ? " bg-white text-black" : "")} onClick={() => setView("roster")}>Roster ({teamPlayers.length + teamGuests.length})</button>
        <button type="button" aria-pressed={view === "players"} className={button + (view === "players" ? " bg-white text-black" : "")} onClick={() => setView("players")}>Add players</button>
      </nav>}
      {board && <div className="grid gap-5 md:grid-cols-2">
        <section className={"rounded-2xl border border-white/20 p-4 md:block " + (view === "roster" ? "" : "hidden")}>
          <h2 className="text-xl font-bold">{team.label} draft roster</h2>
          {!teamPlayers.length && !teamGuests.length && <p className="mt-3 text-white/65">Add players from the tryout list.</p>}
          <ul className="mt-2 divide-y divide-white/15">
            {teamPlayers.map(player => {
              const placement = placements.find(row => row.team === team.id && row.registration_id === player.id);
              return <li key={player.id} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3"><PlayerPhoto url={player.headshot_url} /><div><p className="font-bold">{playerName(player)}</p><p className="text-sm text-white/65">{player.tryout_id} · {player.primary_position || "Position unlisted"}</p></div></div>
                  <button type="button" className={button} disabled={busy || !!error} onClick={() => void save({registrationId:player.id,remove:true})}>Remove</button>
                </div>
                <ParentEmail key={team.id} name={playerName(player)} email={placement?.parent_email ?? null}
                  registrationEmail={placement?.registration_email} disabled={busy || !!error} button={button}
                  onSave={email => save({action:"saveParentEmail",kind:"registered",id:player.id,email})} />
              </li>;
            })}
            {teamGuests.map(guest => <li key={guest.id} className="py-3">
              <div className="flex items-center justify-between gap-2">
                <div><p className="font-bold">{guest.name}</p><p className="text-sm text-amber-300">Not registered yet</p></div>
                <button type="button" className={button} disabled={busy || !!error} onClick={() => void save({action:"removeGuest",id:guest.id})}>Remove</button>
              </div>
              <ParentEmail name={guest.name} email={guest.parent_email} disabled={busy || !!error} button={button}
                onSave={email => save({action:"saveParentEmail",kind:"guest",id:guest.id,email})} />
            </li>)}
          </ul>

        </section>
        <section className={"rounded-2xl border border-white/20 p-4 md:block " + (view === "players" ? "" : "hidden")}>
          <h2 className="text-xl font-bold">Registered players</h2>
          <details className="mt-3 rounded-xl border border-white/20 p-3">
            <summary className="cursor-pointer font-bold text-lime-300">Add an unregistered player by name</summary>
          <form className="mt-3" onSubmit={e=>{e.preventDefault();if(guestName.trim()) void save({action:"addGuest",name:guestName});}}>
            <label className="block text-sm font-bold">Player’s full name
              <input value={guestName} onChange={e=>setGuestName(e.target.value)} required maxLength={100} className="mt-1 w-full rounded-lg border border-white/25 bg-black p-2" />
            </label>
            <button disabled={busy || !!error || !guestName.trim()} className={button + " mt-2"}>Add to {team.label}</button>
          </form>
          </details>
          <label className="mt-3 block">Search players<input className="mt-1 w-full rounded-lg border border-white/25 bg-black p-2" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, school, position or ID" /></label>
          <label className="mt-3 block">Registered division <select className="rounded border border-white/25 bg-black p-2" value={division} onChange={e=>setDivision(e.target.value)}><option value="">All</option>{["12U","14U","15U","18U"].map(item=><option key={item}>{item}</option>)}</select></label>
          {!pool.length && <p className="mt-3">No players match.</p>}
          <ul className="mt-2 divide-y divide-white/15 md:max-h-[38rem] md:overflow-y-auto">{pool.map(player => {
            const peer = placements.find(row => row.registration_id === player.id && row.division === team.division);
            const assigned = placements.filter(row => row.registration_id === player.id).map(row => draftTeams.find(item=>item.id === row.team)?.label).filter(Boolean);
            return <li key={player.id} className="flex items-center justify-between gap-2 py-3">
              <div className="flex min-w-0 items-center gap-3"><PlayerPhoto url={player.headshot_url} /><div><p className="font-bold">{playerName(player)}</p><p className="text-sm text-white/65">{[player.tryout_id,player.primary_position,player.secondary_position,player.school,player.checked_in ? "Checked in" : "No recorded check-in"].filter(Boolean).join(" · ")}</p>
              {!!assigned.length && <p className="text-sm text-lime-300">Drafted: {assigned.join(", ")}</p>}</div></div>
              <button className={button + " shrink-0 bg-lime-400 text-black"} disabled={busy || !!error} onClick={() => void save({registrationId:player.id,remove:false})}>{peer ? "Move here" : "Add"}</button>
            </li>;
          })}</ul>
        </section>
      </div>}
    </div>
  </main>;
}
