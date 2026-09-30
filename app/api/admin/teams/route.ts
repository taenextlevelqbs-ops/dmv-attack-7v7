import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

async function staffUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["OWNER", "ADMIN"].includes(profile.role)) {
    return null;
  }

  return user;
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    throw new Error("Missing Supabase configuration");
  }

  return createAdminClient(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET() {
  try {
    const user = await staffUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = adminClient();

    const { data, error } = await admin
      .from("teams")
      .select("id,name,age_group,season,active")
      .eq("active", true)
      .order("age_group")
      .order("name");

    if (error) throw error;

    return NextResponse.json({
      teams: data ?? [],
    });
  } catch (error) {
    console.error("Teams API:", error);

    return NextResponse.json(
      { error: "Unable to load teams" },
      { status: 500 }
    );
  }
}
