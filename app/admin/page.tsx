import { requireStaff } from "@/lib/admin/auth";
import SeasonWorkspace from "./SeasonWorkspace";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const { profile } = await requireStaff();
  return <SeasonWorkspace name={profile.first_name || "Coach"} owner={profile.role === "OWNER"} />;
}
