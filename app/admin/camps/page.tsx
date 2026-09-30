import AdminSection from "../_components/AdminSection";
import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function CampsAdminPage() {
  await requireStaff();

  return (
    <AdminSection
      eyebrow="Programs"
      title="Camps"
      description="Manage DMV Attack camps, clinics, registrations and event information."
      cards={[
        {
          title: "Upcoming Camps",
          description:
            "Create and manage upcoming DMV Attack camp dates and locations.",
        },
        {
          title: "Registration",
          description:
            "Camp registration management will live here.",
        },
        {
          title: "Attendance",
          description:
            "Track registered and checked-in athletes.",
        },
        {
          title: "Camp Communication",
          description:
            "Send important camp information to registered families.",
        },
        {
          title: "Public Camps Page",
          description:
            "Review the public-facing camps section.",
          href: "/camps",
        },
        {
          title: "Future Expansion",
          description:
            "Support free camps, position clinics and special DMV Attack events.",
        },
      ]}
    />
  );
}
