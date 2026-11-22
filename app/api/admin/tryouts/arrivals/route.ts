import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createClient as serviceClient} from "@supabase/supabase-js";
export const dynamic="force-dynamic";
export async function GET(){
  const headers={"Cache-Control":"private, no-store"};
  try {
    const auth=await createClient();const {data:{user}}=await auth.auth.getUser();
    if(!user)return NextResponse.json({error:"Sign in required"},{status:401,headers});
    const {data:profile}=await auth.from("profiles").select("role").eq("id",user.id).maybeSingle();
    if(!profile||!["OWNER","ADMIN","CHECKIN"].includes(profile.role))return NextResponse.json({error:"Staff access required"},{status:403,headers});
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;
    if(!url||!secret)throw new Error();
    const db=serviceClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:registrations,error}=await db.from("tryout_submissions").select("id,athlete_first_name,athlete_last_name,age_group,status").in("age_group",["15U","18U"]).lt("submitted_at","2026-11-22T17:00:00-05:00").limit(1000);
    if(error)throw new Error();
    const ids=(registrations??[]).map(r=>r.id);
    const {data:attendance,error:attendanceError}=ids.length?await db.from("tryout_attendance").select("registration_id,checked_in,updated_at,self_checked_in_at").in("registration_id",ids):{data:[],error:null};
    if(attendanceError)throw new Error();
    const byId=new Map((attendance??[]).map(a=>[a.registration_id,a]));
    const arrived=(registrations??[]).filter(r=>byId.has(r.id)?byId.get(r.id)?.checked_in:r.status==="CHECKED_IN").map(r=>({
      id:r.id,name:[r.athlete_first_name,r.athlete_last_name].filter(Boolean).join(" "),division:r.age_group,
      checkedInAt:byId.get(r.id)?.updated_at??null,selfCheckinUsed:Boolean(byId.get(r.id)?.self_checked_in_at)
    })).sort((a,b)=>(b.checkedInAt??"").localeCompare(a.checkedInAt??"")||a.name.localeCompare(b.name));
    return NextResponse.json({registered:ids.length,checkedIn:arrived.length,waiting:ids.length-arrived.length,arrivals:arrived.slice(0,12),fingerprint:arrived.map(a=>a.id+":"+a.checkedInAt).join("|"),readAt:new Date().toISOString()},{headers});
  }catch{return NextResponse.json({error:"Live arrivals unavailable. Refresh or use the check-in desk view."},{status:503,headers});}
}
