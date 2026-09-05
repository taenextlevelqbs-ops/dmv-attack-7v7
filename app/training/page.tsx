import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Training | DMV Attack",
};

export default function TrainingPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      <DmvPageHeader
        eyebrow="Development"
        title="Training"
        description="Development does not stop at tournament weekends. DMV Attack athletes are connected to position-specific coaching, quarterback development, receiver work, speed training, agility, and performance resources."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">

            <div className="text-xs font-black uppercase tracking-wider text-lime-400">
              Quarterbacks
            </div>

            <h2 className="mt-3 text-2xl font-black uppercase">
              Coach Tae QB
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/55">
              Quarterback mechanics, footwork, throwing development, decision-making, pocket movement, and offensive development.
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

            <h2 className="mt-3 text-2xl font-black uppercase">
              DASAP Training
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/55">
              Wide receiver development, route running, releases, athletic movement, football skill development, and competitive training.
            </p>

          </div>


          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">

            <div className="text-xs font-black uppercase tracking-wider text-lime-400">
              Performance
            </div>

            <h2 className="mt-3 text-2xl font-black uppercase">
              RAM Training
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/55">
              Speed, agility, athletic performance, defensive back movement, explosiveness, and complete athlete development.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}
