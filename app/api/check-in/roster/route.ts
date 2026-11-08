import { NextResponse } from "next/server";
import { createClient as adminClient } from "@supabase/supabase-js";
import { createClient as serverClient } from "@/lib/supabase/server";
export const runtime="nodejs";
export async function GET() {
 const auth=await serverClient();
 const {data:{user}}=await auth.auth.getUser();
 if(!user)return NextResponse.json({error:"Sign in required"},{status:401});
 const {data:profile}=await auth.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(!profile||!["OWNER","ADMIN","CHECKIN"].includes(profile.role))return NextResponse.json({error:"Access denied"},{status:403});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;
 if(!url||!secret)return NextResponse.json({error:"Service unavailable"},{status:503});
 const admin=adminClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await admin.from("tryout_submissions").select("id,tryout_id,athlete_first_name,athlete_last_name,age_group,primary_position,secondary_position,school,grade,status,bib_number,headshot_path").order("submitted_at",{ascending:false});
 if(error)return NextResponse.json({error:"Roster unavailable"},{status:503});
 const registrations=await Promise.all((data??[]).map(async ({headshot_path,...r})=>{
 let headshot_url:null|string=null;
 if(headshot_path){const {data:signed}=await admin.storage.from("tryout-headshots").createSignedUrl(headshot_path,3600);headshot_url=signed?.signedUrl??null;}
 return {...r,headshot_url};
 }));
 return NextResponse.json({registrations},{headers:{"Cache-Control":"private, no-store"}});
}
