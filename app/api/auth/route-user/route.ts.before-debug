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

    console.log("=== ROUTE USER DEBUG ===");
    console.log("Authenticated user ID:", user.id);
    console.log("Authenticated email:", user.email);

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role,first_name,last_name")
      .eq("id", user.id)
      .single();

    console.log("Profile returned:", profile);
    console.log(
      "Profile error:",
      error
        ? {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          }
        : null
    );

    if (error || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    let destination = "/login";

    if (
      profile.role === "OWNER" ||
      profile.role === "ADMIN" ||
      profile.role === "COACH"
    ) {
      destination = "/admin";
    }

    if (profile.role === "PARENT") {
      destination = "/portal";
    }

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
