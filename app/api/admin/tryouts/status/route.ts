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

    if (!id || !allowedStatuses.has(status)) {
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

    if(["CHECKED_IN","ACCEPTED"].includes(status))return NextResponse.json({error:"Use the dedicated attendance or acceptance workflow to preserve identity and attendance records."},{status:409});
    const {data:current,error:currentError}=await admin.from("tryout_submissions").select("status").eq("id",id).maybeSingle();
    if(currentError||!current)return NextResponse.json({error:"Registration not found"},{status:404});
    if(current.status==="ACCEPTED")return NextResponse.json({error:"An accepted roster must be changed through the roster workflow."},{status:409});
    const { data: updated, error } = await admin
      .from("tryout_submissions")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id).eq("status",current.status).select("id");

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Unable to update status" },
        { status: 500 }
      );
    }

    if(!updated?.length)return NextResponse.json({error:"Status changed on another device. Refresh and retry."},{status:409});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Status update error:", error);

    return NextResponse.json(
      { error: "Unable to update status" },
      { status: 500 }
    );
  }
}
