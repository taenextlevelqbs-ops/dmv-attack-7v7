import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "7v7",
};

const groups = [
  {
    label: "10U",
    image: "/10UChamp.JPG",
  },
  {
    label: "15U",
    image: "/15U.JPEG",
  },
  {
    label: "18U",
    image: "/Aiden18U.JPEG",
  },
];

const athletes = [
  "/10Ukid.JPEG",
  "/Dylan18U.JPEG",
  "/JayB18U.JPEG",
  "/dj18U.JPEG",
  "/Preston.JPEG",
  "/ShyChamp.jpeg",
];

export default function SevenOnSevenPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      <DmvPageHeader
        eyebrow="DMV Attack"
        title="7v7 Football"
        description="Development. Competition. Exposure. An environment built to prepare athletes for their school teams and beyond."
      />


      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

        <div className="grid gap-4 md:grid-cols-3">

          {groups.map((group) => (
            <div
              key={group.label}
              className="relative min-h-[420px] overflow-hidden rounded-3xl border border-white/10"
            >

              <img
                src={group.image}
                alt={`DMV Attack ${group.label}`}
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />

              <div className="absolute bottom-0 p-7">

                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400">
                  DMV Attack
                </div>

                <div className="mt-2 text-4xl font-black">
                  {group.label}
                </div>

              </div>

            </div>
          ))}

        </div>


        <div className="mt-16">

          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">
            The Athletes
          </div>

          <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">
            Built Through Reps.
          </h2>


          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">

            {athletes.map((image) => (
              <div
                key={image}
                className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10"
              >
                <img
                  src={image}
                  alt="DMV Attack athlete"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
            ))}

          </div>

        </div>

      </section>

    </main>
  );
}
