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

    if (!user) {
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

    if (profile.role !== "PARENT") {
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

    return NextResponse.json({
      profile,
      membership,
      family,
      athletes: athletes ?? [],
    });
  } catch (error) {
    console.error("Family portal API:", error);

    return NextResponse.json(
      { error: "Unable to load family portal" },
      { status: 500 }
    );
  }
}
