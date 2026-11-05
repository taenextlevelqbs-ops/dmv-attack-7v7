import Link from "next/link";
export const metadata = {title:"Foundation Contribution | DMV Attack",robots:{index:false,follow:false}};
export default function FoundationThankYou(){
 return <main className="flex min-h-[70vh] items-center justify-center bg-black px-4 py-20 text-white">
  <section className="w-full max-w-xl rounded-[32px] border border-lime-400/30 bg-white/[0.04] p-8 text-center md:p-12">
   <p className="text-xs font-black uppercase tracking-widest text-lime-400">DMV Attack Foundation</p>
   <h1 className="mt-4 text-4xl font-black uppercase">Thank You For Your Support.</h1>
   <p className="mt-6 text-sm leading-7 text-white/70">Stripe is processing your payment. You will receive a payment receipt from Stripe when it is confirmed. Business logos and uniform placement are reviewed before publication or production.</p>
   <p className="mt-4 text-xs leading-6 text-white/50">Questions about your sponsorship? Email dmvattackfoundation@gmail.com.</p>
   <Link href="/foundation" className="mt-8 inline-flex rounded-full bg-lime-400 px-7 py-4 text-xs font-black uppercase tracking-widest text-black">Return To Foundation</Link>
  </section>
 </main>
}