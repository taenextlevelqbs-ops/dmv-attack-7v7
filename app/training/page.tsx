import Image from "next/image";
import DmvPageHeader from "@/components/dmv-page-header";
export const metadata = {
  title: "Training",
  description:
    "Quarterback, receiver, defensive back, speed and performance training with DMV Attack coaches in Northern Virginia.",
};
const trainers = [
  {
    name: "Coach Tae QB",
    role: "Quarterbacks",
    description: "Quarterback development with Coach Tae.",
    href: "https://coachtaeqb.com/",
    label: "CoachTaeQB.com",
  },
  {
    name: "DASP Training",
    role: "Wide Receivers · Speed & Performance",
    description: "Receiver and athletic development with Dante Absher.",
    href: "https://www.instagram.com/dasp_training/",
    label: "@dasp_training",
  },
  {
    name: "RAM Training",
    role: "Defensive Backs · Speed & Performance",
    description:
      "Defensive back and performance development with Ross Madison.",
    href: "https://www.instagram.com/r.a.m_training/",
    label: "@r.a.m_training",
  },
];
export default function TrainingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <DmvPageHeader
        eyebrow="Development"
        title="Train With Purpose."
        description="Quarterback, receiver, defensive back, speed and performance development from experienced coaches."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="relative min-h-[340px] overflow-hidden rounded-3xl border border-white/15 sm:min-h-[460px]">
          <Image
            src="/RjQb.JPEG"
            alt="DMV Attack quarterback training"
            fill
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
          <div className="absolute bottom-0 p-6 sm:p-9">
            <p className="site-eyebrow">Develop The Player</p>
            <h2 className="mt-3 text-3xl font-black uppercase sm:text-5xl">
              Details Make The Difference.
            </h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {trainers.map((t) => (
            <article
              key={t.name}
              className="flex flex-col rounded-3xl border border-white/15 bg-[#0c0f0a] p-6"
            >
              <p className="site-eyebrow">{t.role}</p>
              <h3 className="mt-4 text-2xl font-black">{t.name}</h3>
              <p className="mb-6 mt-3 flex-1 text-sm leading-7 text-white/70">
                {t.description}
              </p>
              <a
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="site-button site-button-outline"
              >
                {t.label}
              </a>
              {t.name === "Coach Tae QB" && (
                <a
                  href="https://www.instagram.com/coachtae3/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 min-h-11 text-center text-sm leading-[44px] text-lime-400"
                >
                  @coachtae3
                </a>
              )}
            </article>
          ))}
        </div>
        <div className="mt-8 rounded-3xl border border-lime-400/25 p-6 sm:p-8">
          <p className="site-eyebrow">Performance Training</p>
          <h2 className="mt-3 text-3xl font-black uppercase">
            Speed &amp; Strength.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
            Speed, strength, agility, explosiveness, movement and complete
            athletic development with the DMV Attack training staff. Connect
            with a trainer for availability.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {trainers.map((t) => (
              <a
                key={t.name}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="site-button site-button-outline"
              >
                {t.name}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
