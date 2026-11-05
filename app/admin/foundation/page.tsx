import Link from "next/link";
import {revalidatePath} from "next/cache";
import {requireOwner} from "@/lib/admin/auth";
import {stripeDatabase} from "@/lib/finance/stripe";

export const dynamic = "force-dynamic";

async function setSponsorApproval(formData: FormData) {
 "use server";
 await requireOwner();
 const id = String(formData.get("id")||"");
 const approved = formData.get("approved")==="true";
 if(!/^[0-9a-f-]{36}$/.test(id)) throw new Error("Invalid sponsor");
 const db = stripeDatabase();
 const {data: order,error:lookupError} = await db.from("foundation_contributions").select("id,kind,status,logo_path").eq("id",id).single();
 if(lookupError || !order || order.kind!=="SPONSORSHIP") throw new Error("Sponsor not found");
 if(approved && (order.status!=="PAID" || !order.logo_path)) throw new Error("Paid sponsor with logo required for publication");
 const {error} = await db.from("foundation_contributions").update({
   sponsor_approved:approved,logo_approved:approved,published:approved,updated_at:new Date().toISOString()
 }).eq("id",id);
 if(error) throw new Error("Could not update sponsor approval");
 revalidatePath("/admin/foundation");revalidatePath("/foundation");
}

export default async function FoundationAdminPage() {
 await requireOwner();
 const db = stripeDatabase();
 const {data, error} = await db.from("foundation_contributions")
   .select("id,kind,tier,business_name,contact_name,email,website,amount_cents,status,logo_path,published,created_at")
   .order("created_at",{ascending:false}).limit(100);
 const orders = data || [];
 const gross = orders.filter(o=>o.status==="PAID").reduce((a,o)=>a+o.amount_cents,0);
 const paidSponsors = orders.filter(o=>o.kind==="SPONSORSHIP"&&o.status==="PAID").length;
 return <main className="min-h-screen bg-black px-4 py-10 text-white md:px-8">
  <div className="mx-auto max-w-6xl">
   <Link href="/admin" className="text-xs font-black uppercase tracking-widest text-lime-400">Back To Command Center</Link>
   <h1 className="mt-5 text-3xl font-black uppercase md:text-5xl">Foundation & Sponsors</h1>
   <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">Private owner-only payment and sponsor approval dashboard. Stripe webhook updates payment status. Approve uploaded logos only after reviewing the business and artwork.</p>
   <div className="mt-7 grid gap-4 sm:grid-cols-3">
    <div className="rounded-2xl border border-white/10 p-6"><p className="text-xs text-white/50">Paid in recent 100 records</p><p className="mt-2 text-3xl font-black">${(gross/100).toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0})}</p></div>
    <div className="rounded-2xl border border-white/10 p-6"><p className="text-xs text-white/50">Paid business sponsors</p><p className="mt-2 text-3xl font-black">{paidSponsors}</p></div>
    <div className="rounded-2xl border border-white/10 p-6"><p className="text-xs text-white/50">Publicly featured</p><p className="mt-2 text-3xl font-black">{orders.filter(o=>o.published).length}</p></div>
   </div>
   {error && <p role="alert" className="mt-8 text-red-300">Unable to load foundation records. Confirm the database migration and service configuration.</p>}
   <div className="mt-8 space-y-4">
    {orders.map(order=><article key={order.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
         <h2 className="text-lg font-black uppercase">{order.business_name||"Community contribution"}</h2>
         <p className="mt-1 text-sm text-white/65">{order.contact_name} · <a className="underline underline-offset-4" href={`mailto:${order.email}`}>{order.email}</a></p>
         {order.website && <a href={order.website} rel="noopener noreferrer" target="_blank" className="mt-1 inline-flex text-xs text-lime-400 underline">Business website</a>}
        </div>
        <div className="text-right"><p className="text-xl font-black">${(order.amount_cents/100).toLocaleString("en-US",{style:"currency",currency:"USD"})}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-lime-400">{order.status}</p></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/50"><span>{order.kind==="SPONSORSHIP"?order.tier:"Donation"}</span><span>{new Date(order.created_at).toLocaleDateString("en-US")}</span><span>Published: {order.published?"Yes":"No"}</span></div>
      {order.kind==="SPONSORSHIP" && <>
        {order.logo_path ? <a className="mt-4 inline-flex text-sm text-lime-400 underline" target="_blank" rel="noopener noreferrer" href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/foundation-logos/${order.logo_path}`}>Review uploaded logo</a> : <p className="mt-4 text-xs text-white/50">No logo uploaded. Request a PNG, JPEG or WebP file before approval.</p>}
        {order.status==="PAID" && <form action={setSponsorApproval} className="mt-5">
          <input type="hidden" name="id" value={order.id}/>
          <input type="hidden" name="approved" value={order.published?"false":"true"}/>
          <button type="submit" disabled={!order.logo_path && !order.published} className="rounded-full bg-lime-400 px-6 py-3 text-xs font-black uppercase tracking-wider text-black disabled:cursor-not-allowed disabled:opacity-40">{order.published?"Unpublish Sponsor":"Approve & Publish Sponsor"}</button>
        </form>}
      </>}
    </article>)}
    {!orders.length && !error && <div className="rounded-2xl border border-white/10 p-10 text-center text-white/60">No Foundation contributions have been recorded yet.</div>}
   </div>
   <p className="mt-8 text-xs leading-6 text-white/45">Financial totals are for the most recent 100 records only, do not deduct refunds or fees, and are not accounting statements.</p>
  </div>
 </main>;
}
