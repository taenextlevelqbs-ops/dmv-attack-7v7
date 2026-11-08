import {NextResponse} from "next/server";
import {createClient as adminClient} from "@supabase/supabase-js";
import {createClient as serverClient} from "@/lib/supabase/server";
import {sameOrigin} from "@/lib/admin/api";

export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Origin rejected"},{status:403});
 const auth=await serverClient(),{data:{user}}=await auth.auth.getUser();
 if(!user)return NextResponse.json({error:"Sign in required"},{status:401});
 const {data:profile}=await auth.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(profile?.role!=="OWNER")return NextResponse.json({error:"Only the owner can provision staff"},{status:403});
 const body=await request.json().catch(()=>null);
 const username=typeof body?.username==="string"?body.username.trim().toLowerCase():"";
 const password=body?.password;
 const firstName=typeof body?.first_name==="string"?body.first_name.trim().slice(0,60):"Check-in";
 if(!/^[a-z][a-z0-9_-]{3,23}$/.test(username)||typeof password!=="string"||password.length<12||password.length>128)return NextResponse.json({error:"Username must be 4–24 letters/numbers/underscores/hyphens. Password must be at least 12 characters."},{status:400});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;
 if(!url||!secret)return NextResponse.json({error:"Server not configured"},{status:503});
 const admin=adminClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 // Internal username alias: never send email to this address. Staff sign in via username.
 const email=`${username}@checkin.dmvattack.com`;
 const {data:created,error:createError}=await admin.auth.admin.createUser({email,password,email_confirm:true,app_metadata:{checkin_staff:true}});
 if(createError||!created.user)return NextResponse.json({error:"Cannot create that username. Choose another username if it is already taken."},{status:409});
 const {error:profileError}=await admin.from("profiles").upsert({id:created.user.id,first_name:firstName||"Check-in",role:"CHECKIN",updated_at:new Date().toISOString()},{onConflict:"id"});
 if(profileError){await admin.auth.admin.deleteUser(created.user.id);return NextResponse.json({error:"Staff account could not be configured"},{status:503});}
 return NextResponse.json({success:true,username});
}
