import { requireOwner } from "@/lib/admin/auth";
import FeeLedger from "../payments/fee-ledger";
export const dynamic = "force-dynamic";
export default async function FinancePage() {
  await requireOwner();
  return <FeeLedger />;
}
