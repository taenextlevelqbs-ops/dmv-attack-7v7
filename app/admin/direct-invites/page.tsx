"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
type Team={id:string;name:string;age_group:string;season:string};
type Invite={id:string;age_group:string|null;intended_athlete:string|null;created_at:string;expires_at:string;redeemed_at:string|null;revoked_at:string|null;use_count:number;max_uses:number};
export default function DirectInvitesAdmin(){
 const [teams,setTeams]=useState<Team[]>([]);
 const [invites,setInvites]=useState<Invite[]>([]);
 const [division,setDivision]=useState("12U"),[name,setName]=useState(""),[team,setTeam]=useState("");
 const [url,setUrl]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const [now] = useState(()=>Date.now());
 const load=async()=>{
  const [t,i]=await Promise.all([fetch("/api/admin/teams"),fetch("/api/admin/direct-invites")]);
  if(t.ok)setTeams((await t.json()).teams??[]);
  if(i.ok)setInvites((await i.json()).invites??[]);
 };
 useEffect(()=>{let active=true;Promise.all([fetch("/api/admin/teams"),fetch("/api/admin/direct-invites")]).then(async ([t,i])=>{const ts=t.ok?(await t.json()).teams??[]:[];const is=i.ok?(await i.json()).invites??[]:[];if(active){setTeams(ts);setInvites(is);}}).catch(()=>{});return()=>{active=false};},[]);
 async function create(){
  setError("");setBusy(true);setUrl("");
  try{
   const r=await fetch("/api/admin/direct-invites",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({age_group:division,intended_athlete:name,team_id:team})});
   const j=await r.json();if(!r.ok)throw new Error(j.error??"Unable to create invitation");
   setUrl(j.link);setName("");await load();
  }catch(e){setError(e instanceof Error?e.message:"Unable to create invite");}
  finally{setBusy(false);}
 }
 async function createGeneral(){
  setError("");setBusy(true);setUrl("");
  try{
    const r=await fetch("/api/admin/direct-invites",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({general:true})});
    const j=await r.json();if(!r.ok)throw new Error(j.error??"Unable to generate reusable link");
    setUrl(j.link);await load();
  }catch(e){setError(e instanceof Error?e.message:"Unable to create link");}
  finally{setBusy(false);}
 }
 async function revoke(id:string){
  if(!window.confirm("Revoke this private invitation link?"))return;
  const r=await fetch("/api/admin/direct-invites",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
  if(r.ok)await load();else setError("Unable to revoke invitation");
 }
 return <main className="min-h-screen bg-black px-4 py-10 text-white"><div className="mx-auto max-w-4xl">
  <Link className="text-lime-400" href="/admin/tryouts">Back to Athlete Command Center</Link>
  <h1 className="mt-6 text-4xl font-black uppercase">Direct Player Invitations</h1>
  <p className="mt-3 text-white/65">Send one all-age link to multiple players or generate a single-use link for one athlete and a specific division. Each family completes all of their information. No $20 tryout fee is requested.</p>
  <section className="mt-8 rounded-3xl border border-lime-400/50 bg-lime-400/[0.06] p-6">
    <p className="text-xs font-black uppercase tracking-wider text-lime-400">Recommended · Send to Any Player</p>
    <h2 className="mt-3 text-2xl font-black uppercase">One Link · All Age Groups</h2>
    <p className="mt-3 text-sm leading-6 text-white/70">Generate one private reusable link. Send it to multiple families. Each parent selects their athlete&apos;s division (10U, 12U, 14U, 15U or 18U) and completes the full player registration. You review their information and confirm the offer. This link expires in 180 days, supports up to 250 registrations and can be revoked.</p>
    <button type="button" disabled={busy} onClick={createGeneral} className="mt-5 rounded-full bg-lime-400 px-6 py-4 font-black uppercase text-black disabled:opacity-40">{busy?"Generating...":"Generate All-Ages Invitation Link"}</button>
  </section>
  <h2 className="mt-10 text-xl font-black uppercase">Individual Player Invitation (Optional)</h2>
  <section className="mt-8 grid gap-4 rounded-3xl border border-lime-400/30 p-6 sm:grid-cols-2">
    <label className="text-sm">Athlete name (optional)<input value={name} onChange={e=>setName(e.target.value)} maxLength={120} placeholder="Athlete name" className="mt-2 w-full rounded-xl border border-white/20 bg-black p-3"/></label>
    <label className="text-sm">Division<select value={division} onChange={e=>{setDivision(e.target.value);setTeam("");}} className="mt-2 w-full rounded-xl border border-white/20 bg-black p-3">{["10U","12U","14U","15U","18U"].map(d=><option key={d}>{d}</option>)}</select></label>
    <label className="text-sm sm:col-span-2">Intended team (optional)<select value={team} onChange={e=>setTeam(e.target.value)} className="mt-2 w-full rounded-xl border border-white/20 bg-black p-3"><option value="">Assign later</option>{teams.filter(t=>t.age_group===division).map(t=><option key={t.id} value={t.id}>{t.name} · {t.season}</option>)}</select></label>
    <button disabled={busy} onClick={create} className="rounded-full bg-lime-400 px-6 py-4 font-black uppercase text-black disabled:opacity-40 sm:col-span-2">{busy?"Generating...":"Generate Private Registration Link"}</button>
  </section>
  {url&&<section className="mt-5 rounded-2xl border border-lime-400 p-5">
    <p className="font-bold text-lime-400">Private invitation link ready</p>
    <p className="mt-2 break-all text-sm">{url}</p>
    <button onClick={()=>navigator.clipboard.writeText(url)} className="mt-4 rounded-full bg-lime-400 px-5 py-3 text-sm font-bold text-black">Copy Invite Link</button>
    <p className="mt-3 text-xs text-white/50">Share privately with the families you select. Copy it now; the full link is only shown here once.</p>
  </section>}
  {error&&<p role="alert" className="mt-4 text-red-300">{error}</p>}
  <h2 className="mt-10 text-xl font-black uppercase">Invitation Tracker</h2>
  <div className="mt-4 space-y-3">{invites.map(i=><div key={i.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 p-4"><div><p className="font-bold">{i.age_group===null?"All-Ages Reusable Link":i.intended_athlete||"Player invitation"} · {i.age_group??"Any division"}</p><p className="text-xs text-white/50">{i.revoked_at?"Revoked":Date.parse(i.expires_at)<now?"Expired":i.use_count>=i.max_uses?"Fully used":i.age_group===null?`${i.use_count} of ${i.max_uses} registrations received`:i.redeemed_at?"Registration received":"Awaiting family registration"} · Created {new Date(i.created_at).toLocaleDateString()}</p></div>{i.use_count<i.max_uses&&!i.revoked_at&&<button onClick={()=>revoke(i.id)} className="rounded-lg border border-white/20 px-3 py-2 text-sm">Revoke</button>}</div>)}</div>
 </div></main>;
}
