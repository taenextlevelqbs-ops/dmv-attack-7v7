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
    <section className="border-b border-white/10 bg-[#0a0d07]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-lime-400">
          {eyebrow}
        </div>

        <h1 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl md:text-7xl">
          {title}
        </h1>

        <p className="mt-6 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
          {description}
        </p>

        {buttonText && buttonHref ? (
          <div className="mt-8">
            <Link href={buttonHref} className="site-button site-button-primary">
              {buttonText}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
