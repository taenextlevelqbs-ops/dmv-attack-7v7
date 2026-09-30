import AdminSection from "../_components/AdminSection";
import { requireOwner } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  await requireOwner();

  return (
    <AdminSection
      eyebrow="Owner Access"
      title="Finance + Payments"
      description="Private financial management area available only to DMV Attack owners."
      cards={[
        {
          title: "Program Fees",
          description:
            "Manage athlete program pricing and season fees.",
        },
        {
          title: "Balances",
          description:
            "Track outstanding family balances once payment records are connected.",
        },
        {
          title: "Payments",
          description:
            "Payment history and transaction tracking will live here.",
        },
        {
          title: "Receipts",
          description:
            "Families will eventually be able to view payment receipts in their portal.",
        },
        {
          title: "Financial Reporting",
          description:
            "Owner-only season revenue and payment reporting.",
        },
        {
          title: "Access",
          description:
            "This area is protected server-side and restricted to OWNER accounts.",
        },
      ]}
    />
  );
}
