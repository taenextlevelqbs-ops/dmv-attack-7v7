import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Contact | DMV Attack",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      <DmvPageHeader
        eyebrow="Get Connected"
        title="Contact DMV Attack"
        description="Questions about teams, tryouts, camps, training, partnerships, sponsorships, or the DMV Attack Foundation? Connect with us."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

        <div className="grid gap-5 md:grid-cols-2">

          <a
            href="https://www.instagram.com/dmvattack_7on7/"
            target="_blank"
            rel="noreferrer"
            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-lime-400/40"
          >

            <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
              Instagram
            </div>

            <div className="mt-4 text-2xl font-black text-white">
              @dmvattack_7on7
            </div>

            <div className="mt-5 text-sm text-white/45 transition group-hover:text-white/70">
              Send us a message →
            </div>

          </a>


          <a
            href="https://coachtaeqb.com/"
            target="_blank"
            rel="noreferrer"
            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-lime-400/40"
          >

            <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
              QB Training
            </div>

            <div className="mt-4 text-2xl font-black text-white">
              Coach Tae QB
            </div>

            <div className="mt-5 text-sm text-white/45 transition group-hover:text-white/70">
              Training + booking →
            </div>

          </a>

        </div>

      </section>

    </main>
  );
}
