import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { allRows } from "@/lib/admin/pagination";
import { privateHeaders } from "@/lib/admin/api";

export const dynamic = "force-dynamic";

// Read-only aggregation: acceptance, registration, payment and family writes stay
// in their existing, independently authorized endpoints.
export async function GET() {
  const respond = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: privateHeaders });
  try {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return respond({ error: "Sign in required" }, 401);
    const { data: profile } = await client.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || !["OWNER", "ADMIN"].includes(profile.role)) return respond({ error: "Staff access required" }, 403);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, secret = process.env.SUPABASE_SECRET_KEY;
    if (!url || !secret) return respond({ error: "Server configuration unavailable" }, 503);
    const db = createAdmin(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
    const [registrations, teams, assignments, families, athletes, coaches, staff] = await Promise.all([
      allRows((start, end) => db.from("tryout_submissions").select("id,tryout_id,athlete_first_name,athlete_last_name,age_group,primary_position,school,status,referral_source,linked_athlete_id,linked_family_id,parent_email,parent_guardian_name,headshot_path,submitted_at").order("id").range(start, end)),
      allRows((start, end) => db.from("teams").select("id,name,age_group,season,active").eq("season", "2027").eq("active", true).order("id").range(start, end)),
      allRows((start, end) => db.from("roster_assignments").select("id,team_id,tryout_submission_id,roster_status").order("id").range(start, end)),
      db.from("families").select("id", { count: "exact", head: true }),
      db.from("athletes").select("id", { count: "exact", head: true }),
      allRows((start, end) => db.from("team_coaches").select("id,team_id,coach_id").order("id").range(start, end)),
      allRows((start, end) => db.from("profiles").select("id,first_name,last_name").order("id").range(start, end)),
    ]);
    const problems: string[] = [];
    for (const [label, result] of [["Registrations", registrations], ["Teams", teams], ["Roster assignments", assignments], ["Families", families], ["Athlete profiles", athletes], ["Coach assignments", coaches], ["Coach names", staff]] as const) {
      if (result.error) problems.push(`${label} unavailable. Retry or review setup.`);
    }
    const teamIds = new Set((teams.data || []).map(t => t.id));
    const activeAssignments = assignments.error || teams.error ? null : (assignments.data || []).filter(a => teamIds.has(a.team_id));
    const names = new Map((staff.data || []).map(p => [p.id, [p.first_name, p.last_name].filter(Boolean).join(" ") || "Name not recorded"]));
    return respond({
      fetched_at: new Date().toISOString(), problems,
      registrations: registrations.error ? null : (registrations.data || []).map(({ headshot_path, ...r }) => ({ ...r, has_headshot: Boolean(headshot_path) })),
      teams: teams.error ? null : (teams.data || []).map(t => ({ ...t, coaches: coaches.error || staff.error ? null : (coaches.data || []).filter(c => c.team_id === t.id).map(c => names.get(c.coach_id) || "Name unavailable") })),
      assignments: activeAssignments,
      family_count: families.error ? null : families.count,
      athlete_count: athletes.error ? null : athletes.count,
    });
  } catch {
    return respond({ error: "Unable to load season records. Refresh to retry." }, 503);
  }
}
