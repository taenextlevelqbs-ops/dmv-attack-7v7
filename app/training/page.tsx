import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Training",
};

export default function TrainingPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      <DmvPageHeader
        eyebrow="Development"
        title="Training"
        description="Quarterback, receiver, defensive back, speed and performance development from experienced coaches."
      />


      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">

        <div className="mx-auto w-full max-w-3xl">

          <div className="relative overflow-hidden rounded-3xl border border-white/10">

            <img
              src="/RjQb.JPEG"
              alt="DMV Attack quarterback"
              className="block h-auto w-full"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

            <div className="absolute bottom-0 p-8">

              <div className="text-xs font-black uppercase tracking-wider text-lime-400">
                Develop The Player
              </div>

              <div className="mt-2 text-3xl font-black uppercase">
                Train With Purpose.
              </div>

            </div>

          </div>

        </div>


        <div className="mt-8 grid gap-4 md:grid-cols-3">

          <a
            href="https://coachtaeqb.com/"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition hover:border-lime-400/40"
          >
            <div className="text-xs font-black uppercase text-lime-400">
              Quarterbacks
            </div>

            <div className="mt-3 text-2xl font-black">
              Coach Tae QB
            </div>

            <div className="mt-5 text-xs text-white/40">
              <div className="mt-4 flex flex-col gap-1 text-sm">
  <a
    href="https://www.instagram.com/coachtae3/"
    target="_blank"
    rel="noopener noreferrer"
    className="text-zinc-400 transition hover:text-[#a6ff00]"
  >
    @coachtae3
  </a>

  <a
    href="https://coachtaeqb.com"
    target="_blank"
    rel="noopener noreferrer"
    className="text-zinc-400 transition hover:text-[#a6ff00]"
  >
    CoachTaeQB.com →
  </a>
</div>
            </div>
          </a>


          <a
            href="https://www.instagram.com/dasp_training/"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition hover:border-lime-400/40"
          >
            <div className="text-xs font-black uppercase text-lime-400">
              Wide Receivers
            </div>

            <div className="mt-3 text-2xl font-black">
              DASP Training
            </div>

            <div className="mt-5 text-xs text-white/40">
              @dasp_training →
            </div>
          </a>


          <a
            href="https://www.instagram.com/r.a.m_training/"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition hover:border-lime-400/40"
          >
            <div className="text-xs font-black uppercase text-lime-400">
              Defensive Back Training
            </div>

            <div className="mt-3 text-2xl font-black">
              RAM Training
            </div>

            <div className="mt-5 text-xs text-white/40">
              @r.a.m_training →
            </div>
          </a>

        </div>

        <div className="mt-5 rounded-2xl border border-lime-400/20 bg-white/[0.03] p-7 sm:p-9">
          <div className="text-xs font-black uppercase tracking-wider text-lime-400">
            Performance Training
          </div>

          <div className="mt-3 text-3xl font-black uppercase">
            Speed &amp; Strength Training
          </div>

          <p className="mt-3 text-lg font-bold text-white">
            Choose Any Trainer
          </p>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">
            Speed, strength, agility, explosiveness, movement, and complete
            athletic development with the DMV Attack training staff.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://coachtaeqb.com/"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-lime-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-black"
            >
              Coach Tae
            </a>

            <a
              href="https://www.instagram.com/dasp_training/"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:border-lime-400/40"
            >
              @dasp_training
            </a>

            <a
              href="https://www.instagram.com/r.a.m_training/"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:border-lime-400/40"
            >
              @r.a.m_training
            </a>
          </div>
        </div>

      </section>

    </main>
  );
}
