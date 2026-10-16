"use client";

import { useState, type FormEvent } from "react";

const inputClass = "mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-base text-white outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30";

export default function BigManSignup() {
  const [emailPrepared, setEmailPrepared] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();
    const subject = `Big Man 5v5 Signup — ${value("athleteName")}`;
    const body = [
      "I would like to sign up for DMV Attack Big Man 5v5 at Independence High School.",
      "",
      `Athlete: ${value("athleteName")}`,
      `School: ${value("school")}`,
      `Grade: ${value("grade")}`,
      `Position: ${value("position")}`,
      `Parent / guardian: ${value("guardianName")}`,
      `Contact email: ${value("email")}`,
      `Contact phone: ${value("phone")}`,
      "",
      `Questions: ${value("questions") || "None"}`,
      "",
      "Please send me upcoming session dates, availability and next steps.",
    ].join("\n");
    window.location.href = `mailto:dmvattack@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setEmailPrepared(true);
  }

  return (
    <section id="signup" aria-labelledby="signup-heading" className="scroll-mt-28 border-t border-white/10 bg-lime-400/[0.04]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 md:py-20 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">Join The Trenches</p>
          <h2 id="signup-heading" className="mt-3 text-4xl font-black uppercase leading-none md:text-6xl">5v5 Sign Up</h2>
          <p className="mt-5 text-sm leading-7 text-white/65">Offensive and defensive linemen: connect with our staff to get started at Independence High School.</p>
          <p className="mt-4 text-sm leading-7 text-white/60">Complete the form to prepare your signup email. Your email app will open with the details filled in; press Send there to deliver your request. Our staff will follow up with availability and session details.</p>
          <p className="mt-4 text-sm leading-7 text-white/50">Questions? Email <a href="mailto:dmvattack@gmail.com" className="text-lime-400 underline underline-offset-4">dmvattack@gmail.com</a>.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-black p-6 md:p-8">
          <p className="mb-6 text-xs text-white/50">All fields are required except questions.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold" htmlFor="big-man-athlete">Athlete Name
              <input id="big-man-athlete" name="athleteName" required maxLength={100} autoComplete="off" className={inputClass} />
            </label>
            <label className="text-sm font-bold" htmlFor="big-man-school">School
              <input id="big-man-school" name="school" required maxLength={120} className={inputClass} />
            </label>
            <label className="text-sm font-bold" htmlFor="big-man-grade">Current Grade
              <select id="big-man-grade" name="grade" required defaultValue="" className={inputClass}>
                <option value="" disabled>Select grade</option>
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "Other"].map((grade) => <option key={grade} value={grade}>{grade}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold" htmlFor="big-man-position">Position
              <select id="big-man-position" name="position" required defaultValue="" className={inputClass}>
                <option value="" disabled>Select position</option>
                <option value="Offensive Line">Offensive Line</option>
                <option value="Defensive Line">Defensive Line</option>
                <option value="Both O-Line and D-Line">Both O-Line and D-Line</option>
              </select>
            </label>
            <label className="text-sm font-bold sm:col-span-2" htmlFor="big-man-guardian">Parent / Guardian Name
              <input id="big-man-guardian" name="guardianName" required maxLength={100} autoComplete="name" className={inputClass} />
            </label>
            <label className="text-sm font-bold" htmlFor="big-man-email">Contact Email
              <input id="big-man-email" name="email" type="email" required maxLength={254} autoComplete="email" className={inputClass} />
            </label>
            <label className="text-sm font-bold" htmlFor="big-man-phone">Contact Phone
              <input id="big-man-phone" name="phone" type="tel" required maxLength={30} autoComplete="tel" className={inputClass} />
            </label>
            <label className="text-sm font-bold sm:col-span-2" htmlFor="big-man-questions">Questions <span className="font-normal text-white/45">(optional)</span>
              <textarea id="big-man-questions" name="questions" rows={3} maxLength={600} className={inputClass} />
            </label>
          </div>
          <button type="submit" className="mt-6 w-full rounded-xl bg-lime-400 px-6 py-4 text-xs font-black uppercase tracking-wider text-black transition hover:bg-lime-300">Prepare Signup Email</button>
          {emailPrepared && <p role="status" className="mt-4 text-sm leading-6 text-lime-400">Finish your signup by pressing Send in your email app. If it didn’t open, email your details to dmvattack@gmail.com. Your signup has not been submitted through this website.</p>}
        </form>
      </div>
    </section>
  );
}
