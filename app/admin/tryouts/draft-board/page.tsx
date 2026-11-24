"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { draftTeams } from "@/lib/tryout-draft-teams";

type Player = { id:string; athlete_first_name:string; athlete_last_name:string; age_group:string; primary_position:string|null; secondary_position:string|null; school:string|null; checked_in:boolean; tryout_id:string };
type Placement = { registration_id:string; division:string; team:string };
type Board = { players:Player[]; placements:Placement[] };

export default function TryoutDraftBoard() {
  const [board, setBoard] = useState<Board|null>(null);
  const [teamId, setTeamId] = useState<string>(draftTeams[0].id);
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("");
  const [checkedOnly, setCheckedOnly] = useState(false);
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
  const teamPlayers = board?.players.filter(player => placements.some(row => row.team === team.id && row.registration_id === player.id)) ?? [];
  const pool = board?.players.filter(player =>
    (!division || player.age_group === division) && (!checkedOnly || player.checked_in)
    && [player.athlete_first_name, player.athlete_last_name, player.school, player.primary_position, player.secondary_position, player.tryout_id].join(" ").toLowerCase().includes(search.trim().toLowerCase())
    && !teamPlayers.some(member => member.id === player.id)) ?? [];
  async function save(registrationId: string, remove: boolean) {
    if (busy) return;
    setBusy(true);
    setSaveError("");
    try {
      const response = await fetch("/api/admin/tryouts/draft-board", {
        method: "PATCH", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({registrationId, team:team.id, remove}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Couldn’t save the change.");
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
      <p className="mt-2 text-white/70">Staff only. Changes are shared with coaches. You can move or remove players as you build each team.</p>
      <nav aria-label="Draft teams" className="my-5 flex flex-wrap gap-2">
        {draftTeams.map(item => <button key={item.id} type="button" aria-pressed={team.id === item.id} onClick={() => setTeamId(item.id)}
          className={button + (team.id === item.id ? " bg-lime-400 text-black" : "")}>
          {item.label}{board && ` (${placements.filter(row => row.team === item.id).length})`}
        </button>)}
      </nav>
      {error && <p role="alert" className="mb-4 text-red-300">{error}{board && " Showing the last loaded roster."}</p>}
      {saveError && <p role="alert" className="mb-4 text-red-300">{saveError}</p>}
      {busy && <p role="status" className="mb-3 text-lime-300">Saving draft change…</p>}
      {!board && !error && <p>Loading draft rosters…</p>}
      {board && <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-white/20 p-4">
          <h2 className="text-xl font-bold">{team.label} draft roster</h2>
          {!teamPlayers.length && <p className="mt-3 text-white/65">Add players from the tryout list.</p>}
          <ul className="mt-2 divide-y divide-white/15">{teamPlayers.map(player => <li key={player.id} className="flex items-center justify-between gap-2 py-3">
            <div><p className="font-bold">{playerName(player)}</p><p className="text-sm text-white/65">{player.tryout_id} · {player.primary_position || "Position unlisted"}</p></div>
            <button className={button} disabled={busy || !!error} onClick={() => void save(player.id,true)}>Remove</button>
          </li>)}</ul>
        </section>
        <section className="rounded-2xl border border-white/20 p-4">
          <h2 className="text-xl font-bold">Tryout players</h2>
          <label className="mt-3 block">Search players<input className="mt-1 w-full rounded-lg border border-white/25 bg-black p-2" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, school, position or ID" /></label>
          <label className="mt-3 block">Registered division <select className="rounded border border-white/25 bg-black p-2" value={division} onChange={e=>setDivision(e.target.value)}><option value="">All</option>{["12U","14U","15U","18U"].map(item=><option key={item}>{item}</option>)}</select></label>
          <label className="mt-3 block"><input type="checkbox" checked={checkedOnly} onChange={e=>setCheckedOnly(e.target.checked)} /> Checked in only</label>
          {!pool.length && <p className="mt-3">No players match.</p>}
          <ul className="mt-2 max-h-[38rem] divide-y divide-white/15 overflow-y-auto">{pool.map(player => {
            const peer = placements.find(row => row.registration_id === player.id && row.division === team.division);
            const assigned = placements.filter(row => row.registration_id === player.id).map(row => draftTeams.find(item=>item.id === row.team)?.label).filter(Boolean);
            return <li key={player.id} className="flex items-center justify-between gap-2 py-3">
              <div><p className="font-bold">{playerName(player)}</p><p className="text-sm text-white/65">{[player.tryout_id,player.primary_position,player.secondary_position,player.school,player.checked_in ? "Checked in" : "No recorded check-in"].filter(Boolean).join(" · ")}</p>
              {!!assigned.length && <p className="text-sm text-lime-300">Drafted: {assigned.join(", ")}</p>}</div>
              <button className={button} disabled={busy || !!error} onClick={() => void save(player.id,false)}>{peer ? "Move here" : "Add"}</button>
            </li>;
          })}</ul>
        </section>
      </div>}
    </div>
  </main>;
}
