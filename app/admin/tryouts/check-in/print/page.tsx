"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { requestJson } from "@/lib/http.mjs";

type Athlete = { id:string; athlete_first_name:string; athlete_last_name:string; age_group:string; tryout_id:string; bib_number:number|null; status:string };
type Payment = { registration_id:string; status:string; payment_method:"VENMO"|"STRIPE"|null; payment_note:string|null };

export default function PrintableTryoutRoster(){
  const [athletes,setAthletes]=useState<Athlete[]>([]);
  const [payments,setPayments]=useState<Payment[]>([]);
  const [division,setDivision]=useState("ALL");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    Promise.all([requestJson("/api/check-in/roster",{cache:"no-store"}),requestJson("/api/check-in/payments",{cache:"no-store"})])
      .then(([a,b])=>{setAthletes(a.registrations??[]);setPayments(b.payments??[]);})
      .catch(e=>setError(e instanceof Error?e.message:"Could not load roster"))
      .finally(()=>setLoading(false));
  },[]);
  const paymentById=useMemo(()=>new Map(payments.map(p=>[p.registration_id,p])),[payments]);
  const divisions=useMemo(()=>Array.from(new Set(athletes.map(a=>a.age_group))).sort(),[athletes]);
  const filtered=useMemo(()=>athletes.filter(a=>division==="ALL"||a.age_group===division).sort((a,b)=>a.age_group.localeCompare(b.age_group)||a.athlete_last_name.localeCompare(b.athlete_last_name)||a.athlete_first_name.localeCompare(b.athlete_first_name)),[athletes,division]);
  return <main className="min-h-screen bg-white p-5 text-black md:p-10">
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/admin/tryouts/check-in" className="rounded-lg border border-gray-300 px-4 py-2 font-bold">Back to Digital Check-In</Link>
        <div className="flex gap-2">
          <select aria-label="Age group" value={division} onChange={e=>setDivision(e.target.value)} className="rounded-lg border border-gray-300 p-2"><option value="ALL">All age groups</option>{divisions.map(d=><option key={d}>{d}</option>)}</select>
          <button type="button" disabled={loading||!!error} onClick={()=>window.print()} className="rounded-lg bg-black px-5 py-2 font-bold text-white disabled:opacity-40">Print / Save PDF</button>
        </div>
      </div>
      <h1 className="text-3xl font-black uppercase">DMV ATTACK • Tryout Check-In</h1>
      <p className="mt-1 text-sm">Athlete roster, payment verification and shirt sticker numbers</p>
      {loading&&<p className="mt-6">Loading current registrations and verified payments…</p>}
      {error&&<p role="alert" className="mt-6 font-bold text-red-700">Unable to load complete roster: {error}. Do not print an incomplete list.</p>}
      {!loading&&!error&&<>
        <p className="mt-3 mb-6 text-sm font-medium">{filtered.length} registered athletes • {filtered.filter(a=>paymentById.get(a.id)?.status==="PAID").length} marked paid • {filtered.filter(a=>a.bib_number!=null).length} assigned sticker numbers</p>
        {Array.from(new Set(filtered.map(a=>a.age_group))).map(group=><section key={group} className="mb-8 break-inside-avoid">
          <h2 className="mb-2 border-b-2 border-black pb-1 text-lg font-black">{group} — {filtered.filter(a=>a.age_group===group).length} Athletes</h2>
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead><tr className="bg-gray-100"><th className="border border-gray-300 p-2">Athlete</th><th className="border border-gray-300 p-2">Paid</th><th className="border border-gray-300 p-2">Method / Note</th><th className="border border-gray-300 p-2">Sticker #</th><th className="border border-gray-300 p-2">Check-in</th></tr></thead>
            <tbody>{filtered.filter(a=>a.age_group===group).map(a=><tr key={a.id}><td className="border border-gray-300 p-2 font-medium">{a.athlete_first_name} {a.athlete_last_name}</td><td className="border border-gray-300 p-2">{paymentById.get(a.id)?.status==="PAID"?"YES":paymentById.get(a.id)?.status==="PENDING"?"PENDING":"UNVERIFIED"}</td><td className="border border-gray-300 p-2 text-xs">{[paymentById.get(a.id)?.payment_method??"Method not recorded",paymentById.get(a.id)?.payment_note].filter(Boolean).join(" • ")}</td><td className="border border-gray-300 p-2 font-bold">{a.bib_number??"________"}</td><td className="border border-gray-300 p-2">{a.status!=="REGISTERED"?"✓":"☐"}</td></tr>)}</tbody>
          </table>
        </section>)}
        <p className="mt-4 text-xs">Payment records marked PAID reflect admin verification, not an independent transaction audit. Unverified athletes require payment confirmation. Printed information may become outdated as digital check-in is updated.</p>
      </>}
    </div>
    <style jsx global>{`@media print { @page { size: letter portrait; margin: .42in; } body { background: white!important; } thead { display: table-header-group; } tr { break-inside: avoid; } section { break-inside: auto; } h2 { break-after: avoid; } }`}</style>
  </main>;
}
