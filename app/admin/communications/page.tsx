import AdminSection from "../_components/AdminSection";
import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function CommunicationsPage() {
  const { supabase } = await requireStaff();

  const [
    { count: familyCount },
    { count: athleteCount },
  ] = await Promise.all([
    supabase
      .from("families")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("athletes")
      .select("*", { count: "exact", head: true }),
  ]);

  return (
    <AdminSection
      eyebrow="Organization Messaging"
      title="Communications"
      description="Communication center for families, athletes and team-specific announcements."
      cards={[
        {
          title: "Families",
          value: familyCount ?? 0,
          description:
            "Family accounts available for organization communication.",
        },
        {
          title: "Athletes",
          value: athleteCount ?? 0,
          description:
            "Official athletes currently available for team communication.",
        },
        {
          title: "Organization Announcements",
          description:
            "Publish important DMV Attack updates to families.",
        },
        {
          title: "Team Messages",
          description:
            "Target communication to specific team rosters.",
        },
        {
          title: "Tryout Communication",
          description:
            "Manage communication with athletes currently in the tryout process.",
          href: "/admin/tryouts",
        },
        {
          title: "Parent Portal",
          description:
            "Published announcements will eventually surface directly inside each family account.",
        },
      ]}
    />
  );
}
