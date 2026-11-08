"use client";
import Image from "next/image";
import {requestJson} from "@/lib/http.mjs";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Registration = {
  id: string;
  tryout_id: string;
  athlete_first_name: string;
  athlete_last_name: string;
  age_group: string;
  primary_position: string | null;
  secondary_position: string | null;
  school: string | null;
  grade: string | null;
  status: string;
  headshot_url: string | null;
  bib_number: number | null;
};

const divisions = [
  "ALL",
  "8U",
  "10U",
  "12U",
  "14U",
  "15U",
  "18U",
];

export default function TryoutCheckInPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("ALL");
  const [show, setShow] = useState<
    "ALL" | "ARRIVED" | "NOT_ARRIVED"
  >("ALL");

  const [updating, setUpdating] = useState("");
  const [bibDrafts, setBibDrafts] = useState<Record<string,string>>({});
  type Payment = { registration_id:string; status:"UNPAID"|"PENDING"|"PAID"; payment_method:"VENMO"|"STRIPE"|null; payment_note:string|null };
  const [payments,setPayments] = useState<Record<string,Payment>>({});
  const [paymentDrafts,setPaymentDrafts] = useState<Record<string,{method:"VENMO"|"STRIPE";note:string}>>({});
  const [confirmations,setConfirmations]=useState<Record<string,boolean>>({});

  function loadRegistrations() {
    return requestJson("/api/check-in/roster",{cache:"no-store"}).then(result=>{
      setRegistrations(result.registrations ?? []);
      setBibDrafts(Object.fromEntries((result.registrations ?? []).map((r:Registration)=>[r.id,r.bib_number==null?"":String(r.bib_number)])));
      setError("");

    }).catch((error:unknown)=>{setError(error instanceof Error?error.message:"Unable to load records");}).finally(()=>setLoading(false));
  }

  useEffect(() => {
    loadRegistrations();
    requestJson("/api/check-in/payments",{cache:"no-store"}).then(result=>{
      const records:Payment[]=result.payments??[];
      setPayments(Object.fromEntries(records.map(p=>[p.registration_id,p])));
      setPaymentDrafts(Object.fromEntries(records.map(p=>[p.registration_id,{method:p.payment_method==="STRIPE"?"STRIPE":"VENMO",note:p.payment_note??""}])));
    }).catch(()=>setError("Payment statuses unavailable. Verify payments before admitting athletes."));
  }, []);

  async function savePayment(registration:Registration,status:"PAID"|"PENDING") {
    const draft=paymentDrafts[registration.id]??{method:"VENMO" as const,note:""};
    if(status==="PAID"&&!confirmations[registration.id]){setError("Confirm the transaction in Venmo or Stripe before marking PAID.");return;}
    if(status==="PAID"&&!draft.note.trim()){setError("Enter the Venmo sender name or Stripe transaction reference before marking PAID.");return;}
    setUpdating(registration.id);setError("");
    try {
      const response=await fetch("/api/admin/tryouts/payment-checkin",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        registration_id:registration.id,payment_method:draft.method,payment_note:draft.note,status,confirmed:status==="PAID"&&confirmations[registration.id]===true
      })});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"Unable to save payment");
      setPayments(current=>({...current,[registration.id]:result.payment}));
      setConfirmations(current=>({...current,[registration.id]:false}));
    }catch(e){setError(e instanceof Error?e.message:"Unable to save payment");}
    finally{setUpdating("");}
  }

  async function saveBib(registration: Registration) {
    const raw=(bibDrafts[registration.id]??"").trim();
    const number=raw===""?null:Number(raw);
    if(number!==null&&(!Number.isInteger(number)||number<1||number>9999)){setError("Sticker numbers must be whole numbers from 1 to 9999.");return;}
    try {
      setUpdating(registration.id);setError("");
      const response=await fetch("/api/admin/tryouts/bib",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({registration_id:registration.id,bib_number:number})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"Could not save sticker number");
      setRegistrations(current=>current.map(item=>item.id===registration.id?{...item,bib_number:number}:item));
    }catch(e){setError(e instanceof Error?e.message:"Could not save sticker number");}
    finally{setUpdating("");}
  }

  function hasArrived(status: string) {
    return status !== "REGISTERED";
  }

  async function checkIn(registration: Registration) {
    try {
      setUpdating(registration.id);

      const response = await fetch(
        "/api/admin/tryouts/status",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: registration.id,
            status: "CHECKED_IN",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to check athlete in"
        );
      }

      setRegistrations((current) =>
        current.map((item) =>
          item.id === registration.id
            ? { ...item, status: "CHECKED_IN" }
            : item
        )
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to check athlete in"
      );
    } finally {
      setUpdating("");
    }
  }

  async function undoCheckIn(registration: Registration) {
    if (
      registration.status !== "CHECKED_IN"
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Mark ${registration.athlete_first_name} ${registration.athlete_last_name} as not arrived?`
    );

    if (!confirmed) return;

    try {
      setUpdating(registration.id);

      const response = await fetch(
        "/api/admin/tryouts/status",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: registration.id,
            status: "REGISTERED",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to undo check-in"
        );
      }

      setRegistrations((current) =>
        current.map((item) =>
          item.id === registration.id
            ? { ...item, status: "REGISTERED" }
            : item
        )
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to undo check-in"
      );
    } finally {
      setUpdating("");
    }
  }

  const stats = useMemo(() => {
    const scoped =
      division === "ALL"
        ? registrations
        : registrations.filter(
            (item) => item.age_group === division
          );

    const arrived = scoped.filter((item) =>
      hasArrived(item.status)
    ).length;

    return {
      registered: scoped.length,
      arrived,
      notArrived: scoped.length - arrived,
    };
  }, [registrations, division]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return registrations
      .filter((registration) => {
        if (
          division !== "ALL" &&
          registration.age_group !== division
        ) {
          return false;
        }

        const arrived = hasArrived(
          registration.status
        );

        if (show === "ARRIVED" && !arrived) {
          return false;
        }

        if (show === "NOT_ARRIVED" && arrived) {
          return false;
        }

        if (!term) return true;

        const haystack = [
          registration.athlete_first_name,
          registration.athlete_last_name,
          registration.tryout_id,
          registration.bib_number == null ? "" : String(registration.bib_number),
          registration.school,
          registration.primary_position,
          registration.secondary_position,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(term);
      })
      .sort((a, b) =>
        `${a.athlete_last_name} ${a.athlete_first_name}`.localeCompare(
          `${b.athlete_last_name} ${b.athlete_first_name}`
        )
      );
  }, [
    registrations,
    search,
    division,
    show,
  ]);

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-lime-400">
              DMV Attack Tryouts
            </div>

            <h1 className="mt-2 text-4xl font-black uppercase md:text-6xl">
              Check-In
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/45">
              Verify payment, assign the sticker number, and check the athlete in.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/admin/tryouts/check-in/print" className="rounded-full border border-lime-400/50 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-lime-400">Print Roster</Link>
            <Link
              href="/admin/tryouts"
              className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.12em]"
            >
              Tryout Dashboard
            </Link>

            <Link
              href="/admin"
              className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.12em]"
            >
              Admin Home
            </Link>
          </div>
        </header>

        <section className="mt-7 grid grid-cols-3 gap-2 md:gap-4">
          <Stat
            label="Registered"
            value={stats.registered}
          />

          <Stat
            label="Checked In"
            value={stats.arrived}
            highlight
          />

          <Stat
            label="Not Arrived"
            value={stats.notArrived}
          />
        </section>

        <section className="sticky top-0 z-30 -mx-4 mt-6 border-y border-white/10 bg-black/95 px-4 py-4 backdrop-blur-xl md:-mx-8 md:px-8">
          <div className="mx-auto max-w-7xl">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              autoFocus
              placeholder="Search name, Tryout ID, school or position..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-base font-semibold outline-none placeholder:text-white/25 focus:border-lime-400"
            />

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {divisions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDivision(item)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${
                    division === item
                      ? "bg-lime-400 text-black"
                      : "border border-white/10 bg-white/[0.035] text-white/60"
                  }`}
                >
                  {item === "ALL"
                    ? "ALL DIVISIONS"
                    : item}
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              {[
                ["ALL", "Everyone"],
                ["NOT_ARRIVED", "Not Arrived"],
                ["ARRIVED", "Checked In"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setShow(
                      value as
                        | "ALL"
                        | "ARRIVED"
                        | "NOT_ARRIVED"
                    )
                  }
                  className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] ${
                    show === value
                      ? "bg-white text-black"
                      : "border border-white/10 text-white/45"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm font-bold uppercase tracking-[0.2em] text-white/30">
            Loading Athletes...
          </div>
        ) : (
          <>
            <div className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-white/30">
              {filtered.length} athletes
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((registration) => {
                const arrived = hasArrived(
                  registration.status
                );

                return (
                  <article
                    key={registration.id}
                    className={`overflow-hidden rounded-[28px] border ${
                      arrived
                        ? "border-lime-400/30 bg-lime-400/[0.05]"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex gap-4 p-4">
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/5">
                        {registration.headshot_url ? (
                          <Image unoptimized width={640} height={800}
                            src={
                              registration.headshot_url
                            }
                            alt={`${registration.athlete_first_name} ${registration.athlete_last_name}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-2 text-center text-[8px] font-black uppercase text-white/20">
                            No Photo
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-[9px] font-black uppercase tracking-[0.15em] text-lime-400">
                              {registration.tryout_id}
                            </div>

                            <h2 className="mt-1 truncate text-xl font-black uppercase">
                              {
                                registration.athlete_first_name
                              }{" "}
                              {
                                registration.athlete_last_name
                              }
                            </h2>
                          </div>

                          <div className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                            {registration.age_group}
                          </div>
                        </div>

                        <div className="mt-2 text-xs font-bold text-white/55">
                          {registration.primary_position ||
                            "Position N/A"}

                          {registration.secondary_position
                            ? ` • ${registration.secondary_position}`
                            : ""}
                        </div>

                        <div className="mt-1 truncate text-xs text-white/35">
                          {registration.school ||
                            "School not listed"}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/10 p-4">
                      <div className="mb-3 flex items-center justify-between text-xs"><span className="font-bold text-white/60">Payment status</span><span className={payments[registration.id]?.status==="PAID"?"font-black text-lime-400":"font-bold text-amber-300"}>{payments[registration.id]?.status??"UNVERIFIED"}{payments[registration.id]?.payment_method?` • ${payments[registration.id].payment_method}`:""}</span></div>
                      {payments[registration.id]?.status!=="PAID" ? <div className="mb-4 space-y-2 rounded-xl border border-white/15 p-3">
                        <label htmlFor={`method-${registration.id}`} className="block text-xs font-bold text-white/70">Payment method</label>
                        <select id={`method-${registration.id}`} value={paymentDrafts[registration.id]?.method??"VENMO"} onChange={e=>setPaymentDrafts(current=>({...current,[registration.id]:{method:e.target.value as "VENMO"|"STRIPE",note:current[registration.id]?.note??""}}))} className="w-full rounded-lg border border-white/20 bg-black p-3">
                          <option value="VENMO">Venmo</option><option value="STRIPE">Stripe</option>
                        </select>
                        <label htmlFor={`reference-${registration.id}`} className="block text-xs font-bold text-white/70">Sender / transaction reference</label>
                        <input id={`reference-${registration.id}`} placeholder="Sender name or Stripe payment ID" value={paymentDrafts[registration.id]?.note??""} onChange={e=>setPaymentDrafts(current=>({...current,[registration.id]:{method:current[registration.id]?.method??"VENMO",note:e.target.value}}))} className="w-full rounded-lg border border-white/20 bg-black p-3 text-sm"/>
                        <button type="button" disabled={updating===registration.id} onClick={()=>void savePayment(registration,"PENDING")} className="w-full rounded-lg border border-amber-400/40 p-3 text-xs font-black text-amber-300 disabled:opacity-50">Parent says paid — Not verified yet</button>
                        <label className="flex items-start gap-2 text-xs leading-5 text-white/70"><input type="checkbox" checked={confirmations[registration.id]??false} onChange={e=>setConfirmations(current=>({...current,[registration.id]:e.target.checked}))} className="mt-1"/>I checked this actual $20 payment in Venmo or Stripe.</label>
                        <button type="button" disabled={updating===registration.id||!confirmations[registration.id]} onClick={()=>void savePayment(registration,"PAID")} className="w-full rounded-lg bg-lime-400 p-3 text-xs font-black text-black disabled:opacity-40">Confirm $20 Paid</button>
                      </div> : <p className="mb-4 text-xs text-lime-400">Verified payment {payments[registration.id]?.payment_note ? `• ${payments[registration.id].payment_note}` : "• Existing verified record"}</p>}
                      <label htmlFor={`bib-${registration.id}`} className="mb-2 block text-xs font-black uppercase tracking-widest text-white/60">Shirt sticker / Tryout #</label>
                      <div className="mb-4 flex gap-2"><input id={`bib-${registration.id}`} type="number" min="1" max="9999" inputMode="numeric" placeholder="Sticker #" value={bibDrafts[registration.id]??""} onChange={e=>setBibDrafts(current=>({...current,[registration.id]:e.target.value}))} className="w-full min-w-0 rounded-xl border border-white/20 bg-black p-3 text-lg font-bold text-white"/><button type="button" disabled={updating===registration.id} onClick={()=>void saveBib(registration)} className="rounded-xl bg-white px-4 py-2 text-xs font-black text-black disabled:opacity-50">Save #</button></div>
                      {registration.bib_number!==null&&<p className="mb-3 text-xs font-bold text-lime-400">Assigned sticker #{registration.bib_number}</p>}
                      {!arrived ? (
                        <button
                          type="button"
                          disabled={
                            updating === registration.id
                          }
                          onClick={() =>
                            checkIn(registration)
                          }
                          className="w-full rounded-2xl bg-lime-400 px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-lime-300 disabled:opacity-50"
                        >
                          {updating ===
                          registration.id
                            ? "Checking In..."
                            : "Check In"}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-2xl bg-lime-400/10 px-5 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-lime-400">
                            ✓ Checked In
                          </div>

                          {registration.status ===
                            "CHECKED_IN" && (
                            <button
                              type="button"
                              disabled={
                                updating ===
                                registration.id
                              }
                              onClick={() =>
                                undoCheckIn(
                                  registration
                                )
                              }
                              className="rounded-2xl border border-white/10 px-4 py-4 text-[10px] font-black uppercase text-white/40"
                            >
                              Undo
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {!filtered.length && !error && (
              <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.025] p-10 text-center">
                <div className="text-xl font-black uppercase">
                  No Athletes Found
                </div>

                <p className="mt-2 text-sm text-white/40">
                  Try another search or filter.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 md:rounded-3xl md:p-5 ${
        highlight
          ? "border-lime-400/25 bg-lime-400/[0.07]"
          : "border-white/10 bg-white/[0.025]"
      }`}
    >
      <div
        className={`text-[8px] font-black uppercase tracking-[0.15em] md:text-[10px] ${
          highlight
            ? "text-lime-400"
            : "text-white/30"
        }`}
      >
        {label}
      </div>

      <div className="mt-2 text-2xl font-black md:text-3xl">
        {value}
      </div>
    </div>
  );
}
