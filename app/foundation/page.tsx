import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Foundation",
};

export default function FoundationPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      <DmvPageHeader
        eyebrow="DMV Attack Foundation"
        title="More Than Football"
        description="Providing resources, opportunity, mentorship and support to youth athletes across the DMV."
      />


      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

        <div className="grid gap-8 lg:grid-cols-2">

          <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-white/10">

            <img
              src="/DMVAttackFoundation.jpeg"
              alt="DMV Attack Foundation"
              className="absolute inset-0 h-full w-full object-cover"
            />

          </div>


          <div className="flex flex-col justify-center">

            <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
              Our Mission
            </div>

            <h2 className="mt-4 text-4xl font-black uppercase leading-tight md:text-5xl">
              Opportunity should not depend on circumstance.
            </h2>

            <p className="mt-6 text-sm leading-7 text-white/60">
              The DMV Attack Foundation supports youth athletes through equipment, uniforms, travel assistance, training, mentorship, leadership development, free camps and community opportunities.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}
