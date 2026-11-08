import { NextResponse } from "next/server";
import { createClient as adminClient } from "@supabase/supabase-js";
import { createClient as serverClient } from "@/lib/supabase/server";
export async function GET() {
 const auth=await serverClient(); const {data:{user}}=await auth.auth.getUser();
 if(!user)return NextResponse.json({error:"Sign in required"},{status:401});
 const {data:profile}=await auth.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(!profile||!["OWNER","ADMIN","CHECKIN"].includes(profile.role))return NextResponse.json({error:"Access denied"},{status:403});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;
 if(!url||!secret)return NextResponse.json({error:"Service unavailable"},{status:503});
 const admin=adminClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await admin.from("tryout_payments").select("registration_id,status,payment_method,payment_note,verified_at");
 if(error)return NextResponse.json({error:"Payments unavailable"},{status:503});
 return NextResponse.json({payments:data},{headers:{"Cache-Control":"private, no-store"}});
}
