import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const authClient = await createServerClient();

    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: profile } = await authClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["OWNER", "ADMIN"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;

    if (!url || !secret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const admin = createAdminClient(url, secret, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await admin
      .from("tryout_submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Unable to load registrations" },
        { status: 500 }
      );
    }

    const registrations = await Promise.all(
      (data ?? []).map(async (registration) => {
        let headshotUrl: string | null = null;

        if (registration.headshot_path) {
          const { data: signed } = await admin.storage
            .from("tryout-headshots")
            .createSignedUrl(registration.headshot_path, 60 * 60);

          headshotUrl = signed?.signedUrl ?? null;
        }

        return {
          ...registration,
          headshot_url: headshotUrl,
        };
      })
    );

    const [rosterResult, teamResult, attendanceResult] = await Promise.all([
      admin.from("roster_assignments").select("tryout_submission_id,team_id,roster_status").in("roster_status",["OFFERED","ACCEPTED","ACTIVE"]),
      admin.from("teams").select("id,name,season").eq("active",true).eq("season","2027"),
      admin.from("tryout_attendance").select("registration_id,checked_in"),
    ]);
    if (rosterResult.error || teamResult.error) throw new Error("Unable to load team assignments");
    if (attendanceResult.error) throw new Error("Unable to load tryout attendance");
    const checkIns = new Map((attendanceResult.data ?? []).map(a=>[a.registration_id,a.checked_in]));
    const teamNames = new Map((teamResult.data ?? []).map(t => [t.id,t.name]));
    const assignedTeams = (id:string) => (rosterResult.data ?? []).filter(a => a.tryout_submission_id===id && teamNames.has(a.team_id)).map(a => ({id:a.team_id,name:teamNames.get(a.team_id),status:a.roster_status}));
    // Notification log stays server-side and is visible only to authorized admins.
    const { data: emailRows } = await admin.from("tryout_decision_emails")
      .select("submission_id,decision,state,sent_at,error_message");
    const emailBySubmission = new Map<string, typeof emailRows>();
    for (const entry of emailRows ?? []) {
      emailBySubmission.set(entry.submission_id, [...(emailBySubmission.get(entry.submission_id) ?? []), entry]);
    }
    return NextResponse.json({
      registrations: registrations.map((entry) => ({...entry, tryout_checked_in: checkIns.has(entry.id) ? checkIns.get(entry.id) : entry.status === "CHECKED_IN" ? true : null, assigned_teams: assignedTeams(entry.id), decision_emails: emailBySubmission.get(entry.id) ?? []})),
      role: profile.role,
    });
  } catch (error) {
    console.error("Admin tryouts error:", error);

    return NextResponse.json(
      { error: "Unable to load tryouts" },
      { status: 500 }
    );
  }
}
