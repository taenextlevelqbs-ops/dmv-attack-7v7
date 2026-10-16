"use client";

import { useState, type FormEvent } from "react";

const inputClass = "mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-base text-white outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30";

export default function GirlsFlagInterest() {
  const [emailLink, setEmailLink] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();
    const subject = `Girls Flag Interest — ${value("athleteName")}`;
    const body = [
      "I am interested in DMV Attack Girls Flag Football. Please keep me informed as program details are announced.",
      "",
      `Athlete: ${value("athleteName")}`,
      `School: ${value("school")}`,
      `Grade: ${value("grade")}`,
      `Flag football experience: ${value("experience")}`,
      `Parent / guardian: ${value("guardianName")}`,
      `Contact email: ${value("email")}`,
      `Contact phone: ${value("phone")}`,
      "",
      `Questions: ${value("questions") || "None"}`,
      "",
      "Please send me program updates, age group information and next steps.",
    ].join("\n");
    setEmailLink(`mailto:dmvattack@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }

  return (
    <section id="interest" aria-labelledby="interest-heading" className="scroll-mt-28 border-t border-white/10 bg-lime-400/[0.04]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 md:py-20 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">Grow The Game</p>
          <h2 id="interest-heading" className="mt-3 text-4xl font-black uppercase leading-none md:text-6xl">Girls Flag Interest Form</h2>
          <p className="mt-5 text-sm leading-7 text-white/65">Interested in playing girls flag? Tell us about your athlete and connect with the DMV Attack staff. All experience levels are welcome to express interest.</p>
          <p className="mt-4 text-sm leading-7 text-white/60">Complete the form to prepare your interest email. Choose Open Email App after preparing your message, then press Send in your email app to deliver your request. Our staff will follow up as program details become available. This is an interest request, not a roster reservation.</p>
          <p className="mt-4 text-sm leading-7 text-white/50">Questions? Email <a href="mailto:dmvattack@gmail.com" className="text-lime-400 underline underline-offset-4">dmvattack@gmail.com</a>.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-black p-6 md:p-8">
          <p className="mb-6 text-xs text-white/50">All fields are required except questions.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold" htmlFor="girls-flag-athlete">Athlete Name
              <input id="girls-flag-athlete" name="athleteName" required maxLength={100} autoComplete="off" className={inputClass} />
            </label>
            <label className="text-sm font-bold" htmlFor="girls-flag-school">School
              <input id="girls-flag-school" name="school" required maxLength={120} className={inputClass} />
            </label>
            <label className="text-sm font-bold" htmlFor="girls-flag-grade">Current Grade
              <select id="girls-flag-grade" name="grade" required defaultValue="" className={inputClass}>
                <option value="" disabled>Select grade</option>
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "Other"].map((grade) => <option key={grade} value={grade}>{grade}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold" htmlFor="girls-flag-experience">Flag Football Experience
              <select id="girls-flag-experience" name="experience" required defaultValue="" className={inputClass}>
                <option value="" disabled>Select experience</option>
                <option value="New to flag football">New to flag football</option>
                <option value="Some experience">Some experience</option>
                <option value="Currently playing">Currently playing</option>
              </select>
            </label>
            <label className="text-sm font-bold sm:col-span-2" htmlFor="girls-flag-guardian">Parent / Guardian Name
              <input id="girls-flag-guardian" name="guardianName" required maxLength={100} autoComplete="name" className={inputClass} />
            </label>
            <label className="text-sm font-bold" htmlFor="girls-flag-email">Contact Email
              <input id="girls-flag-email" name="email" type="email" required maxLength={254} autoComplete="email" className={inputClass} />
            </label>
            <label className="text-sm font-bold" htmlFor="girls-flag-phone">Contact Phone
              <input id="girls-flag-phone" name="phone" type="tel" required maxLength={30} autoComplete="tel" className={inputClass} />
            </label>
            <label className="text-sm font-bold sm:col-span-2" htmlFor="girls-flag-questions">Questions <span className="font-normal text-white/45">(optional)</span>
              <textarea id="girls-flag-questions" name="questions" rows={3} maxLength={600} className={inputClass} />
            </label>
          </div>
          <button type="submit" className="mt-6 w-full rounded-xl bg-lime-400 px-6 py-4 text-xs font-black uppercase tracking-wider text-black transition hover:bg-lime-300">Prepare Interest Email</button>
          {emailLink && (
            <div className="mt-5 rounded-xl border border-lime-400/25 bg-lime-400/5 p-5">
              <p role="status" className="text-sm leading-6 text-lime-400">Your interest email is ready. Open your email app and press Send to deliver it. Nothing has been submitted through this website.</p>
              <a href={emailLink} className="mt-4 inline-flex rounded-full bg-lime-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-300">Open Email App</a>
              <p className="mt-3 text-xs leading-6 text-white/55">If your email app doesn’t open, email your athlete’s details to dmvattack@gmail.com.</p>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
