"use client";
import {useCallback,useEffect,useState,type FormEvent} from "react";
export default function SelfCheckinForm(){
  const [open,setOpen]=useState(false),[checking,setChecking]=useState(true),[busy,setBusy]=useState(false);
  const [availability,setAvailability]=useState("Checking availability…");
  const [error,setError]=useState(""),[success,setSuccess]=useState(""),[id,setId]=useState("");
  const load=useCallback(async()=>{
    try {const r=await fetch("/api/tryouts/self-check-in",{cache:"no-store"});if(!r.ok)throw new Error();const data=await r.json();setOpen(data.open===true);setAvailability(data.open===true?"Self check-in is open.":Date.parse(data.serverTime)>=Date.parse(data.closesAt)?"Self check-in has ended. Please see staff.":"Self check-in opens Sunday, November 22 at 2:30 PM Eastern.");setChecking(false);}
    catch {setOpen(false);setChecking(false);setError("Unable to check availability. Please refresh or see the check-in desk.");}
  },[]);
  useEffect(()=>{void load();const timer=window.setInterval(()=>void load(),30000);return()=>window.clearInterval(timer);},[load]);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(busy||!open)return;setBusy(true);setError("");
    const form=new FormData(e.currentTarget);
    try{
      const r=await fetch("/api/tryouts/self-check-in",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tryoutId:form.get("tryoutId"),parentEmail:form.get("parentEmail"),dateOfBirth:form.get("dateOfBirth"),arrived:form.get("arrived")==="on"})});
      const data=await r.json();if(!r.ok||!data.success)throw new Error(data.error||"Unable to confirm check-in.");
      setSuccess(data.message);setId(data.tryoutId);
    }catch(e){setError(e instanceof Error?e.message:"Unable to confirm check-in. See staff.");}finally{setBusy(false);}
  }
  if(success)return <section role="status" className="mt-8 rounded-2xl border border-lime-400 bg-lime-400/10 p-6"><h2 className="text-2xl font-black text-lime-300">You’re checked in.</h2><p className="mt-3 font-bold">Tryout ID: {id}</p><p className="mt-3 text-sm leading-7">{success}</p><button onClick={()=>{setSuccess("");setId("");}} className="mt-5 rounded-xl border border-white/30 px-5 py-3 font-bold">Check in another athlete</button></section>;
  const input="mt-2 min-h-12 w-full rounded-xl border border-white/25 bg-black p-3 text-base";
  return <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-white/20 p-6">
    <p role="status" className="text-sm font-bold text-lime-300">{availability}</p>
    <label className="block text-sm font-bold">Tryout ID<input name="tryoutId" required maxLength={40} autoCapitalize="characters" autoComplete="off" placeholder="Example: 15U-001" className={input}/></label>
    <label className="block text-sm font-bold">Parent email used at registration<input name="parentEmail" required type="email" maxLength={254} autoComplete="email" className={input}/></label>
    <label className="block text-sm font-bold">Athlete date of birth<input name="dateOfBirth" required type="date" max="2026-11-21" className={input}/></label>
    <label className="flex gap-3 text-sm leading-6"><input name="arrived" required type="checkbox" className="mt-1"/>I confirm this athlete has arrived at Independence High School for today’s tryout.</label>
    {error&&<p role="alert" className="text-sm text-red-300">{error}</p>}
    <button disabled={!open||checking||busy} className="min-h-12 w-full rounded-full bg-lime-400 px-5 py-4 font-black uppercase text-black disabled:opacity-40">{busy?"Checking In…":"Check In Athlete"}</button>
    <p className="text-xs leading-6 text-white/60">This records attendance only. Staff will verify any fee and provide your sticker number. It does not accept an athlete onto a team.</p>
  </form>;
}
