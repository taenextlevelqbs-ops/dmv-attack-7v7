import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

async function authorizeStaff() {
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

function getAdmin() {
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
    const user = await authorizeStaff();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = getAdmin();

    const { data: teams, error: teamsError } = await admin
      .from("teams")
      .select("id,name,age_group,season,active")
      .eq("season", "2027")
      .eq("active", true)
      .order("age_group")
      .order("name");

    if (teamsError) throw teamsError;

    const { data: assignments, error: assignmentsError } =
      await admin
        .from("roster_assignments")
        .select(`
          id,
          team_id,
          tryout_submission_id,
          roster_status,
          offered_at,
          accepted_at,
          created_at
        `);

    if (assignmentsError) throw assignmentsError;

    const athleteIds = [
      ...new Set(
        (assignments ?? []).map(
          (assignment) =>
            assignment.tryout_submission_id
        )
      ),
    ];

    let athletes: any[] = [];

    if (athleteIds.length) {
      const { data, error } = await admin
        .from("tryout_submissions")
        .select(`
          id,
          tryout_id,
          athlete_first_name,
          athlete_last_name,
          age_group,
          primary_position,
          secondary_position,
          school,
          grade,
          headshot_url,
          status
        `)
        .in("id", athleteIds);

      if (error) throw error;

      athletes = data ?? [];
    }

    const athleteMap = new Map(
      athletes.map((athlete) => [
        athlete.id,
        athlete,
      ])
    );

    const rosters = (teams ?? []).map((team) => {
      const teamAssignments = (
        assignments ?? []
      )
        .filter(
          (assignment) =>
            assignment.team_id === team.id
        )
        .map((assignment) => ({
          ...assignment,
          athlete:
            athleteMap.get(
              assignment.tryout_submission_id
            ) ?? null,
        }));

      return {
        ...team,
        assignments: teamAssignments,
      };
    });

    return NextResponse.json({
      teams: rosters,
    });
  } catch (error) {
    console.error("Rosters API:", error);

    return NextResponse.json(
      { error: "Unable to load rosters" },
      { status: 500 }
    );
  }
}
