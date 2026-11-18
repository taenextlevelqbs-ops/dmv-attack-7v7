import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as adminClient } from "@supabase/supabase-js";
import { sameOrigin } from "@/lib/admin/api";
export async function PATCH(request:Request){
  if(!sameOrigin(request))return NextResponse.json({error:"Request origin rejected"},{status:403});
  const client=await createClient();
  const {data:{user}}=await client.auth.getUser();
  if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const {data:profile}=await client.from("profiles").select("role").eq("id",user.id).maybeSingle();
  if(!profile||!["OWNER","ADMIN","CHECKIN"].includes(profile.role))return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await request.json().catch(()=>null);
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if(!uuid.test(body?.registration_id||"")||typeof body?.checked_in!=="boolean"||!Number.isSafeInteger(body?.version)||body.version<0||!uuid.test(body?.request_id||""))
    return NextResponse.json({error:"Invalid attendance update"},{status:400});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;
  if(!url||!secret)return NextResponse.json({error:"Service unavailable"},{status:503});
  const db=adminClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await db.rpc("set_tryout_attendance",{p_registration_id:body.registration_id,p_checked_in:body.checked_in,p_version:body.version,p_request_id:body.request_id,p_staff_id:user.id});
  if(error)return NextResponse.json({error:"Attendance changed or could not be saved. Refresh and try again."},{status:409});
  return NextResponse.json({success:true,attendance:data},{headers:{"Cache-Control":"private, no-store"}});
}
