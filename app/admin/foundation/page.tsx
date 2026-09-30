import AdminSection from "../_components/AdminSection";
import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function FoundationAdminPage() {
  await requireStaff();

  return (
    <AdminSection
      eyebrow="DMV Attack Foundation"
      title="Foundation"
      description="Management center for DMV Attack Foundation programs, camps and community initiatives."
      cards={[
        {
          title: "Programs",
          description:
            "Manage Foundation initiatives supporting DMV-area youth athletes.",
        },
        {
          title: "Free Camps",
          description:
            "Plan Foundation camps and community events.",
          href: "/admin/camps",
        },
        {
          title: "Athlete Support",
          description:
            "Track future equipment, uniform, travel and development assistance.",
        },
        {
          title: "Scholarships",
          description:
            "Scholarship and athlete assistance management foundation.",
        },
        {
          title: "Communication",
          description:
            "Coordinate Foundation announcements and outreach.",
          href: "/admin/communications",
        },
        {
          title: "Public Foundation Page",
          description:
            "Review the public-facing DMV Attack Foundation information.",
          href: "/foundation",
        },
      ]}
    />
  );
}
