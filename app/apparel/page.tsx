import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Apparel | DMV Attack",
};

export default function ApparelPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      <DmvPageHeader
        eyebrow="DMV Attack"
        title="Apparel"
        description="DMV Attack apparel is built around the same standard as the program: competitive, clean, and made to represent the DMV."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

        <div className="rounded-3xl border border-lime-400/20 bg-gradient-to-br from-lime-400/10 to-white/[0.02] p-8 md:p-12">

          <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
            Attack The World
          </div>

          <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl">
            DMV Attack Gear
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55">
            Team apparel, lifestyle pieces, training gear, and future drops will be available here.
          </p>

          <a
            href="https://www.instagram.com/dmvattack_7on7/"
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex rounded-xl bg-lime-400 px-6 py-3 text-xs font-black uppercase tracking-wider text-black"
          >
            Follow For Drops
          </a>

        </div>

      </section>

    </main>
  );
}
