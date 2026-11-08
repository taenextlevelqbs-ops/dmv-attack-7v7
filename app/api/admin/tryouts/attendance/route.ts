import {sameOrigin,privateHeaders} from '@/lib/admin/api';
import {staff,uuid,missingTable} from '@/lib/operations/server';
export async function PATCH(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Request origin rejected'},{status:403,headers:privateHeaders});
 const auth=await staff();if(!auth)return Response.json({error:'Staff access required'},{status:403,headers:privateHeaders});
 const body=await request.json().catch(()=>null);
 if(!uuid(body?.id)||!uuid(body?.request_id)||typeof body?.checked_in!=='boolean'||!Number.isInteger(body?.version)||body.version<0)return Response.json({error:'Invalid attendance request'},{status:400,headers:privateHeaders});
 const result=await auth.db.rpc('set_tryout_attendance',{p_registration_id:body.id,p_checked_in:body.checked_in,p_version:body.version,p_request_id:body.request_id,p_staff_id:auth.user.id});
 if(!result.error)return Response.json({attendance:result.data},{headers:privateHeaders});
 if(missingTable(result.error)){
  // Safe existing-schema fallback for event day. Never reset a decision to change attendance.
  const expected=body.checked_in?'REGISTERED':'CHECKED_IN',status=body.checked_in?'CHECKED_IN':'REGISTERED';
  const {data,error}=await auth.db.from('tryout_submissions').update({status,updated_at:new Date().toISOString()}).eq('id',body.id).eq('status',expected).select('id');
  if(!error&&data?.length)return Response.json({attendance:{checked_in:body.checked_in,version:0},legacy:true},{headers:privateHeaders});
  return Response.json({error:'Refresh attendance. Advanced decision statuses need the independent attendance migration; no decision was overwritten.'},{status:409,headers:privateHeaders});
 }
 return Response.json({error:'Attendance changed or could not be saved. Refresh and retry.'},{status:409,headers:privateHeaders});
}
