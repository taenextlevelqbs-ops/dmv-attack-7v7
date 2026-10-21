export const metadata = { title: "Payment update | DMV Attack", robots: { index: false, follow: false } };
export default function PaymentReturn() {
  return <main className="mx-auto max-w-xl px-5 py-20 text-white">
    <h1 className="text-3xl font-bold">Your payment update</h1>
    <p className="mt-5">If you completed checkout, Stripe will confirm the payment. Bank payments may take several business days to clear. A pending bank payment is not credited as paid yet.</p>
    <p className="mt-4">If you canceled checkout, no new payment was submitted. Keep your payment link if you want to try again.</p>
    <p className="mt-4">Contact DMV Attack for your current team-fee balance or help with a payment.</p>
    <Link href="/" className="mt-6 inline-block text-lime-400 underline">Return to DMV Attack</Link>
  </main>;
}
import Link from "next/link";
