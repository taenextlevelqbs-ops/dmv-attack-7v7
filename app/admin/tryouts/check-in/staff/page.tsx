"use client";
import Link from "next/link";
import {FormEvent,useState} from "react";
export default function StaffSetup(){
 const [name,setName]=useState("Mom"),[username,setUsername]=useState(""),[password,setPassword]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");
 try{const response=await fetch("/api/admin/tryouts/staff",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({first_name:name,username,password})});const result=await response.json();if(!response.ok)throw new Error(result.error||"Unable to create staff account");setMessage(`Account created. Username: ${result.username}. Open the staff login on her phone to sign in.`);setPassword("");}
 catch(err){setMessage(err instanceof Error?err.message:"Unable to create account");}
 finally{setBusy(false)}}
 return <main className="min-h-screen bg-black p-6 text-white"><div className="mx-auto max-w-xl">
 <Link href="/admin/tryouts" className="text-sm font-bold text-lime-400">Back to Tryouts</Link>
 <h1 className="mt-6 text-3xl font-black uppercase">Set Up Check-In Staff</h1>
 <p className="mt-3 text-sm leading-6 text-white/60">Owner-only. Create your mom&apos;s private check-in username and password. This role can access check-in, payments, and printouts — not the owner dashboard. Use a password of at least 12 characters and share it privately.</p>
 <form onSubmit={submit} className="mt-6 space-y-4 rounded-3xl border border-white/15 p-5">
 <label className="block text-sm">Staff first name<input value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl border border-white/20 bg-black p-4"/></label>
 <label className="block text-sm">Username<input required minLength={4} maxLength={24} autoComplete="off" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Example: checkindesk" className="mt-2 w-full rounded-xl border border-white/20 bg-black p-4"/></label>
 <label className="block text-sm">Password (12+ characters)<input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/20 bg-black p-4"/></label>
 <button disabled={busy} type="submit" className="w-full rounded-xl bg-lime-400 p-4 font-black text-black disabled:opacity-50">{busy?"Creating…":"Create Limited Staff Login"}</button></form>
 {message&&<p role="status" className="mt-4 text-sm">{message}</p>}
 <p className="mt-5 text-sm text-white/50">Staff login: <Link className="text-lime-400 underline" href="/check-in/login">dmvattack.com/check-in/login</Link></p>
 </div></main>
}
