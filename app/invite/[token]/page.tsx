"use client";
import {useParams,useRouter} from "next/navigation";
import {useEffect,useState,type FormEvent} from "react";
type Invite={age_group:string|null;intended_athlete:string|null;general:boolean};
const input="mt-2 w-full min-w-0 rounded-xl border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-lime-400";
const positions=["Quarterback","Running Back","Wide Receiver","Tight End","Defensive Back","Linebacker","Athlete / Multiple Positions"];
export default function DirectInvitePage({tokenOverride}:{tokenOverride?:string}={}){
 const params=useParams<{token?:string}>(),router=useRouter();
 const token=tokenOverride??params?.token??"";
 const [division,setDivision]=useState("");
 const [invite,setInvite]=useState<Invite|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;fetch("/api/direct-invites/lookup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token})}).then(async r=>{const j=await r.json();if(!r.ok)throw new Error(j.error||"Invitation is unavailable");if(active)setInvite(j);}).catch(e=>{if(active)setError(e instanceof Error?e.message:"Invitation is unavailable");}).finally(()=>{if(active)setLoading(false);});return()=>{active=false};},[token]);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy||!invite)return;
  if(invite.general && !division){setError("Please select the athlete age division.");return;}
  const form=new FormData(e.currentTarget);
  form.set("Direct Invitation Token",token);
  form.set("Tryout Division",invite.age_group??division);
  form.set("Form Type","DMV Attack Direct Player Invitation");
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/tryouts/register",{method:"POST",headers:{Accept:"application/json"},body:form});
   const j=await r.json();if(!r.ok)throw new Error(j.error||"Unable to save registration");
   if(!j.confirmation?.id)throw new Error("Unable to confirm registration");
   router.push("/invite/success");
  }catch(e){setError(e instanceof Error?e.message:"Unable to save registration");}
  finally{setBusy(false);}
 }
 if(loading)return <main className="min-h-screen bg-black p-10 text-white">Loading your private invitation...</main>;
 if(!invite)return <main className="min-h-screen bg-black p-10 text-white"><h1 className="text-3xl font-black">Invitation unavailable</h1><p className="mt-3">{error}</p><p className="mt-3">Contact DMV Attack staff for a new invitation link.</p></main>;
 return <main className="min-h-screen bg-black px-4 py-10 text-white"><div className="mx-auto max-w-3xl">
  <p className="text-sm font-black uppercase tracking-[0.2em] text-lime-400">DMV ATTACK 7v7 · Private Invitation</p>
  <h1 className="mt-4 text-4xl font-black uppercase sm:text-6xl">Welcome To The Attack.</h1>
  <p className="mt-5 text-white/70">You have been personally invited to complete your athlete&apos;s information for the DMV Attack program. No tryout attendance or $20 tryout fee is required. A parent or guardian must complete this registration. Select the athlete’s division before submitting; the DMV Attack staff will review every application.</p>
  <p className="mt-4 rounded-2xl border border-lime-400/40 bg-lime-400/10 p-4 font-bold text-lime-300">Division: {invite.age_group??"Choose below"}{invite.intended_athlete?` · Invited athlete: ${invite.intended_athlete}`:""}</p>
  <form onSubmit={submit} className="mt-8 space-y-7">
   <section className="grid gap-4 rounded-2xl border border-white/15 p-5 sm:grid-cols-2">
    <h2 className="text-xl font-bold sm:col-span-2">Athlete Details</h2>
    <label className="text-sm">First name *<input required maxLength={120} name="Athlete First Name" className={input}/></label>
    <label className="text-sm">Last name *<input required maxLength={120} name="Athlete Last Name" className={input}/></label>
    <label className="text-sm">Date of birth *<input required type="date" name="Date of Birth" max={new Date().toISOString().slice(0,10)} className={input}/></label>
    <label className="text-sm">Current age *<input required type="number" min="6" max="19" name="Current Age" className={input}/></label>
    <label className="text-sm">School *<input required maxLength={160} name="School" className={input}/></label>
    <label className="text-sm">Grade *<select required name="Grade" className={input}><option value="">Select</option>{["2nd","3rd","4th","5th","6th","7th","8th","9th","10th","11th","12th"].map(x=><option key={x}>{x}</option>)}</select></label>
    <label className="text-sm">Age Division *{invite.general?<select name="Age Division Selection" required className={input} value={division} onChange={e=>setDivision(e.target.value)}>
<option value="">Select athlete age group</option>
{["10U","12U","14U","15U","18U"].map(d=><option key={d} value={d}>{d}</option>)}
</select>:<input readOnly value={invite.age_group??""} className={input}/>}</label>
    <label className="text-sm">Graduation year<input type="number" min="2027" max="2040" name="Graduation Year" className={input}/></label>
    <label className="text-sm">Primary position *<select required name="Primary Position" className={input}><option value="">Select</option>{positions.map(x=><option key={x}>{x}</option>)}</select></label>
    <label className="text-sm">Secondary position<select name="Secondary Position" className={input}><option value="">None</option>{positions.map(x=><option key={x}>{x}</option>)}</select></label>
    <label className="text-sm">Current team<input name="Current Team" className={input}/></label>
    <label className="text-sm">Years playing football *<input name="Years Playing Football" required type="number" min="0" max="15" className={input}/></label>
    <label className="text-sm">Height<input name="Height" className={input}/></label>
    <label className="text-sm">Weight<input name="Weight" className={input}/></label>
    <label className="text-sm sm:col-span-2">Highlight film URL<input type="url" name="Highlight Link" className={input}/></label>
    <label className="text-sm sm:col-span-2">Athlete social handle<input name="Athlete Social Media" className={input}/></label>
    <label className="text-sm sm:col-span-2">Football background / accomplishments<textarea name="Football Background" rows={4} className={input} placeholder="Teams, awards, camps, stats, achievements or recruiting information" /></label>
    <label className="text-sm sm:col-span-2">Athlete headshot (JPG, PNG or WEBP, max 4 MB) *<input required type="file" accept="image/jpeg,image/png,image/webp" name="Athlete Headshot" className={input}/></label>
   </section>
   <section className="grid gap-4 rounded-2xl border border-white/15 p-5 sm:grid-cols-2">
    <h2 className="text-xl font-bold sm:col-span-2">Parent / Guardian</h2>
    <label className="text-sm">Full name *<input required name="Parent Guardian Name" autoComplete="name" className={input}/></label>
    <label className="text-sm">Relationship to athlete *<input required name="Relationship To Athlete" className={input}/></label>
    <label className="text-sm">Email *<input required type="email" name="Parent Email" autoComplete="email" className={input}/></label>
    <label className="text-sm">Phone *<input required type="tel" name="Parent Phone" autoComplete="tel" className={input}/></label>
    <label className="text-sm">City *<input required name="City" className={input}/></label>
    <label className="text-sm">State *<input required name="State" className={input}/></label>
    <label className="text-sm">Emergency contact *<input required name="Emergency Contact" className={input}/></label>
    <label className="text-sm">Emergency phone *<input required type="tel" name="Emergency Phone" className={input}/></label>
    <label className="text-sm sm:col-span-2">Important medical information (optional)<textarea name="Medical Information" rows={3} className={input}/></label>
    <label className="text-sm sm:col-span-2">How did you hear about DMV Attack?<select name="Referral Source" className={input}><option value="">Select</option>{["Current DMV Attack Player / Parent","Coach","Instagram","Website","Training","Camp","Friend / Family","Other"].map(x=><option key={x}>{x}</option>)}</select></label>
    <label className="text-sm sm:col-span-2">Additional notes (optional)<textarea name="Additional Comments" rows={3} className={input}/></label>
   </section>
   <section className="space-y-4 rounded-2xl border border-white/15 p-5 text-sm text-white/75"><h2 className="text-xl font-bold text-white">Registration Confirmation</h2>
    <label className="flex gap-3"><input type="checkbox" required name="Information Confirmation"/>I confirm this information is accurate.</label>
    <label className="flex gap-3"><input type="checkbox" required name="Tryout Communication Consent"/>I authorize DMV Attack to contact me about this invitation, roster administration, and program information.</label>
    <label className="flex gap-3"><input type="checkbox" required name="Roster Understanding"/>I understand registration information must be verified and that a roster spot is finalized through the official team acceptance process.</label>
   </section>
   {error&&<p role="alert" className="rounded-xl border border-red-400/50 p-4 text-red-200">{error}</p>}
   <button disabled={busy} className="w-full rounded-full bg-lime-400 px-8 py-5 font-black uppercase text-black disabled:opacity-50">{busy?"Saving Player Information...":"Complete Player Registration"}</button>
   <p className="text-center text-xs text-white/50">Private invitation. No tryout payment is required.</p>
  </form>
 </div></main>;
}
