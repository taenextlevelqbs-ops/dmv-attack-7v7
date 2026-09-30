import AdminSection from "../_components/AdminSection";
import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  await requireStaff();

  return (
    <AdminSection
      eyebrow="Organization Calendar"
      title="Schedule"
      description="Central operations area for practices, tournaments, team events and organization dates."
      cards={[
        {
          title: "Practices",
          description:
            "Manage practice dates, locations, times and team assignments.",
        },
        {
          title: "Tournaments",
          description:
            "Track tournament weekends, locations, participating teams and event details.",
        },
        {
          title: "Team Events",
          description:
            "Organize meetings, media days, camps and other DMV Attack events.",
        },
        {
          title: "Parent Calendar",
          description:
            "Published events will eventually appear automatically inside the family portal.",
        },
        {
          title: "2027 Season",
          description:
            "Operational calendar for the upcoming DMV Attack 7v7 season.",
        },
        {
          title: "Team Rosters",
          description:
            "Jump to team management when assigning events by roster.",
          href: "/admin/teams",
        },
      ]}
    />
  );
}
