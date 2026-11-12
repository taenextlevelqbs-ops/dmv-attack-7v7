import Image from "next/image";
import Link from "next/link";
const registrationUrl="https://www.dmvattack.com/tryouts#registration";
const qr="https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=12&data="+encodeURIComponent(registrationUrl);
export default function WalkinQrSign(){
 return <main className="min-h-screen bg-white px-5 py-8 text-center text-black">
  <div className="mx-auto max-w-2xl">
   <nav className="mb-6 flex justify-between print:hidden"><Link href="/check-in" className="rounded border px-4 py-2">Check-in</Link><span className="text-sm">Print: Cmd+P / Ctrl+P</span></nav>
   <div className="border-4 border-black p-6 sm:p-10">
    <p className="text-lg font-black tracking-[.2em]">DMV ATTACK 7v7</p>
    <h1 className="mt-4 text-4xl font-black uppercase sm:text-5xl">Walk-In Tryout Registration</h1>
    <p className="mt-4 text-xl font-bold">Scan to register your athlete</p>
    <div className="mx-auto my-6 w-fit border-2 border-black p-3"><Image src={qr} alt="QR code to open DMV ATTACK tryout registration" width={320} height={320} unoptimized/></div>
    <p className="text-xl font-black">www.dmvattack.com/tryouts</p>
    <p className="mt-5 text-base">Complete the online registration, including your athlete&apos;s photo, then return to the check-in desk. The tryout fee is $20 per athlete.</p>
    <p className="mt-5 text-sm font-bold uppercase">Staff will verify payment and issue your shirt number.</p>
   </div>
   <p className="mt-6 text-sm print:hidden">Print this page from your browser (Cmd+P / Ctrl+P). The QR code requires an internet connection to display.</p>
  </div>
 </main>
}
