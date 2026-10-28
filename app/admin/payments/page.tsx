import Link from "next/link";
import { requireOwner } from "@/lib/admin/auth";
import FeeLedger from "./fee-ledger";
export const dynamic = "force-dynamic";
export default async function PaymentsPage() {
  await requireOwner();
  return <><div className="bg-black px-4 py-4 text-center"><Link href="/admin/payments/registrations" className="text-sm font-bold text-lime-400">Registration payments report: tryout and team fees</Link></div><FeeLedger /></>;
}
