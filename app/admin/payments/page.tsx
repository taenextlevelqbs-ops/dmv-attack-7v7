import { requireOwner } from "@/lib/admin/auth";
import FeeLedger from "./fee-ledger";
export const dynamic = "force-dynamic";
export default async function PaymentsPage() {
  await requireOwner();
  return <FeeLedger />;
}
