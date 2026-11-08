import {sameOrigin,privateHeaders} from '@/lib/admin/api';
import {staff,uuid} from '@/lib/operations/server';
import {deliverAcceptance} from '@/lib/operations/notifications';
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Request origin rejected'},{status:403,headers:privateHeaders});
 const auth=await staff();if(!auth)return Response.json({error:'Staff access required'},{status:403,headers:privateHeaders});
 const body=await request.json().catch(()=>null);if(!uuid(body?.assignment_id))return Response.json({error:'Select an assignment'},{status:400,headers:privateHeaders});
 const {data,error}=await auth.db.from('tryout_acceptance_notifications').select('id').eq('assignment_id',body.assignment_id).single();
 if(error||!data)return Response.json({error:'Notification not queued'},{status:404,headers:privateHeaders});
 const result=await deliverAcceptance(data.id);return Response.json(result,{status:result.sent?200:202,headers:privateHeaders});
}
