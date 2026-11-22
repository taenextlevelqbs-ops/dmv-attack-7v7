import SelfCheckinForm from "@/components/self-checkin-form";
import {TRYOUT_LOCATION} from "@/lib/tryouts.mjs";
export const metadata={title:"Tryout Self Check-In",robots:{index:false,follow:false},referrer:"no-referrer"};
export default function SelfCheckinPage() {
  return <main className="min-h-screen bg-black px-4 py-12 text-white">
    <div className="mx-auto max-w-xl">
      <p className="text-xs font-black uppercase tracking-widest text-lime-400">DMV ATTACK · 15U & 18U</p>
      <h1 className="mt-4 text-4xl font-black uppercase">Tryout Self Check-In</h1>
      <p className="mt-5 text-sm leading-7 text-white/75">Sunday, November 22, 2026 · Tryouts 3:00–4:30 PM Eastern.<br/>Self check-in opens at 2:30 PM and closes at 4:30 PM.</p>
      <p className="mt-3 text-sm leading-7 text-white/60">{TRYOUT_LOCATION.name}<br/>{TRYOUT_LOCATION.street}, {TRYOUT_LOCATION.city}, VA {TRYOUT_LOCATION.postalCode}</p>
      <p className="mt-4 text-sm leading-7 text-white/70">For registered 15U or 18U athletes, including same-day sign-ups. Check in after arriving at the field. No Tryout ID is needed. Enter the parent email used at registration and the athlete’s DOB. Need help? See the check-in desk; do not submit another registration.</p>
      <SelfCheckinForm/>
    </div>
  </main>;
}
