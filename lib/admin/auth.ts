import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireStaff() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,first_name,last_name,role")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    !["OWNER", "ADMIN"].includes(profile.role)
  ) {
    redirect("/login");
  }

  return {
    supabase,
    user,
    profile,
  };
}

export async function requireOwner() {
  const auth = await requireStaff();

  if (auth.profile.role !== "OWNER") {
    redirect("/admin");
  }

  return auth;
}
