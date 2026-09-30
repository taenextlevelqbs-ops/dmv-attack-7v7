import AdminSection from "../_components/AdminSection";
import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AthletesPage() {
  const { supabase } = await requireStaff();

  const [
    { count: athleteCount },
    { count: familyCount },
  ] = await Promise.all([
    supabase
      .from("athletes")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("families")
      .select("*", { count: "exact", head: true }),
  ]);

  return (
    <AdminSection
      eyebrow="Player Management"
      title="Athletes + Families"
      description="Manage DMV Attack athlete records and the family accounts connected to each player."
      cards={[
        {
          title: "Athletes",
          value: athleteCount ?? 0,
          description:
            "Official athlete records created after players enter the DMV Attack program.",
        },
        {
          title: "Families",
          value: familyCount ?? 0,
          description:
            "Family accounts connected to athletes and the parent portal.",
        },
        {
          title: "Tryout Pipeline",
          description:
            "Review athletes who have not yet moved into the official player database.",
          href: "/admin/tryouts",
        },
        {
          title: "Team Rosters",
          description:
            "View player assignments across all active DMV Attack teams.",
          href: "/admin/teams",
        },
        {
          title: "Family Portal",
          description:
            "Parent accounts can access their connected athletes through the family portal.",
          href: "/portal",
        },
        {
          title: "Player Records",
          description:
            "Athlete contact, school, position, graduation year, jersey size and family information are managed here.",
        },
      ]}
    />
  );
}
