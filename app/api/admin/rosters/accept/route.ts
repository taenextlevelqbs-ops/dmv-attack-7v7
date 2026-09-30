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

function cleanEmail(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const staff = await authorizeStaff();

    if (!staff) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const tryoutId = String(
      body.tryout_submission_id ?? ""
    ).trim();

    const teamId = String(body.team_id ?? "").trim();

    if (!tryoutId || !teamId) {
      return NextResponse.json(
        { error: "Athlete and team are required" },
        { status: 400 }
      );
    }

    const admin = getAdmin();
    const now = new Date().toISOString();

    // --------------------------------------------------
    // 1. Load tryout submission
    // --------------------------------------------------

    const { data: submission, error: submissionError } =
      await admin
        .from("tryout_submissions")
        .select(`
          id,
          athlete_first_name,
          athlete_last_name,
          date_of_birth,
          graduation_year,
          school,
          age_group,
          height,
          weight,
          primary_position,
          secondary_position,
          athlete_social,
          highlight_url,
          parent_guardian_name,
          parent_email,
          parent_phone,
          emergency_contact_name,
          emergency_contact_phone,
          medical_information,
          headshot_path,
          linked_athlete_id,
          linked_family_id,
          status
        `)
        .eq("id", tryoutId)
        .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: "Tryout submission not found" },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 2. Validate team
    // --------------------------------------------------

    const { data: team, error: teamError } = await admin
      .from("teams")
      .select("id,name,age_group,season,active")
      .eq("id", teamId)
      .eq("active", true)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 3. Validate roster assignment
    // --------------------------------------------------

    const { data: assignment, error: assignmentError } =
      await admin
        .from("roster_assignments")
        .select(`
          id,
          tryout_submission_id,
          team_id,
          roster_status,
          accepted_at
        `)
        .eq("tryout_submission_id", tryoutId)
        .eq("team_id", teamId)
        .maybeSingle();

    if (assignmentError) {
      throw assignmentError;
    }

    if (!assignment) {
      return NextResponse.json(
        {
          error:
            "No roster offer exists for this athlete and team",
        },
        { status: 400 }
      );
    }

    const parentEmail = cleanEmail(
      submission.parent_email
    );

    if (!parentEmail) {
      return NextResponse.json(
        {
          error:
            "Parent email is required before accepting this athlete",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. Find or create family
    //
    // Reuse linked family first.
    // Otherwise reuse normalized parent email.
    // This lets siblings share one family.
    // --------------------------------------------------

    let familyId =
      submission.linked_family_id ?? null;

    if (!familyId) {
      const { data: existingFamilies, error } =
        await admin
          .from("families")
          .select("id,primary_email")
          .ilike("primary_email", parentEmail)
          .limit(1);

      if (error) throw error;

      if (existingFamilies?.length) {
        familyId = existingFamilies[0].id;
      }
    }

    if (!familyId) {
      const familyName =
        submission.parent_guardian_name?.trim()
          ? `${submission.parent_guardian_name.trim()} Family`
          : `${submission.athlete_last_name} Family`;

      const { data: family, error: familyError } =
        await admin
          .from("families")
          .insert({
            family_name: familyName,
            primary_email: parentEmail,
            primary_phone:
              submission.parent_phone ?? null,
          })
          .select("id")
          .single();

      if (familyError || !family) {
        throw familyError ?? new Error(
          "Unable to create family"
        );
      }

      familyId = family.id;
    }

    // --------------------------------------------------
    // 5. Find or create official athlete
    //
    // linked_athlete_id makes repeated acceptance safe.
    // --------------------------------------------------

    let athleteId =
      submission.linked_athlete_id ?? null;

    if (!athleteId) {
      const { data: athlete, error: athleteError } =
        await admin
          .from("athletes")
          .insert({
            family_id: familyId,
            first_name:
              submission.athlete_first_name,
            last_name:
              submission.athlete_last_name,
            date_of_birth:
              submission.date_of_birth ?? null,
            graduation_year:
              submission.graduation_year ?? null,
            school:
              submission.school ?? null,
            age_group:
              submission.age_group ?? null,
            primary_position:
              submission.primary_position ?? null,
            secondary_positions:
              submission.secondary_position
                ? [submission.secondary_position]
                : null,
            height:
              submission.height ?? null,
            weight:
              submission.weight
                ? Number(submission.weight) || null
                : null,
            emergency_contact_name:
              submission.emergency_contact_name ?? null,
            emergency_contact_phone:
              submission.emergency_contact_phone ?? null,
            medical_notes:
              submission.medical_information ?? null,
            highlight_url:
              submission.highlight_url ?? null,
            headshot_path:
              submission.headshot_path ?? null,
          })
          .select("id")
          .single();

      if (athleteError || !athlete) {
        throw athleteError ?? new Error(
          "Unable to create athlete"
        );
      }

      athleteId = athlete.id;
    }

    // --------------------------------------------------
    // 6. Link submission to official records
    // --------------------------------------------------

    const { error: linkError } = await admin
      .from("tryout_submissions")
      .update({
        linked_family_id: familyId,
        linked_athlete_id: athleteId,
        status: "ACCEPTED",
        updated_at: now,
      })
      .eq("id", tryoutId);

    if (linkError) throw linkError;

    // --------------------------------------------------
    // 7. Mark roster assignment accepted
    // --------------------------------------------------

    const { error: rosterError } = await admin
      .from("roster_assignments")
      .update({
        roster_status: "ACCEPTED",
        accepted_at:
          assignment.accepted_at ?? now,
        updated_at: now,
      })
      .eq("id", assignment.id);

    if (rosterError) throw rosterError;

    // --------------------------------------------------
    // 8. Find existing parent Auth account
    //
    // We do NOT create random passwords.
    // If the parent already has an account, connect it.
    // Otherwise the account remains pending activation.
    // --------------------------------------------------

    const {
      data: { users },
      error: usersError,
    } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (usersError) throw usersError;

    const parentUser = users.find(
      (candidate) =>
        cleanEmail(candidate.email) === parentEmail
    );

    let parentLinked = false;

    if (parentUser) {
      const { error: profileError } = await admin
        .from("profiles")
        .upsert(
          {
            id: parentUser.id,
            first_name:
              submission.parent_guardian_name ?? null,
            role: "PARENT",
            updated_at: now,
          },
          {
            onConflict: "id",
          }
        );

      if (profileError) throw profileError;

      const { data: existingMembership, error: memberLookupError } =
        await admin
          .from("family_members")
          .select("id,family_id")
          .eq("profile_id", parentUser.id)
          .maybeSingle();

      if (memberLookupError) {
        throw memberLookupError;
      }

      if (
        existingMembership &&
        existingMembership.family_id !== familyId
      ) {
        return NextResponse.json(
          {
            error:
              "Parent account is already connected to another family. Staff review required.",
          },
          { status: 409 }
        );
      }

      if (!existingMembership) {
        const { error: memberError } = await admin
          .from("family_members")
          .insert({
            family_id: familyId,
            profile_id: parentUser.id,
            relationship: "Parent/Guardian",
            is_primary: true,
          });

        if (memberError) throw memberError;
      }

      parentLinked = true;
    }

    return NextResponse.json({
      success: true,
      athlete_id: athleteId,
      family_id: familyId,
      parent_email: parentEmail,
      parent_account_linked: parentLinked,
      parent_account_required: !parentLinked,
      team: {
        id: team.id,
        name: team.name,
        age_group: team.age_group,
        season: team.season,
      },
    });
  } catch (error) {
    console.error("Roster acceptance API:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to accept roster offer",
      },
      { status: 500 }
    );
  }
}
