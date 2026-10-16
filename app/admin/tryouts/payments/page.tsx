"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Registration = { id: string; tryout_id: string; athlete_first_name: string; athlete_last_name: string; age_group: string; parent_guardian_name: string | null };
type Payment = { registration_id: string; status: "UNPAID" | "PENDING" | "PAID"; payment_note: string | null };
export default function TryoutPayments() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [saving, setSaving] = useState("");
  async function refresh() {
    try {
      const [a,b] = await Promise.all([fetch("/api/admin/tryouts",{cache:"no-store"}),fetch("/api/admin/tryouts/payments",{cache:"no-store"})]);
      const [ar,br] = await Promise.all([a.json(),b.json()]);
      if (!a.ok || !b.ok) throw new Error(ar.error || br.error || "Unable to load");
      setRegistrations(ar.registrations ?? []);setPayments(br.payments ?? []);setError("");
    } catch(e) {setError(e instanceof Error ? e.message : "Unable to load");}
  }
  useEffect(()=>{void refresh()},[]);
  const map = useMemo(()=>new Map(payments.map(p=>[p.registration_id,p])),[payments]);
  const paid = registrations.filter(r=>map.get(r.id)?.status==="PAID").length;
  const pending = registrations.filter(r=>map.get(r.id)?.status==="PENDING").length;
  const visible = registrations.filter(r=>{
    const p=map.get(r.id)?.status ?? "UNPAID";
    return (filter==="ALL" || filter===p) && [r.tryout_id,r.athlete_first_name,r.athlete_last_name,r.parent_guardian_name,r.age_group].join(" ").toLowerCase().includes(search.toLowerCase());
  });
  async function update(r:Registration,status:string) {
    const existing=map.get(r.id);
    const note=window.prompt("Venmo sender name / payment reference (verify in Venmo before marking PAID):",existing?.payment_note ?? "");
    if(note===null)return;
    setSaving(r.id);
    try {
      const response=await fetch("/api/admin/tryouts/payments",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({registration_id:r.id,status,payment_note:note})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error || "Unable to save");
      await refresh();
    } catch(e){setError(e instanceof Error?e.message:"Unable to save")} finally{setSaving("")}
  }
  return <main className="min-h-screen bg-black px-4 py-10 text-white md:px-8"><div className="mx-auto max-w-6xl">
    <Link href="/admin/tryouts" className="text-sm font-bold text-lime-400">Tryout Command Center</Link>
    <h1 className="mt-5 text-4xl font-black uppercase">Tryout Payments</h1>
    <p className="mt-2 text-white/60">Venmo payments must be checked manually before marking PAID. $20 per athlete.</p>
    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">{[["Registered",registrations.length],["Paid",paid],["Pending",pending],["Outstanding",registrations.length-paid]].map(([label,value])=><div key={label} className="rounded-xl border border-white/15 p-4"><div className="text-xs uppercase text-white/50">{label}</div><div className="mt-2 text-3xl font-black">{value}</div></div>)}</div>
    <p className="mt-4 text-sm text-lime-400">Verified collected: ${paid*20} • Not verified: ${(registrations.length-paid)*20}</p>
    <div className="mt-6 flex flex-wrap gap-3"><input aria-label="Search athletes" placeholder="Search athlete, parent, Tryout ID" value={search} onChange={e=>setSearch(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/20 bg-black p-3"/><select aria-label="Filter payment status" value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border border-white/20 bg-black p-3">{["ALL","UNPAID","PENDING","PAID"].map(s=><option key={s}>{s}</option>)}</select></div>
    {error&&<p role="alert" className="mt-4 text-red-300">{error}</p>}
    <div className="mt-6 space-y-3">{visible.map(r=><div key={r.id} className="flex flex-col gap-3 rounded-xl border border-white/15 p-4 md:flex-row md:items-center md:justify-between"><div><div className="font-bold">{r.athlete_first_name} {r.athlete_last_name} • {r.age_group}</div><div className="text-xs text-white/50">{r.tryout_id} • {r.parent_guardian_name}</div><div className="text-xs text-white/50">{map.get(r.id)?.payment_note || "No Venmo reference recorded"}</div></div><div className="flex items-center gap-3"><span className="text-sm text-lime-400">{map.get(r.id)?.status??"UNPAID"}</span><select aria-label={`Update payment for ${r.athlete_first_name} ${r.athlete_last_name}`} disabled={saving===r.id} value={map.get(r.id)?.status??"UNPAID"} onChange={e=>void update(r,e.target.value)} className="rounded-lg border border-white/20 bg-black p-3">{["UNPAID","PENDING","PAID"].map(s=><option key={s}>{s}</option>)}</select></div></div>)}</div>
  </div></main>;
}
