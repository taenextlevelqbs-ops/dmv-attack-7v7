import AdminSection from "../_components/AdminSection";
import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function FormsPage() {
  await requireStaff();

  return (
    <AdminSection
      eyebrow="Documents"
      title="Forms + Waivers"
      description="Central location for required player forms, waivers and organization documents."
      cards={[
        {
          title: "Player Waivers",
          description:
            "Track required participation and liability waivers.",
        },
        {
          title: "Medical Information",
          description:
            "Manage required athlete medical and emergency information.",
        },
        {
          title: "Parent Agreements",
          description:
            "Store program acknowledgements and family agreements.",
        },
        {
          title: "Missing Forms",
          description:
            "Identify athletes who still need required documentation.",
        },
        {
          title: "Tryout Registration",
          description:
            "Registration already captures consent and roster acknowledgement information.",
          href: "/admin/tryouts",
        },
        {
          title: "Parent Portal",
          description:
            "Families will be able to review required documents from their portal.",
        },
      ]}
    />
  );
}
