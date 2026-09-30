import Link from "next/link";

type SuccessPageProps = {
  searchParams: Promise<{
    id?: string;
    athlete?: string;
    division?: string;
  }>;
};

export default async function TryoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;

  const tryoutId = params.id || "REGISTERED";
  const athlete = params.athlete || "Athlete";
  const division = params.division || "DMV Attack";

  return (
    <main className="min-h-screen bg-black px-4 py-20 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[36px] border border-lime-400/25 bg-lime-400/[0.06] p-7 md:p-12">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-lime-400">
            DMV Attack 7v7
          </div>

          <h1 className="mt-4 text-4xl font-black uppercase md:text-6xl">
            Registration Complete.
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 md:text-base">
            Your athlete is officially registered in the DMV Attack tryout
            system. Save the Tryout ID below. We will use it for check-in,
            evaluations and roster tracking.
          </p>

          <div className="mt-10 rounded-[28px] bg-lime-400 p-7 text-black md:p-10">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-black/50">
              Athlete
            </div>

            <div className="mt-2 text-3xl font-black uppercase">
              {athlete}
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-black/50">
                  Division
                </div>

                <div className="mt-2 text-2xl font-black">
                  {division}
                </div>
              </div>

              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-black/50">
                  Tryout ID
                </div>

                <div className="mt-2 text-3xl font-black">
                  {tryoutId}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-lime-400">
              What Happens Next?
            </div>

            <p className="mt-3 text-sm leading-7 text-white/60">
              DMV Attack will send your family additional tryout information as
              details are finalized. Your registration is now stored with our
              staff for check-in, evaluation and roster decisions.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-black"
            >
              DMV Attack Home
            </Link>

            <Link
              href="/tryouts"
              className="rounded-full border border-white/15 px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-white"
            >
              Register Another Athlete
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
