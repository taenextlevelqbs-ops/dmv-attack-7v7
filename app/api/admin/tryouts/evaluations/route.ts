import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    throw new Error("Missing Supabase server configuration");
  }

  return createAdminClient(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function getStaff() {
  const auth = await createServerClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) return null;

  const { data: profile } = await auth
    .from("profiles")
    .select("first_name,last_name,role")
    .eq("id", user.id)
    .single();

  if (!profile || !["OWNER", "ADMIN"].includes(profile.role)) {
    return null;
  }

  return {
    user,
    profile,
  };
}

function score(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isInteger(number) || number < 1 || number > 5) {
    return null;
  }

  return number;
}

export async function GET(request: Request) {
  try {
    const staff = await getStaff();

    if (!staff) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tryoutId = searchParams.get("tryout");

    if (!tryoutId) {
      return NextResponse.json(
        { error: "Missing tryout registration" },
        { status: 400 }
      );
    }

    const admin = adminClient();

    const { data: evaluations, error } = await admin
      .from("coach_tryout_evaluations")
      .select("*")
      .eq("tryout_submission_id", tryoutId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Unable to load evaluations" },
        { status: 500 }
      );
    }

    const evaluatorIds = [
      ...new Set(
        (evaluations ?? []).map((evaluation) => evaluation.evaluator_id)
      ),
    ];

    let profiles: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      role: string;
    }[] = [];

    if (evaluatorIds.length) {
      const { data } = await admin
        .from("profiles")
        .select("id,first_name,last_name,role")
        .in("id", evaluatorIds);

      profiles = data ?? [];
    }

    const profileMap = new Map(
      profiles.map((profile) => [profile.id, profile])
    );

    const enriched = (evaluations ?? []).map((evaluation) => {
      const profile = profileMap.get(evaluation.evaluator_id);

      const evaluatorName =
        [profile?.first_name, profile?.last_name]
          .filter(Boolean)
          .join(" ") || "DMV Attack Staff";

      return {
        ...evaluation,
        evaluator_name: evaluatorName,
        evaluator_role: profile?.role ?? "STAFF",
        is_mine: evaluation.evaluator_id === staff.user.id,
      };
    });

    return NextResponse.json({
      evaluations: enriched,
      currentEvaluator: {
        id: staff.user.id,
        name:
          [
            staff.profile.first_name,
            staff.profile.last_name,
          ]
            .filter(Boolean)
            .join(" ") || staff.user.email,
        role: staff.profile.role,
      },
    });
  } catch (error) {
    console.error("Evaluation GET error:", error);

    return NextResponse.json(
      { error: "Unable to load evaluations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const staff = await getStaff();

    if (!staff) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const tryoutSubmissionId = String(
      body.tryout_submission_id ?? ""
    );

    if (!tryoutSubmissionId) {
      return NextResponse.json(
        { error: "Missing athlete" },
        { status: 400 }
      );
    }

    const allowedRecommendations = new Set([
      "TAKE",
      "CALLBACK",
      "BORDERLINE",
      "PASS",
    ]);

    const recommendation = String(
      body.recommendation ?? ""
    ).toUpperCase();

    if (
      recommendation &&
      !allowedRecommendations.has(recommendation)
    ) {
      return NextResponse.json(
        { error: "Invalid recommendation" },
        { status: 400 }
      );
    }

    const payload = {
      tryout_submission_id: tryoutSubmissionId,
      evaluator_id: staff.user.id,

      athleticism: score(body.athleticism),
      speed: score(body.speed),
      football_iq: score(body.football_iq),
      hands_ball_skills: score(body.hands_ball_skills),
      route_running: score(body.route_running),
      coverage_skill: score(body.coverage_skill),
      competitiveness: score(body.competitiveness),
      coachability: score(body.coachability),
      overall_grade: score(body.overall_grade),

      strengths:
        String(body.strengths ?? "").trim() || null,

      development_notes:
        String(body.development_notes ?? "").trim() || null,

      private_notes:
        String(body.private_notes ?? "").trim() || null,

      recommendation: recommendation || null,

      updated_at: new Date().toISOString(),
    };

    const admin = adminClient();

    const { data, error } = await admin
      .from("coach_tryout_evaluations")
      .upsert(payload, {
        onConflict: "tryout_submission_id,evaluator_id",
      })
      .select()
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Unable to save evaluation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      evaluation: data,
    });
  } catch (error) {
    console.error("Evaluation POST error:", error);

    return NextResponse.json(
      { error: "Unable to save evaluation" },
      { status: 500 }
    );
  }
}
