import PaymentCheckout from "@/components/payment-checkout";
import { uuid } from "@/lib/payments/server";
export const metadata = {
  title: "Tryout payment",
  robots: { index: false, follow: false },
};
export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ registration?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        {uuid(params.registration) ? (
          <PaymentCheckout
            registrationId={params.registration}
            purpose="TRYOUT"
          />
        ) : (
          <p>
            Open your saved payment link or sign in through Family payments to
            find your registration.
          </p>
        )}
      </div>
    </main>
  );
}
