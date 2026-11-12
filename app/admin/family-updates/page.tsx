"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
type Recipient={email:string;athletes:string[]};
type Group={age_group:string;recipients:Recipient[]};
type Team={id:string;name:string;age_group:string;season:string};
type History={id:string;age_group:string;team_id:string|null;subject:string;recipient_count:number;sent_count:number;failed_count:number;created_at:string};
const categories=["10U","12U","14U","15U","18U"];
export default function FamilyUpdatesAdmin(){
 const [groups,setGroups]=useState<Group[]>([]),[teams,setTeams]=useState<Team[]>([]),[history,setHistory]=useState<History[]>([]);
 const [group,setGroup]=useState("12U"),[team,setTeam]=useState("");
 const [recipients,setRecipients]=useState<Recipient[]>([]),[digest,setDigest]=useState("");
 const [subject,setSubject]=useState(""),[message,setMessage]=useState("");
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(""),[result,setResult]=useState("");
 const [previewLoading,setPreviewLoading]=useState(false);
 const chosen=useMemo(()=>groups.find(g=>g.age_group===group),[groups,group]);
 async function loadGroups(){
  const res=await fetch("/api/admin/family-updates",{cache:"no-store"});
  const json=await res.json();if(!res.ok)throw new Error(json.error||"Unable to load family updates");
  setGroups(json.groups??[]);setTeams(json.teams??[]);setHistory(json.history??[]);
 }
 async function loadPreview(ageGroup:string,teamId:string){
  setPreviewLoading(true);setDigest("");setRecipients([]);
  try{
   const url="/api/admin/family-updates?age_group="+encodeURIComponent(ageGroup)+(teamId?"&team_id="+encodeURIComponent(teamId):"");
   const res=await fetch(url,{cache:"no-store"});const json=await res.json();
   if(!res.ok)throw new Error(json.error||"Unable to preview recipients");
   setRecipients(json.recipients??[]);setDigest(json.digest??"");
   setError("");
  }catch(e){setError(e instanceof Error?e.message:"Unable to preview recipients");}
  finally{setPreviewLoading(false);}
 }
 useEffect(()=>{
  let mounted=true;
  Promise.all([fetch("/api/admin/family-updates",{cache:"no-store"}),fetch("/api/admin/family-updates?age_group=12U",{cache:"no-store"})])
   .then(async([a,b])=>{
    const first=await a.json(),second=await b.json();
    if(!a.ok || !b.ok)throw new Error(first.error||second.error||"Unable to load");
    if(mounted){setGroups(first.groups??[]);setTeams(first.teams??[]);setHistory(first.history??[]);
      setRecipients(second.recipients??[]);setDigest(second.digest??"");}
   }).catch(e=>{if(mounted)setError(e instanceof Error?e.message:"Unable to load");})
   .finally(()=>{if(mounted)setLoading(false)});
  return()=>{mounted=false};
 },[]);
 async function send(){
  if(busy||previewLoading||!digest||!recipients.length)return;
  const destination=team?teams.find(t=>t.id===team)?.name||group:group;
  if(!window.confirm(`Send this update to ${recipients.length} unique parent email address(es) for ${destination}? This emails real families.`))return;
  setBusy(true);setError("");setResult("");
  try{
   const res=await fetch("/api/admin/family-updates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({age_group:group,team_id:team||null,subject,message,recipient_digest:digest})});
   const json=await res.json();if(!res.ok)throw new Error(json.error||"Unable to send update");
   setResult(`Sent to ${json.sent} of ${json.recipient_count} families. ${json.failed} failed. Review the history below.`);
   if(json.failed===0){setSubject("");setMessage("");}
   await loadGroups();
   await loadPreview(group,team);
  }catch(e){setError(e instanceof Error?e.message:"Unable to send. Review send history before trying again.");}
  finally{setBusy(false);}
 }
 return <main className="min-h-screen bg-black px-4 py-10 text-white md:px-8"><div className="mx-auto max-w-6xl">
  <Link href="/admin/tryouts" className="text-xs font-black uppercase tracking-widest text-lime-400">Back to Tryout Command Center</Link>
  <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-lime-400">DMV Attack Admin</p>
  <h1 className="mt-3 text-4xl font-black uppercase md:text-5xl">Family Updates</h1>
  <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">Send one private update to every accepted family in an age division, or select an individual roster. Parents only receive messages for their athlete&apos;s group. Families with multiple athletes in a group receive just one email.</p>
  {loading?<p className="mt-10">Loading family lists...</p>:<div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">{categories.map(g=>{
   const count=groups.find(x=>x.age_group===g)?.recipients.length??0;
   return <button key={g} type="button" onClick={()=>{setGroup(g);setTeam("");setResult("");void loadPreview(g,"");}}
     className={`rounded-2xl border p-5 text-left ${group===g?"border-lime-400 bg-lime-400/10":"border-white/15 bg-white/[0.03]"}`}>
     <span className="block text-xl font-black">{g}</span><span className="mt-2 block text-xs text-white/60">{count} parent emails</span>
   </button>})}</div>}
  <section className="mt-8 rounded-3xl border border-white/15 p-5 md:p-8">
   <div className="grid gap-4 sm:grid-cols-2">
    <div><label htmlFor="division" className="text-xs font-bold uppercase">Age Group</label><select id="division" value={group} onChange={e=>{const v=e.target.value;setGroup(v);setTeam("");void loadPreview(v,"");}} className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3">{categories.map(x=><option key={x}>{x}</option>)}</select></div>
    <div><label htmlFor="team" className="text-xs font-bold uppercase">Team (Optional)</label><select id="team" value={team} onChange={e=>{setTeam(e.target.value);void loadPreview(group,e.target.value);}} className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3"><option value="">All accepted {group} families</option>{teams.filter(x=>x.age_group===group).map(x=><option key={x.id} value={x.id}>{x.name} · {x.season}</option>)}</select></div>
   </div>
   <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
    <h2 className="text-xl font-black uppercase">Family Email List</h2>
    <span className="text-sm font-bold text-lime-400">{previewLoading?"Refreshing...":`${recipients.length} unique parent addresses`}</span>
   </div>
   <p className="mt-2 text-xs text-white/50">Shows accepted athletes whose parents consented to program communications. Individual team lists include only players with an accepted team assignment.</p>
   <div className="mt-4 max-h-60 overflow-y-auto rounded-xl border border-white/10">
    {recipients.map(r=><div key={r.email} className="flex flex-wrap justify-between gap-2 border-b border-white/10 px-4 py-3 text-sm"><span className="break-all text-white/80">{r.email}</span><span className="text-white/50">{r.athletes.join(", ")}</span></div>)}
    {!recipients.length&&<p className="p-5 text-sm text-white/50">No families in this group yet.</p>}
   </div>
  </section>
  <section className="mt-8 rounded-3xl border border-lime-400/25 p-5 md:p-8">
   <h2 className="text-xl font-black uppercase">Send An Update</h2>
   <p className="mt-2 text-sm text-white/60">Practice information, schedules, uniforms, travel details, reminders, or other operational team updates. Emails are sent separately to protect family addresses.</p>
   <label htmlFor="subject" className="mt-6 block text-xs font-bold uppercase">Email Subject</label>
   <input id="subject" value={subject} maxLength={150} onChange={e=>setSubject(e.target.value)} placeholder="Example: DMV Attack 12U Practice Schedule" className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3"/>
   <label htmlFor="message" className="mt-5 block text-xs font-bold uppercase">Message</label>
   <textarea id="message" value={message} maxLength={5000} onChange={e=>setMessage(e.target.value)} rows={7} placeholder="Write your message to the families..." className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3"/>
   <div className="mt-5 rounded-xl bg-white/[0.04] p-4 text-sm text-white/65"><strong className="text-white">Preview:</strong> DMV Attack {group}: {subject||"(Subject)"}<div className="mt-3 whitespace-pre-wrap">{message||"(Your message)"}</div></div>
   {error&&<p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
   {result&&<p role="status" className="mt-4 text-sm text-lime-300">{result}</p>}
   <button type="button" onClick={send} disabled={busy||previewLoading||!digest||!chosen||!recipients.length||subject.trim().length<4||message.trim().length<10} className="mt-6 rounded-full bg-lime-400 px-8 py-4 text-sm font-black uppercase text-black disabled:opacity-40">{busy?"Sending Updates...":`Review & Send to ${recipients.length} Families`}</button>
   <p className="mt-3 text-xs text-white/50">No emails are sent until you press the button and confirm the recipient count. Do not use for promotional marketing.</p>
  </section>
  <section className="mt-10"><h2 className="text-xl font-black uppercase">Recent Messages</h2><div className="mt-4 space-y-2">{history.map(h=><div key={h.id} className="rounded-xl border border-white/10 p-4 text-sm"><p className="font-bold">{h.subject} · {h.age_group}</p><p className="mt-1 text-white/50">{new Date(h.created_at).toLocaleString()} · {h.sent_count}/{h.recipient_count} sent{h.failed_count?` · ${h.failed_count} failed`:""}</p></div>)}{!history.length&&<p className="text-sm text-white/50">No messages sent yet.</p>}</div></section>
 </div></main>;
}
