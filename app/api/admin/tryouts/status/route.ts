import { emailDecisions, sendDecisionEmail, type Decision } from "@/lib/tryout-decision-email";
import { sameOrigin } from "@/lib/admin/api";
import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const allowedStatuses = new Set([
  "REGISTERED",
  "CHECKED_IN",
  "EVALUATING",
  "CALLBACK",
  "OFFERED",
  "ACCEPTED",
  "DECLINED",
  "PASS",
]);

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({error:"Request origin rejected"},{status:403});
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

    const body = await request.json();

    const id = String(body.id ?? "");
    const status = String(body.status ?? "").toUpperCase();

    if (!id || !allowedStatuses.has(status) ) {
      return NextResponse.json(
        { error: "Invalid status update" },
        { status: 400 }
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

    const { data: existing, error: lookupError } = await admin
      .from("tryout_submissions")
      .select("id,status,athlete_first_name,athlete_last_name,age_group,parent_email,parent_guardian_name")
      .eq("id",id).maybeSingle();
    if (lookupError) throw lookupError;
    if (!existing) return NextResponse.json({error:"Athlete not found"},{status:404});
    if (existing.status === status) return NextResponse.json({success:true,unchanged:true});

    // Never allow a dropdown to bypass the separate official roster-acceptance workflow.
    // The decision status here records selection only, not fee/account activation.
    const { data: changed, error } = await admin
      .from("tryout_submissions")
      .update({status,updated_at:new Date().toISOString()})
      .eq("id",id).eq("status",existing.status)
      .select("id").maybeSingle();
    if(error) throw error;
    if(!changed) return NextResponse.json({error:"Athlete status changed elsewhere. Refresh and try again."},{status:409});

    const email = emailDecisions.has(status as Decision)
      ? await sendDecisionEmail(admin, existing, status as Decision)
      : {state:"not_applicable" as const};

    return NextResponse.json({success:true,email:email.state});
  } catch (error) {
    console.error("Status update error:", error);

    return NextResponse.json(
      { error: "Unable to update status" },
      { status: 500 }
    );
  }
}
