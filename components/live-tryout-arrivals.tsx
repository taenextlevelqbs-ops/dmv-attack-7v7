"use client";
import {useEffect,useRef,useState} from "react";
type Arrival={id:string;name:string;division:string;checkedInAt:string|null;selfCheckinUsed:boolean};
type Data={registered:number;checkedIn:number;waiting:number;arrivals:Arrival[];fingerprint:string;readAt:string};
export default function LiveTryoutArrivals({onChange}:{onChange?:()=>void}){
  const [data,setData]=useState<Data|null>(null),[error,setError]=useState("");
  const callback=useRef(onChange),previous=useRef<string|null>(null);
  useEffect(()=>{callback.current=onChange;},[onChange]);
  useEffect(()=>{
    let active=true;
    async function load(){
      if(document.visibilityState==="hidden")return;
      try {
        const response=await fetch("/api/admin/tryouts/arrivals",{cache:"no-store"}),next=await response.json();
        if(!response.ok)throw new Error(next.error||"Live arrivals unavailable.");
        if(!active)return;
        setData(next);setError("");
        if(previous.current!==null&&previous.current!==next.fingerprint)callback.current?.();
        previous.current=next.fingerprint;
      }catch(e){if(active)setError(e instanceof Error?e.message:"Live arrivals unavailable.");}
    }
    void load();const timer=window.setInterval(()=>void load(),15000);
    return()=>{active=false;window.clearInterval(timer);};
  },[]);
  return <section className="mt-7 rounded-2xl border border-lime-400/30 bg-lime-400/[0.04] p-5" aria-labelledby="live-arrivals">
    <div className="flex flex-wrap justify-between gap-3"><h2 id="live-arrivals" className="text-xl font-black uppercase">15U & 18U · Live Arrivals</h2><span className="text-xs text-white/55">Updates every 15 seconds</span></div>
    <div className="mt-4 flex flex-wrap gap-5 text-sm"><p>Checked in: <strong className="text-lime-300">{error?"—":data?.checkedIn??"…"}</strong></p><p>Waiting: <strong>{error?"—":data?.waiting??"…"}</strong></p><p>Registered: <strong>{error?"—":data?.registered??"…"}</strong></p></div>
    {error?<p role="alert" className="mt-4 text-sm text-amber-200">{error} The list below may be outdated.</p>:null}
    <h3 className="mt-5 text-xs font-bold uppercase text-white/60">Recently Checked In</h3>
    <ul aria-live="polite" className="mt-3 grid gap-2 sm:grid-cols-2">
      {data?.arrivals.map(a=><li key={a.id} className="rounded-xl border border-white/10 bg-black p-3 text-sm"><p className="font-bold text-lime-300">✓ {a.name} checked in</p><p className="mt-1 text-xs text-white/60">{a.division} · {a.checkedInAt?new Date(a.checkedInAt).toLocaleTimeString("en-US",{timeZone:"America/New_York",hour:"numeric",minute:"2-digit"}):"Time not recorded"}{a.selfCheckinUsed?" · Self check-in":""}</p></li>)}
    </ul>
    {data&&!data.arrivals.length&&!error?<p className="mt-3 text-sm text-white/60">No recorded 15U/18U arrivals yet. New check-ins will appear here.</p>:null}
  </section>;
}
