import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Camps | DMV Attack",
};

export default function CampsPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      <DmvPageHeader
        eyebrow="Community Development"
        title="Camps"
        description="DMV Attack camps bring athletes together for high-level football instruction, competition, mentorship, and access to coaches with college and professional playing experience."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

        <div className="grid gap-4 md:grid-cols-3">

          {[
            [
              "Skill Development",
              "Position-specific teaching with an emphasis on fundamentals and transferable football skills.",
            ],

            [
              "Competition",
              "Competitive drills and reps designed to allow athletes to apply what they learn.",
            ],

            [
              "Mentorship",
              "Athletes learn from coaches who have competed at the college and professional levels.",
            ],
          ].map(
            ([title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-7"
              >

                <div className="text-lg font-black uppercase">
                  {title}
                </div>

                <p className="mt-4 text-sm leading-7 text-white/55">
                  {text}
                </p>

              </div>
            )
          )}

        </div>

      </section>

    </main>
  );
}
