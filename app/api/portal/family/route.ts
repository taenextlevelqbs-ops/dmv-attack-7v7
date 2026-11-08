import {summarizeAccount} from "@/lib/finance/money.mjs";
import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

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
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Not signed in" },
        { status: 401 }
      );
    }

    const admin = getAdmin();

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id,first_name,last_name,role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (!["PARENT","OWNER","ADMIN"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Parent account required" },
        { status: 403 }
      );
    }

    const { data: membership, error: membershipError } = await admin
      .from("family_members")
      .select("family_id,relationship,is_primary")
      .eq("profile_id", user.id)
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      throw membershipError;
    }

    if (!membership) {
      return NextResponse.json({
        profile,
        family: null,
        athletes: [],
        message:
          "Your account is active but has not been linked to a DMV Attack family yet.",
      });
    }

    const { data: family, error: familyError } = await admin
      .from("families")
      .select("id,family_name,primary_email,primary_phone,created_at")
      .eq("id", membership.family_id)
      .single();

    if (familyError) {
      throw familyError;
    }

    const { data: athletes, error: athletesError } = await admin
      .from("athletes")
      .select(`
        id,
        first_name,
        last_name,
        date_of_birth,
        graduation_year,
        school,
        age_group,
        primary_position,
        secondary_positions,
        jersey_size,
        headshot_path,
        created_at
      `)
      .eq("family_id", membership.family_id)
      .order("first_name");

    if (athletesError) {
      throw athletesError;
    }

    const {data:registrations,error:registrationsError}=await admin.from("tryout_submissions").select("id,athlete_first_name,athlete_last_name,age_group,status").eq("linked_family_id",membership.family_id);
    if(registrationsError)throw registrationsError;
    const ids=(registrations||[]).map(r=>r.id);
    let offers:unknown[]=[];let fees:unknown[]=[];
    if(ids.length){
      const assignments=await admin.from("roster_assignments").select("id,team_id,tryout_submission_id,roster_status,teams(name,season,age_group)").in("tryout_submission_id",ids);if(assignments.error)throw assignments.error;offers=assignments.data||[];
      const accounts=await admin.from("team_fee_accounts").select("*").in("registration_id",ids);if(accounts.error)throw accounts.error;
      const transactions=accounts.data?.length?await admin.from("team_fee_transactions").select("account_id,kind,amount_cents").in("account_id",accounts.data.map(a=>a.id)):{data:[],error:null};if(transactions.error)throw transactions.error;
      fees=(accounts.data||[]).map(a=>({...summarizeAccount(a,transactions.data||[],""),eligible:(registrations||[]).some(r=>r.id===a.registration_id&&r.status==="ACCEPTED")&&(assignments.data||[]).some(r=>r.tryout_submission_id===a.registration_id&&r.team_id===a.team_id&&["ACCEPTED","ACTIVE"].includes(r.roster_status))}));
    }
    return NextResponse.json({profile,membership,family,athletes:athletes??[],registrations,offers,fees},{headers:{"Cache-Control":"private, no-store"}});
  } catch (error) {
    console.error("Family portal API:", error);

    return NextResponse.json(
      { error: "Unable to load family portal" },
      { status: 500 }
    );
  }
}
