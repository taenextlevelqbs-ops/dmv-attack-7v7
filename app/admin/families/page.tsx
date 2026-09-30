import AdminSection from "../_components/AdminSection";
import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function FamiliesPage() {
  const { supabase } = await requireStaff();

  const { count: familyCount } = await supabase
    .from("families")
    .select("*", { count: "exact", head: true });

  const { count: athleteCount } = await supabase
    .from("athletes")
    .select("*", { count: "exact", head: true });

  return (
    <AdminSection
      eyebrow="Family Management"
      title="Families"
      description="Manage parent accounts, household information and the athletes connected to each DMV Attack family."
      cards={[
        {
          title: "Families",
          value: familyCount ?? 0,
          description: "Official DMV Attack family records.",
        },
        {
          title: "Athletes",
          value: athleteCount ?? 0,
          description: "Athletes currently connected to family records.",
          href: "/admin/athletes",
        },
        {
          title: "Parent Accounts",
          description:
            "Parent profiles connect to families through family memberships.",
        },
        {
          title: "Multiple Athletes",
          description:
            "One family account can contain multiple DMV Attack athletes.",
        },
        {
          title: "Parent Portal",
          description:
            "Families can securely view their connected athletes and program information.",
          href: "/portal",
        },
        {
          title: "Tryout Pipeline",
          description:
            "Accepted athletes will move from tryout registration into the family system.",
          href: "/admin/tryouts",
        },
      ]}
    />
  );
}
