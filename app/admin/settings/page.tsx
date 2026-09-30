import AdminSection from "../_components/AdminSection";
import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { supabase, profile } = await requireStaff();

  const { data: staff } = await supabase
    .from("profiles")
    .select("first_name,last_name,role")
    .in("role", ["OWNER", "ADMIN"])
    .order("role");

  const owners =
    staff?.filter((member) => member.role === "OWNER").length ?? 0;

  const admins =
    staff?.filter((member) => member.role === "ADMIN").length ?? 0;

  return (
    <AdminSection
      eyebrow="System"
      title="Staff + Settings"
      description={`Signed in as ${profile.first_name ?? "Staff"} · ${profile.role}`}
      cards={[
        {
          title: "Owners",
          value: owners,
          description:
            "Owners have complete DMV Attack management access including finance.",
        },
        {
          title: "Admins",
          value: admins,
          description:
            "Admins have operational access without owner financial permissions.",
        },
        {
          title: "Tae",
          description:
            "OWNER · Full organization and financial access.",
        },
        {
          title: "Dante",
          description:
            "OWNER · Full organization and financial access.",
        },
        {
          title: "Ross",
          description:
            "ADMIN · Full operational access without finance and payment management.",
        },
        {
          title: "Security",
          description:
            "Staff authentication is managed through Supabase with role-based access.",
        },
      ]}
    />
  );
}
