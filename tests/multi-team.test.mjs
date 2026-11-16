import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

test('staff can add a second division while preserving acceptance; same-team retries do not rewrite it',async()=>{
 let existing=null;const writes=[];
 const submission={id:'athlete',age_group:'14U',status:'ACCEPTED',athlete_first_name:'Test',athlete_last_name:'Player',date_of_birth:null};
 const team={id:'second-team',name:'15U',age_group:'15U',season:'2027'};
 function query(table){const q={select(){return q},eq(){return q},neq(){return q},in(){return q},limit(){return q},update(value){writes.push({table,value});return q},upsert(value){writes.push({table,value});return q},maybeSingle:async()=>({data:table==='tryout_submissions'?submission:existing}),single:async()=>({data:team}),then(resolve){return Promise.resolve({data:[],error:null}).then(resolve)}};return q;}const db={from:query};
 const auth={auth:{getUser:async()=>({data:{user:{id:'staff'}}})},from:()=>({select(){return this},eq(){return this},single:async()=>({data:{role:'ADMIN'}})})};
 const context={exports:{},console,process:{env:{NEXT_PUBLIC_SUPABASE_URL:'fixture',SUPABASE_SECRET_KEY:'fixture'}},require(name){if(name==='@/lib/supabase/server')return {createClient:async()=>auth};if(name==='@supabase/supabase-js')return {createClient:()=>db};if(name==='next/server')return {NextResponse:{json:(body,options)=>Response.json(body,options)}};if(name==='@/lib/admin/api')return {sameOrigin:()=>true};if(name==='@/lib/tryout-decision-email')return {sendDecisionEmail:()=>{throw Error('unexpected email')}};throw Error(name)}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/admin/rosters/offer/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
 const request=()=>new Request('https://fixture/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({tryout_submission_id:'athlete',team_id:team.id,suppress_offer_email:true})});
 const result=await context.exports.POST(request());assert.equal(result.status,200);assert.equal(writes.find(w=>w.table==='tryout_submissions').value.status,'ACCEPTED');assert.equal(writes.find(w=>w.table==='roster_assignments').value.team_id,'second-team');
 existing={roster_status:'ACCEPTED'};writes.length=0;const repeat=await context.exports.POST(request());assert.equal(repeat.status,200);assert.equal((await repeat.json()).already_accepted,true);assert.equal(writes.length,0);
});
