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
        description="Position-specific development from coaches who have played, coached, trained, and competed at the next level."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">


        <div className="relative mb-8 min-h-[460px] overflow-hidden rounded-3xl border border-white/10">

          <img
            src="/Qb.jpeg"
            alt="DMV Attack quarterback training"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-transparent" />

          <div className="relative flex min-h-[460px] max-w-xl flex-col justify-end p-7 md:p-10">

            <div className="text-xs font-black uppercase tracking-[0.22em] text-lime-400">
              Player Development
            </div>

            <h2 className="mt-3 text-4xl font-black uppercase leading-none md:text-6xl">
              Train with purpose.
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/60">
              Quarterback work, receiver development, defensive back training, speed, agility, movement, and complete athlete development.
            </p>

          </div>

        </div>


        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">

            <div className="text-xs font-black uppercase tracking-wider text-lime-400">
              Quarterbacks
            </div>

            <h3 className="mt-3 text-2xl font-black uppercase">
              Coach Tae QB
            </h3>

            <p className="mt-4 text-sm leading-7 text-white/55">
              Throwing mechanics, footwork, pocket movement, decision-making, accuracy, and offensive development.
            </p>

            <a
              href="https://coachtaeqb.com/"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-xl bg-lime-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-black"
            >
              Visit Coach Tae
            </a>

          </div>


          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">

            <div className="text-xs font-black uppercase tracking-wider text-lime-400">
              Receivers
            </div>

            <h3 className="mt-3 text-2xl font-black uppercase">
              DASP Training
            </h3>

            <p className="mt-4 text-sm leading-7 text-white/55">
              Receiver development, route running, releases, movement, athleticism, and competitive football skill work.
            </p>

            <a
              href="https://www.instagram.com/dasp_training/"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-xl border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-wider text-white"
            >
              @dasp_training
            </a>

          </div>


          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">

            <div className="text-xs font-black uppercase tracking-wider text-lime-400">
              Performance
            </div>

            <h3 className="mt-3 text-2xl font-black uppercase">
              RAM Training
            </h3>

            <p className="mt-4 text-sm leading-7 text-white/55">
              Speed, agility, explosiveness, movement, defensive back development, and complete athletic performance.
            </p>

            <a
              href="https://www.instagram.com/r.a.m_training/"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-xl border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-wider text-white"
            >
              @r.a.m_training
            </a>

          </div>

        </div>

      </section>

    </main>
  );
}
