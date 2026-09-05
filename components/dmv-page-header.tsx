import Link from "next/link";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
};

export default function DmvPageHeader({
  eyebrow,
  title,
  description,
  buttonText,
  buttonHref,
}: Props) {
  return (
    <section className="border-b border-white/10 bg-gradient-to-b from-lime-400/[0.08] to-transparent">

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">

        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-lime-400">
          {eyebrow}
        </div>

        <h1 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl md:text-7xl">
          {title}
        </h1>

        <p className="mt-6 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
          {description}
        </p>

        {buttonText &&
        buttonHref ? (
          <div className="mt-8">

            <Link
              href={
                buttonHref
              }
              className="inline-flex rounded-xl bg-lime-400 px-6 py-3 text-xs font-black uppercase tracking-wider text-black transition hover:bg-lime-300"
            >
              {
                buttonText
              }
            </Link>

          </div>
        ) : null}

      </div>

    </section>
  );
}
