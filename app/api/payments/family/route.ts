import { createClient } from "@/lib/supabase/server";
import { stripeDatabase } from "@/lib/finance/stripe";
import { privateHeaders } from "@/lib/admin/api";
import { allRows } from "@/lib/admin/pagination";
export async function GET() {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user || !user.email_confirmed_at)
      return Response.json(
        { error: "Sign in to view your registrations" },
        { status: 401, headers: privateHeaders },
      );
    const db = stripeDatabase();
    const { data: members, error: memberError } = await db
      .from("family_members")
      .select("family_id")
      .eq("profile_id", user.id);
    if (memberError) throw memberError;
    const email = (user.email || "").trim().toLowerCase();
    // Exact comparisons avoid PostgREST filter injection or email-pattern matching.
    const byEmail = await allRows((start, end) =>
      db
        .from("tryout_submissions")
        .select(
          "id,tryout_id,athlete_first_name,athlete_last_name,age_group,status",
        )
        .eq("parent_email", email)
        .order("id")
        .range(start, end),
    );
    if (byEmail.error) throw byEmail.error;
    const registrations = new Map((byEmail.data || []).map((r) => [r.id, r]));
    for (const member of members || []) {
      const rows = await allRows((start, end) =>
        db
          .from("tryout_submissions")
          .select(
            "id,tryout_id,athlete_first_name,athlete_last_name,age_group,status",
          )
          .eq("linked_family_id", member.family_id)
          .order("id")
          .range(start, end),
      );
      if (rows.error) throw rows.error;
      for (const row of rows.data || []) registrations.set(row.id, row);
    }
    const result = await Promise.all(
      [...registrations.values()].map(async (registration) => {
        const { data: offers, error } = await db
          .from("roster_assignments")
          .select("team_id,roster_status,teams(name,season,age_group)")
          .eq("tryout_submission_id", registration.id);
        if (error) throw error;
        return { ...registration, offers: offers || [] };
      }),
    );
    return Response.json(
      { registrations: result },
      { headers: privateHeaders },
    );
  } catch {
    return Response.json(
      { error: "Unable to load your registrations" },
      { status: 503, headers: privateHeaders },
    );
  }
}
