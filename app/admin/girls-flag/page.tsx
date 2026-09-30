import AdminSection from "../_components/AdminSection";
import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function GirlsFlagAdminPage() {
  await requireStaff();

  return (
    <AdminSection
      eyebrow="Programs"
      title="Girls Flag"
      description="Operations center for DMV Attack girls flag programming, athletes and upcoming events."
      cards={[
        {
          title: "Program",
          description:
            "Manage girls flag program information and future seasons.",
        },
        {
          title: "Athletes",
          description:
            "Player management will connect to the central athlete database.",
          href: "/admin/athletes",
        },
        {
          title: "Schedule",
          description:
            "Practices and events can be organized through the schedule center.",
          href: "/admin/schedule",
        },
        {
          title: "Communication",
          description:
            "Program announcements and family communication.",
          href: "/admin/communications",
        },
        {
          title: "Public Page",
          description:
            "Review the public DMV Attack girls flag page.",
          href: "/girls-flag",
        },
        {
          title: "Expansion",
          description:
            "Built to grow as the girls flag program develops.",
        },
      ]}
    />
  );
}
