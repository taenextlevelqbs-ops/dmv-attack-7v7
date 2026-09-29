import Link from "next/link";
import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Foundation | DMV Attack",
  description:
    "The DMV Attack Foundation supports youth athletes throughout Northern Virginia and the DMV through equipment, travel assistance, camps, mentorship, training and community opportunities.",
};

const initiatives = [
  {
    title: "Equipment + Uniform Support",
    text: "Helping athletes and families access football equipment, uniforms and other resources that can remove barriers to participation.",
  },
  {
    title: "Travel Assistance",
    text: "Supporting qualifying athletes and families with travel-related needs connected to football opportunities, events and development.",
  },
  {
    title: "Free Camps",
    text: "Creating opportunities for young athletes to receive quality instruction, compete, learn and experience the game without cost being the barrier.",
  },
  {
    title: "Training + Development",
    text: "Connecting athletes with football instruction, position development and athletic training designed to help them continue improving.",
  },
  {
    title: "Mentorship",
    text: "Providing athletes with access to coaches and mentors who can help guide them through football, school, leadership and personal growth.",
  },
  {
    title: "Leadership + Character",
    text: "Using football as a platform to develop accountability, confidence, discipline, teamwork and leadership beyond the field.",
  },
];

export default function FoundationPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <DmvPageHeader
        eyebrow="DMV Attack Foundation"
        title="Impact Beyond Football"
        description="Supporting youth athletes with resources, development, mentorship and opportunities throughout Northern Virginia and the DMV."
      />

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="relative min-h-[420px] overflow-hidden rounded-[32px] border border-white/10">
              <img
                src="/DMVAttackFoundation.jpeg"
                alt="DMV Attack Foundation"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
                Our Mission
              </div>

              <h2 className="mt-3 text-4xl font-black uppercase leading-none md:text-6xl">
                Opportunity Should Not Stop At The Sideline.
              </h2>

              <p className="mt-6 text-sm leading-7 text-white/60 md:text-base">
                The DMV Attack Foundation supports youth athletes through
                equipment, uniforms, travel assistance, training, mentorship,
                leadership development, free camps and community opportunities.
              </p>

              <p className="mt-4 text-sm leading-7 text-white/60 md:text-base">
                Our goal is to help young athletes continue participating,
                developing and pursuing opportunities regardless of the financial
                or logistical barriers that may stand in their way.
              </p>

              <a
                href="mailto:dmvattackfoundation@gmail.com"
                className="mt-8 inline-flex rounded-full bg-lime-400 px-7 py-4 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:scale-[1.02]"
              >
                Email The Foundation →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="mb-10">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
              What We Support
            </div>

            <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">
              Building Access.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {initiatives.map((item, index) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/[0.025] p-7"
              >
                <div className="text-sm font-black text-lime-400">
                  0{index + 1}
                </div>

                <h3 className="mt-5 text-2xl font-black uppercase">
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-white/55">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="rounded-[32px] border border-lime-400/20 bg-white/[0.025] p-7 md:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
                  Community
                </div>

                <h2 className="mt-3 text-4xl font-black uppercase md:text-5xl">
                  More Than The Game.
                </h2>

                <p className="mt-5 text-sm leading-7 text-white/55 md:text-base">
                  Football can open doors, build confidence and create lifelong
                  relationships. The Foundation exists to help make sure more
                  young athletes have access to those experiences.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Youth Development",
                  "Community Camps",
                  "Mentorship",
                  "Leadership",
                  "Athlete Resources",
                  "Family Support",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm font-bold text-white/70"
                  >
                    <span className="mr-3 text-lime-400">→</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="rounded-[32px] bg-lime-400 p-8 text-black md:p-12">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-black/55">
              Connect With Us
            </div>

            <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl">
              Support. Partner. Get Involved.
            </h2>

            <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-black/65 md:text-base">
              For community partnerships, donations, athlete assistance,
              volunteer opportunities or Foundation questions, contact our team.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:dmvattackfoundation@gmail.com"
                className="rounded-full bg-black px-7 py-4 text-center text-xs font-black uppercase tracking-[0.16em] text-white"
              >
                dmvattackfoundation@gmail.com
              </a>

              <Link
                href="/camps"
                className="rounded-full border border-black/20 px-7 py-4 text-center text-xs font-black uppercase tracking-[0.16em] text-black"
              >
                View Camps →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
