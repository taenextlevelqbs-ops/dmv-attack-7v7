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

export async function POST(request: Request) {
  try {
    const user = await staffUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const tryoutId = String(
      body.tryout_submission_id ?? ""
    );

    const teamId = String(body.team_id ?? "");

    if (!tryoutId || !teamId) {
      return NextResponse.json(
        { error: "Athlete and team are required" },
        { status: 400 }
      );
    }

    const admin = adminClient();

    const { data: team, error: teamError } = await admin
      .from("teams")
      .select("id,name,age_group,season")
      .eq("id", teamId)
      .eq("active", true)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    const { error: rosterError } = await admin
      .from("roster_assignments")
      .upsert(
        {
          tryout_submission_id: tryoutId,
          team_id: teamId,
          roster_status: "OFFERED",
          offered_at: now,
          created_by: user.id,
          updated_at: now,
        },
        {
          onConflict: "tryout_submission_id,team_id",
        }
      );

    if (rosterError) throw rosterError;

    const { error: statusError } = await admin
      .from("tryout_submissions")
      .update({
        status: "OFFERED",
        updated_at: now,
      })
      .eq("id", tryoutId);

    if (statusError) throw statusError;

    return NextResponse.json({
      success: true,
      team,
    });
  } catch (error) {
    console.error("Offer API:", error);

    return NextResponse.json(
      { error: "Unable to create offer" },
      { status: 500 }
    );
  }
}
