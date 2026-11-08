"use client";
import Link from "next/link";
import {FormEvent,useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {useRouter} from "next/navigation";
export default function StaffCheckinLogin(){
 const [username,setUsername]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const router=useRouter();
 async function submit(e:FormEvent){e.preventDefault();setError("");setBusy(true);
 try{const alias=username.trim().toLowerCase();if(!/^[a-z][a-z0-9_-]{3,23}$/.test(alias))throw new Error("Enter your assigned staff username.");
 const {error:signError}=await createClient().auth.signInWithPassword({email:`${alias}@checkin.dmvattack.com`,password});
 if(signError)throw new Error("Username or password not recognized.");
 const response=await fetch("/api/auth/route-user",{cache:"no-store"});const result=await response.json();
 if(!response.ok||!["CHECKIN","OWNER","ADMIN"].includes(result.role))throw new Error("This account is not authorized for check-in.");
 router.replace("/admin/tryouts/check-in");router.refresh();
 }catch(err){setError(err instanceof Error?err.message:"Could not sign in");}
 finally{setBusy(false)}}
 return <main className="flex min-h-screen items-center justify-center bg-black p-5 text-white"><div className="w-full max-w-md rounded-3xl border border-white/15 p-7">
 <div className="text-xs font-black uppercase tracking-widest text-lime-400">DMV ATTACK • STAFF</div>
 <h1 className="mt-3 text-3xl font-black uppercase">Tryout Check-In Login</h1>
 <p className="mt-2 text-sm text-white/50">For authorized check-in staff only.</p>
 <form onSubmit={submit} className="mt-7 space-y-4">
 <label className="block text-sm">Username<input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} required className="mt-2 w-full rounded-xl border border-white/20 bg-black p-4"/></label>
 <label className="block text-sm">Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required className="mt-2 w-full rounded-xl border border-white/20 bg-black p-4"/></label>
 <button type="submit" disabled={busy} className="w-full rounded-xl bg-lime-400 p-4 font-black uppercase text-black disabled:opacity-50">{busy?"Signing In…":"Open Check-In"}</button></form>
 {error&&<p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
 <Link href="/login" className="mt-6 block text-center text-sm text-white/50">Main staff / family login</Link>
 </div></main>
}
