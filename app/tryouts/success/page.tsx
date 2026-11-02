import RegistrationConfirmation from "@/components/registration-confirmation";
import { validConfirmation } from "@/lib/tryouts.mjs";
export const metadata = {
  title: "Registration Confirmation",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function TryoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; athlete?: string; division?: string }>;
}) {
  const params = await searchParams;
  // Preserve old confirmation links without doing an anonymous database lookup.
  const candidate = {
    id: params.id || "",
    athlete: params.athlete || "Your athlete",
    division: params.division || "",
  };
  const legacy = validConfirmation(candidate) ? candidate : undefined;
  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white md:px-8 md:py-16">
      <div className="mx-auto max-w-4xl">
        <RegistrationConfirmation legacy={legacy} />
      </div>
    </main>
  );
}
