import FamilyPayments from "@/components/family-payments";
import PaymentCheckout from "@/components/payment-checkout";
import { uuid } from "@/lib/payments/server";
export const metadata = {
  title: "Family payments",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ registration?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        {uuid(params.registration) ? (
          <PaymentCheckout
            registrationId={params.registration}
            purpose="TEAM"
          />
        ) : (
          <FamilyPayments />
        )}
      </div>
    </main>
  );
}
