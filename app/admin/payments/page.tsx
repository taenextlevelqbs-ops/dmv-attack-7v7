import AdminSection from "../_components/AdminSection";
import { requireOwner } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  await requireOwner();

  return (
    <AdminSection
      eyebrow="Owner Access"
      title="Payments"
      description="Owner-only payment operations for DMV Attack families and programs."
      cards={[
        {
          title: "Payments Received",
          value: 0,
          description:
            "Recorded family payments will appear here once payment tracking is connected.",
        },
        {
          title: "Outstanding Balances",
          value: 0,
          description:
            "Outstanding program balances will appear here.",
        },
        {
          title: "Payment History",
          description:
            "Review future payment transactions by family and athlete.",
        },
        {
          title: "Receipts",
          description:
            "Maintain receipts and payment records for families.",
        },
        {
          title: "Finance Dashboard",
          description:
            "Return to the complete owner financial center.",
          href: "/admin/finance",
        },
        {
          title: "Security",
          description:
            "Payment management is restricted server-side to OWNER accounts.",
        },
      ]}
    />
  );
}
