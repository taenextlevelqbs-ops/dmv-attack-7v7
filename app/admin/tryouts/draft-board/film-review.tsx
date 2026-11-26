"use client";

import { useEffect, useState } from "react";
import { draftTeams } from "@/lib/tryout-draft-teams";
import { filmDivisions, filmPositions, safeFilmUrl } from "@/lib/tryout-film";

type Submission = {
  id: string;
  registration_id: string | null;
  athlete_name: string;
  parent_email: string;
  age_group: string;
  school: string | null;
  primary_position: string | null;
  secondary_position: string | null;
  film_url: string;
};

export default function FilmReview({ placements, guests, onDraft, disabled }: {
  placements: { registration_id: string; division: string; team: string }[];
  guests: { team: string; name: string }[];
  onDraft: (id: string, team: string) => Promise<boolean>;
  disabled: boolean;
}) {
  const [films, setFilms] = useState<Submission[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("");
  const [position, setPosition] = useState("");
  const [source, setSource] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/admin/tryouts/draft-board?film", { signal: controller.signal, cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        setFilms(result.submissions);
        setError("");
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Couldn’t load film submissions.");
      }
    }
    void load();
    const timer = window.setInterval(() => { if (!document.hidden) void load(); }, 15000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, []);

  const searchTerm = search.trim().toLowerCase();
  const visibleFilms = films?.filter(film =>
    (!division || film.age_group === division)
    && (!position || film.primary_position === position || film.secondary_position === position)
    && (!source || Boolean(film.registration_id) === (source === "registered"))
    && [film.athlete_name, film.school, film.parent_email].join(" ").toLowerCase().includes(searchTerm));
  const input = "mt-1 block w-full rounded-lg border border-white/25 bg-black p-2";
  return <section className="rounded-2xl border border-white/20 p-4">
    <h2 className="text-xl font-bold">Film Review</h2>
    {error && <p role="alert" className="mt-3 text-red-300">{error}</p>}
    {!films && !error && <p className="mt-3">Loading film submissions…</p>}
    {films?.length === 0 && <p className="mt-3 text-white/70">No film submissions yet.</p>}
    {!!films?.length && <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label>Search<input value={search} onChange={event => setSearch(event.target.value)}
        placeholder="Name, school, or parent email" className={input} /></label>
      <label>Age group<select value={division} onChange={event => setDivision(event.target.value)} className={input}>
        <option value="">All age groups</option>
        {filmDivisions.map(value => <option key={value}>{value}</option>)}
      </select></label>
      <label>Position<select value={position} onChange={event => setPosition(event.target.value)} className={input}>
        <option value="">All positions</option>
        {filmPositions.map(value => <option key={value}>{value}</option>)}
      </select></label>
      <label>Registration<select value={source} onChange={event => setSource(event.target.value)} className={input}>
        <option value="">All submissions</option><option value="registered">Already registered</option><option value="new">New player</option>
      </select></label>
    </div>}
    {!!films?.length && <p aria-live="polite" className="mt-3 text-sm text-white/70">{visibleFilms?.length} of {films.length} submissions</p>}
    {!!films?.length && visibleFilms?.length === 0 && <p className="mt-2">No submissions match these filters.</p>}
    <ul className="divide-y divide-white/15">
      {visibleFilms?.map(film => {
        const teams = draftTeams.filter(team => team.division === film.age_group);
        const assigned = teams.filter(team => film.registration_id
          ? placements.some(row => row.team === team.id && row.registration_id === film.registration_id)
          : guests.some(row => row.team === team.id && row.name.trim().toLowerCase() === film.athlete_name.toLowerCase()));
        const url = safeFilmUrl(film.film_url);
        return <li key={film.id} className="py-4">
          <h3 className="text-lg font-bold">{film.athlete_name}</h3>
          <p className="mt-1 text-sm text-white/75">{[film.age_group, film.school, ...new Set([film.primary_position, film.secondary_position])].filter(Boolean).join(" · ")}</p>
          <p className="mt-1 break-all text-sm text-white/75">{film.parent_email}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {url && <a href={url} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-lime-400 px-3 py-2 text-sm font-bold text-black">Watch film</a>}
            {assigned.length > 0
              ? <p className="text-sm text-lime-300">On draft roster · {assigned.map(team => team.label).join(", ")}</p>
              : teams.map(team => <button key={team.id} type="button" disabled={disabled}
                className="rounded-xl border border-white/25 px-3 py-2 text-sm font-bold disabled:opacity-50"
                onClick={() => void onDraft(film.id, team.id)}>Add to {team.label}</button>)}
            {teams.length === 0 && <p className="text-sm text-white/70">No {film.age_group} draft team is set up.</p>}
          </div>
        </li>;
      })}
    </ul>
  </section>;
}
