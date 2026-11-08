import {sameOrigin,privateHeaders} from '@/lib/admin/api';
import {staff,uuid} from '@/lib/operations/server';
import {deliverAcceptance} from '@/lib/operations/notifications';
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Request origin rejected'},{status:403,headers:privateHeaders});
 const auth=await staff();if(!auth)return Response.json({error:'Staff access required'},{status:403,headers:privateHeaders});
 const body=await request.json().catch(()=>null);
 if(!uuid(body?.tryout_submission_id)||!uuid(body?.team_id))return Response.json({error:'Select an athlete and a team'},{status:400,headers:privateHeaders});
 const result=await auth.db.rpc('accept_tryout_athlete',{p_registration_id:body.tryout_submission_id,p_team_id:body.team_id,p_staff_id:auth.user.id});
 if(result.error)return Response.json({error:'Acceptance could not complete. Verify the operations migration, active offer, matching division and any existing accepted team. No partial family or athlete records were committed.'},{status:409,headers:privateHeaders});
 const notification=await deliverAcceptance(result.data.notification_id).catch(()=>({status:'FAILED',sent:false}));
 return Response.json({success:true,...result.data,notification},{headers:privateHeaders});
}
