import DmvPageHeader from "@/components/dmv-page-header";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <DmvPageHeader
        eyebrow="Get Connected"
        title="Contact DMV Attack"
        description="Questions about teams, tryouts, camps, training, partnerships, sponsorships, or the DMV Attack Foundation? Connect with us."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <a
            href="https://www.instagram.com/dmvattack_7on7/"
            target="_blank"
            rel="noreferrer"
            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-lime-400/40"
          >
            <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
              Instagram
            </div>

            <div className="mt-4 text-2xl font-black text-white">
              @dmvattack_7on7
            </div>

            <div className="mt-5 text-sm text-white/45 transition group-hover:text-white/70">
              Send us a message →
            </div>
          </a>

          <a
            href="mailto:dmvattack@gmail.com"
            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-lime-400/40"
          >
            <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
              Email
            </div>

            <div className="mt-4 text-2xl font-black text-white">
              dmvattack@gmail.com
            </div>

            <div className="mt-5 text-sm text-white/45 transition group-hover:text-white/70">
              Email DMV Attack →
            </div>
          </a>
        </div>

        <div className="mt-12 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 md:p-10">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
            Player Interest
          </div>

          <h2 className="mt-3 text-3xl font-black uppercase md:text-5xl">
            Tell Us About Your Athlete.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
            Interested in DMV Attack? Fill out the athlete information below and
            send it directly to our staff.
          </p>

          <form
            action="mailto:dmvattack@gmail.com?subject=DMV%20Attack%20Player%20Interest"
            method="post"
            encType="text/plain"
            className="mt-10 grid gap-5 md:grid-cols-2"
          >
            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.15em] text-white/55">
                Player Name
              </span>
              <input
                name="Player Name"
                required
                className="rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-lime-400"
                placeholder="Athlete's full name"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.15em] text-white/55">
                Parent / Guardian Name
              </span>
              <input
                name="Parent Guardian Name"
                required
                className="rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-lime-400"
                placeholder="Parent or guardian"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.15em] text-white/55">
                Parent Email
              </span>
              <input
                type="email"
                name="Parent Email"
                required
                className="rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-lime-400"
                placeholder="parent@email.com"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.15em] text-white/55">
                Male / Female
              </span>
              <select
                name="Male or Female"
                required
                className="rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition focus:border-lime-400"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.15em] text-white/55">
                Age
              </span>
              <input
                type="number"
                name="Age"
                min="5"
                max="19"
                required
                className="rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-lime-400"
                placeholder="Age"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.15em] text-white/55">
                Birthday
              </span>
              <input
                type="date"
                name="Birthday"
                required
                className="rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition focus:border-lime-400"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.15em] text-white/55">
                Height
              </span>
              <input
                name="Height"
                className="rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-lime-400"
                placeholder={`Example: 5'10"`}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.15em] text-white/55">
                Highlight Link
              </span>
              <input
                type="url"
                name="Highlight Link"
                className="rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-lime-400"
                placeholder="Hudl, YouTube, Instagram, X, etc."
              />
            </label>

            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-xs font-black uppercase tracking-[0.15em] text-white/55">
                Extra Comments
              </span>
              <textarea
                name="Extra Comments"
                rows={5}
                className="rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-lime-400"
                placeholder="Position, school, graduation year, experience, questions, or anything else we should know."
              />
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-lime-400 px-8 py-4 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.02]"
              >
                Send Player Info →
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
