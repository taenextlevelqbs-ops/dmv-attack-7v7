import Link from "next/link";

type Card = {
  title: string;
  value?: string | number;
  description: string;
  href?: string;
};

export default function AdminSection({
  eyebrow,
  title,
  description,
  cards,
}: {
  eyebrow: string;
  title: string;
  description: string;
  cards: Card[];
}) {
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400"
        >
          ← Admin Dashboard
        </Link>

        <div className="mt-10 max-w-3xl">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
            {eyebrow}
          </div>

          <h1 className="mt-3 text-4xl font-black uppercase md:text-6xl">
            {title}
          </h1>

          <p className="mt-5 text-sm leading-7 text-white/45 md:text-base">
            {description}
          </p>
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const content = (
              <>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
                  {card.title}
                </div>

                {card.value !== undefined && (
                  <div className="mt-3 text-4xl font-black uppercase text-white">
                    {card.value}
                  </div>
                )}

                <p className="mt-4 text-sm leading-6 text-white/45">
                  {card.description}
                </p>

                {card.href && (
                  <div className="mt-6 text-[10px] font-black uppercase tracking-[0.16em] text-lime-400">
                    Open →
                  </div>
                )}
              </>
            );

            if (card.href) {
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 transition hover:border-lime-400/40 hover:bg-white/[0.05]"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={card.title}
                className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6"
              >
                {content}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
