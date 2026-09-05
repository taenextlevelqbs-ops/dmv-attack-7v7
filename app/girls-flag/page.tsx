import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Girls Flag | DMV Attack",
};

export default function GirlsFlagPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      <DmvPageHeader
        eyebrow="Coming Soon"
        title="DMV Attack Girls Flag"
        description="DMV Attack is expanding development opportunities for girls flag football athletes across Northern Virginia and the DMV."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12">

          <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
            Development • Competition • Opportunity
          </div>

          <h2 className="mt-4 text-3xl font-black uppercase md:text-5xl">
            Girls Flag is coming.
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55">
            Follow DMV Attack for tryout information, camps, training opportunities, schedules, and launch announcements.
          </p>

          <a
            href="https://www.instagram.com/dmvattack_7on7/"
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex rounded-xl bg-lime-400 px-6 py-3 text-xs font-black uppercase tracking-wider text-black"
          >
            Follow For Updates
          </a>

        </div>

      </section>

    </main>
  );
}
