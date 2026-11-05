import Link from "next/link";
import {foundationStripeClient} from "@/lib/finance/foundation-stripe";
export const metadata = {title:"Foundation Payment | DMV Attack",robots:{index:false,follow:false}};
export const dynamic = "force-dynamic";
export default async function FoundationThankYou({searchParams}:{searchParams:Promise<{session_id?:string}>}) {
 const {session_id:sessionId}=await searchParams;
 let paid=false, documentUrl:string|null=null, amount:number|null=null;
 if(sessionId && /^cs_(?:live|test)_[A-Za-z0-9]+$/.test(sessionId) && process.env.FOUNDATION_PAYMENTS_ENABLED==="true") {
  try {
   const stripe=foundationStripeClient();
   const session=await stripe.checkout.sessions.retrieve(sessionId);
   if(session.payment_status==="paid" && session.livemode && session.metadata?.foundation_order_id && session.client_reference_id===session.metadata.foundation_order_id) {
    paid=true; amount=session.amount_total;
    if(session.invoice) {
     const invoice=await stripe.invoices.retrieve(typeof session.invoice==="string"?session.invoice:session.invoice.id);
     documentUrl=invoice.invoice_pdf || invoice.hosted_invoice_url || null;
    }
   }
  } catch { /* Never claim payment success without verification. */ }
 }
 return <main className="flex min-h-[70vh] items-center justify-center bg-black px-4 py-20 text-white">
  <section className="w-full max-w-xl rounded-[32px] border border-lime-400/30 bg-white/[0.04] p-8 text-center md:p-12">
   <p className="text-xs font-black uppercase tracking-widest text-lime-400">DMV Attack Foundation</p>
   <h1 className="mt-4 text-4xl font-black uppercase">{paid?"Thank You For Your Support.":"Payment Confirmation Pending"}</h1>
   <p className="mt-6 text-sm leading-7 text-white/70">{paid?"Your payment"+(amount!==null?" of $"+(amount/100).toFixed(2):"")+" is confirmed. Save this payment record for your files.":"We cannot yet verify this payment. Check your email for Stripe confirmation or contact our Foundation team."}</p>
   {paid && documentUrl && <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex rounded-full bg-lime-400 px-7 py-4 text-xs font-black uppercase tracking-widest text-black">Download Paid Invoice PDF</a>}
   {paid && <p className="mt-4 text-xs leading-6 text-white/55">Payment acknowledgment only; not confirmation of a tax-deductible gift. Sponsorship recognition and apparel placement are subject to approval and production deadlines.</p>}
   <p className="mt-4 text-xs leading-6 text-white/50">Questions? Email dmvattackfoundation@gmail.com.</p>
   <Link href="/foundation" className="mt-8 inline-flex rounded-full border border-lime-400/60 px-7 py-4 text-xs font-black uppercase tracking-widest text-lime-400">Return To Foundation</Link>
  </section>
 </main>;
}
