"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { filmDivisions, filmPositions } from "@/lib/tryout-film";

const input = "mt-1 min-h-12 w-full rounded-xl border border-white/25 bg-black px-3 text-white";

export default function TryoutFilmPage() {
  const [mode, setMode] = useState<"new" | "registered">("new");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setStatus("saving");
    setError("");
    try {
      const response = await fetch("/api/tryouts/film", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, mode }),
      });
      const result = await response.json();
      if (!response.ok || !result.saved) throw new Error(result.error || "Couldn’t submit your film.");
      setStatus("saved");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn’t submit your film. Try again.");
      setStatus("idle");
    }
  }

  return <main className="min-h-screen bg-black px-4 py-8 text-white">
    <div className="mx-auto max-w-xl">
      <Link href="/tryouts" className="font-bold text-lime-300">Back to Tryouts</Link>
      <h1 className="mt-4 text-4xl font-black">Submit your film</h1>
      <p className="mt-3 text-white/75">Missed DMV Attack tryouts? Send your highlights for coaches to review for the 2027 season.</p>
      {status === "saved" ? <section className="mt-6 rounded-2xl border border-lime-400/40 p-5" role="status">
        <h2 className="text-xl font-bold">Film received</h2>
        <p className="mt-2">Thanks for sending your film. Our coaches will review it and reach out if there’s a roster spot available.</p>
      </section> : <>
        <div role="group" aria-label="Registration status" className="mt-6 grid grid-cols-2 gap-2">
          {(["new", "registered"] as const).map(option => <button key={option} type="button"
            disabled={status === "saving"} aria-pressed={mode === option}
            onClick={() => { setMode(option); setError(""); }}
            className={"rounded-xl border border-white/25 px-2 py-3 font-bold " + (mode === option ? "bg-lime-400 text-black" : "")}>
            {option === "new" ? "New player" : "Already registered"}
          </button>)}
        </div>
        <form onSubmit={submit} className="mt-5">
          <fieldset disabled={status === "saving"} className="grid gap-4 disabled:opacity-70">
            {mode === "new" ? <div key="new" className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">Athlete’s full name<input name="name" maxLength={100} required className={input} /></label>
              <label>Age group<select name="division" required defaultValue="" className={input}>
                <option value="" disabled>Choose age group</option>
                {filmDivisions.map(division => <option key={division}>{division}</option>)}
              </select></label>
              <label>School<input name="school" maxLength={120} required className={input} /></label>
              <label>Primary position<select name="primaryPosition" required defaultValue="" className={input}>
                <option value="" disabled>Choose position</option>
                {filmPositions.map(position => <option key={position}>{position}</option>)}
              </select></label>
              <label>Secondary position<select name="secondaryPosition" className={input}>
                <option value="">Optional</option>
                {filmPositions.map(position => <option key={position}>{position}</option>)}
              </select></label>
            </div> : <div key="registered" className="grid gap-4 sm:grid-cols-2">
              <label>Athlete’s date of birth<input type="date" name="dob" required className={input} /></label>
              <label>Tryout ID (optional)<input name="tryoutId" maxLength={40} className={input} /></label>
            </div>}
            <label>{mode === "registered" ? "Parent email used at registration" : "Parent or guardian email"}
              <input type="email" name="parentEmail" maxLength={254} required autoComplete="email" className={input} />
            </label>
            <label>Film link<input type="url" name="filmUrl" maxLength={500} required placeholder="https://…" className={input} />
              <span className="mt-1 block text-sm text-white/70">Use a Hudl, YouTube, or Vimeo link that coaches can open without signing in.</span>
            </label>
            <div hidden aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
            {error && <p role="alert" className="text-red-300">{error}</p>}
            <button type="submit" className="rounded-xl bg-lime-400 px-5 py-3 font-black text-black">
              {status === "saving" ? "Submitting…" : "Submit film"}
            </button>
          </fieldset>
        </form>
      </>}
    </div>
  </main>;
}
