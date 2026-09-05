import Link from "next/link";

import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "About | DMV Attack",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      <DmvPageHeader
        eyebrow="Who We Are"
        title="DMV Attack"
        description="DMV Attack is a Northern Virginia-based football organization focused on development, competition, mentorship, exposure, and creating opportunities for athletes throughout the DMV."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

        <div className="grid gap-5 lg:grid-cols-2">

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 md:p-10">

            <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
              Our Standard
            </div>

            <h2 className="mt-4 text-3xl font-black uppercase">
              Develop first.
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/55">
              DMV Attack was created to give athletes an environment where development and competition work together. Winning matters, but preparing athletes to become better football players, teammates, leaders, and young men and women matters more.
            </p>

          </div>


          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 md:p-10">

            <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
              Leadership
            </div>

            <h2 className="mt-4 text-3xl font-black uppercase">
              Built by coaches.
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/55">
              DMV Attack is led by Tae Crews-Naylor, Dante Absher, and Ross Madison — former college and professional athletes who now coach and train athletes throughout Northern Virginia.
            </p>

            <Link
              href="/coaching"
              className="mt-6 inline-flex rounded-xl bg-lime-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-black"
            >
              Meet The Staff
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}
