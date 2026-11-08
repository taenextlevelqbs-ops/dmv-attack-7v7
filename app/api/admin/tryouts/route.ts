import {allRows} from "@/lib/admin/pagination";
import {missingTable} from "@/lib/operations/server";
import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
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

    const {data,error}=await allRows((start,end)=>admin.from("tryout_submissions").select("*").order("submitted_at",{ascending:false}).range(start,end));
    const attendance=await admin.from("tryout_attendance").select("registration_id,checked_in,version,updated_at");
    if(attendance.error&&!missingTable(attendance.error))throw attendance.error;
    const attendanceMap=new Map((attendance.data||[]).map(a=>[a.registration_id,a]));
    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Unable to load registrations" },
        { status: 500 }
      );
    }

    const registrations = await Promise.all(
      (data ?? []).map(async (registration) => {
        let headshotUrl: string | null = null;

        if (registration.headshot_path) {
          const { data: signed } = await admin.storage
            .from("tryout-headshots")
            .createSignedUrl(registration.headshot_path, 60 * 60);

          headshotUrl = signed?.signedUrl ?? null;
        }

        return {
          ...registration,
          attendance:attendanceMap.get(registration.id)||{checked_in:registration.status==="CHECKED_IN",version:0},
          headshot_url: headshotUrl,
        };
      })
    );

    return NextResponse.json({
      registrations,
      role: profile.role,
      attendance_mode:attendance.error?"LEGACY":"INDEPENDENT",
    },{headers:{"Cache-Control":"private, no-store"}});
  } catch (error) {
    console.error("Admin tryouts error:", error);

    return NextResponse.json(
      { error: "Unable to load tryouts" },
      { status: 500 }
    );
  }
}
