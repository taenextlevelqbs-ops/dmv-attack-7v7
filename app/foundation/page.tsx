import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Foundation | DMV Attack",
};

export default function FoundationPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      <DmvPageHeader
        eyebrow="DMV Attack Foundation"
        title="More Than Football"
        description="The DMV Attack Foundation exists to help youth athletes access opportunities, resources, development, mentorship, camps, equipment, and support beyond the field."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          {[
            "Equipment + Uniform Support",
            "Travel Assistance",
            "Training + Mentorship",
            "Free Camps + Community Events",
          ].map(
            (item) => (
              <div
                key={
                  item
                }
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="h-2 w-10 rounded-full bg-lime-400" />

                <div className="mt-5 text-base font-black uppercase leading-tight">
                  {
                    item
                  }
                </div>
              </div>
            )
          )}

        </div>


        <div className="mt-12 rounded-3xl border border-lime-400/20 bg-lime-400/[0.06] p-7 md:p-10">

          <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
            Mission
          </div>

          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-white/80">
            Create opportunities for young athletes regardless of financial circumstance while developing leadership, character, confidence, and community.
          </p>

        </div>

      </section>

    </main>
  );
}
