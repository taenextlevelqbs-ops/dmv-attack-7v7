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


      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

        <div className="grid gap-4 lg:grid-cols-2">

          <div className="relative min-h-[500px] overflow-hidden rounded-3xl border border-white/10">

            <img
              src="/Qb.jpeg"
              alt="Quarterback training"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

            <div className="absolute bottom-0 p-8">

              <div className="text-xs font-black uppercase tracking-wider text-lime-400">
                Quarterback Development
              </div>

              <div className="mt-2 text-3xl font-black uppercase">
                Coach Tae QB
              </div>

            </div>

          </div>


          <div className="relative min-h-[500px] overflow-hidden rounded-3xl border border-white/10">

            <img
              src="/RjQb.JPEG"
              alt="DMV Attack quarterback"
              className="absolute inset-0 h-full w-full object-cover"
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
              CoachTaeQB.com →
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
              Performance
            </div>

            <div className="mt-3 text-2xl font-black">
              RAM Training
            </div>

            <div className="mt-5 text-xs text-white/40">
              @r.a.m_training →
            </div>
          </a>

        </div>

      </section>

    </main>
  );
}
