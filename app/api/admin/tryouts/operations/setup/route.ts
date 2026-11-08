import fs from 'node:fs';
import path from 'node:path';
import {ownerApi,privateHeaders} from '@/lib/admin/api';
export async function GET(){
 if(!(await ownerApi()))return Response.json({error:'Owner access required'},{status:403,headers:privateHeaders});
 return new Response(fs.readFileSync(path.join(process.cwd(),'supabase/migrations/20261108_tryout_operations.sql'),'utf8'),{headers:{...privateHeaders,'Content-Type':'text/plain; charset=utf-8','Content-Disposition':'attachment; filename="dmv-tryout-operations.sql"'}});
}
