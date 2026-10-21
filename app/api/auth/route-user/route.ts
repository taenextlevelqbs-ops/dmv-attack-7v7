import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role,first_name,last_name")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    let destination = "/login";

    if (
      profile.role === "OWNER" ||
      profile.role === "ADMIN"
    ) {
      destination = "/admin";
    }

    if (profile.role === "PARENT") {
      destination = "/portal";
    }

    if (destination === "/login") return NextResponse.json({error:"This account does not have an enabled DMV Attack workspace. Contact the owner for access."},{status:403});

    return NextResponse.json({
      destination,
      role: profile.role,
      profile,
    });
  } catch (error) {
    console.error("Route user error:", error);

    return NextResponse.json(
      { error: "Unable to route account" },
      { status: 500 }
    );
  }
}
