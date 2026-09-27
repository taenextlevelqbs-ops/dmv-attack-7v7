import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Contact | DMV Attack",
};

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
            href="https://coachtaeqb.com/"
            target="_blank"
            rel="noreferrer"
            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-lime-400/40"
          >

            <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
              QB Training
            </div>

            <div className="mt-4 text-2xl font-black text-white">
              Coach Tae QB
            </div>

            <div className="mt-5 text-sm text-white/45 transition group-hover:text-white/70">
              Training + booking →
            </div>

          </a>

        </div>

        <div className="mt-8 rounded-3xl border border-lime-400/20 bg-lime-400/[0.04] p-8">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
            Email DMV Attack
          </div>

          <a
            href="mailto:dmvattack@gmail.com"
            className="mt-4 inline-block text-2xl font-black text-white transition hover:text-lime-400"
          >
            dmvattack@gmail.com →
          </a>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
            Player Interest Form
          </div>

          <h2 className="mt-3 text-3xl font-black uppercase md:text-4xl">
            Tell Us About Your Athlete
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            Interested in DMV Attack teams, training, camps, or future opportunities?
            Send us your athlete's information below.
          </p>

          <form
            action="mailto:dmvattack@gmail.com?subject=DMV%20Attack%20Player%20Interest"
            method="post"
            encType="text/plain"
            className="mt-8 grid gap-5 md:grid-cols-2"
          >
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                Player Name
              </span>
              <input
                name="Player Name"
                required
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-lime-400"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                Parent / Guardian Name
              </span>
              <input
                name="Parent Guardian Name"
                required
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-lime-400"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                Parent Email
              </span>
              <input
                type="email"
                name="Parent Email"
                required
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-lime-400"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                Male / Female
              </span>
              <select
                name="Male or Female"
                required
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-lime-400"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                Age
              </span>
              <input
                type="number"
                name="Age"
                min="5"
                max="19"
                required
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-lime-400"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                Height
              </span>
              <input
                name="Height"
                placeholder={'Example: 5\'10"'}
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-lime-400"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                Birthday
              </span>
              <input
                type="date"
                name="Birthday"
                required
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-lime-400"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                Highlight Link
              </span>
              <input
                type="url"
                name="Highlight Link"
                placeholder="Hudl, YouTube, X, Instagram, etc."
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-lime-400"
              />
            </label>

            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                Extra Comments
              </span>
              <textarea
                name="Extra Comments"
                rows={5}
                placeholder="Position, school, graduation year, experience, questions, etc."
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-lime-400"
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
