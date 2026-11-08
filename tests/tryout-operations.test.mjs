import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {syncTryoutPayment} from '../lib/operations/stripe.mjs';
import {STRIPE_TRYOUT_URL} from '../lib/tryouts.mjs';

test('isolated 38-athlete operations: reversible attendance, atomic acceptance, two 18U teams, sibling reuse, notifications and RLS',async()=>{
 const db=new PGlite();try{
 const owner=randomUUID(),other=randomUUID(),teamA=randomUUID(),teamB=randomUUID(),family=randomUUID();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create table profiles(id uuid primary key references auth.users(id),first_name text,role text,updated_at timestamptz default now());
 create table families(id uuid primary key default gen_random_uuid(),family_name text,primary_email text,primary_phone text,created_at timestamptz default now());
 create table athletes(id uuid primary key default gen_random_uuid(),family_id uuid references families(id),first_name text,last_name text,date_of_birth date,graduation_year int,school text,age_group text,primary_position text,secondary_positions text[],height text,weight integer,emergency_contact_name text,emergency_contact_phone text,medical_notes text,highlight_url text,headshot_path text);
 create table family_members(id uuid primary key default gen_random_uuid(),family_id uuid references families(id),profile_id uuid references profiles(id),relationship text,is_primary bool);
 create table teams(id uuid primary key,name text,age_group text,season text,active bool);
 create table tryout_submissions(id uuid primary key,tryout_id text,athlete_first_name text,athlete_last_name text,date_of_birth date,graduation_year int,school text,age_group text,height text,weight text,primary_position text,secondary_position text,parent_guardian_name text,parent_email text,parent_phone text,emergency_contact_name text,emergency_contact_phone text,medical_information text,highlight_url text,headshot_path text,linked_athlete_id uuid,linked_family_id uuid,status text default 'REGISTERED',updated_at timestamptz default now());
 create table roster_assignments(id uuid primary key default gen_random_uuid(),tryout_submission_id uuid references tryout_submissions(id),team_id uuid references teams(id),roster_status text,accepted_at timestamptz,updated_at timestamptz default now());
 grant all on profiles to anon,authenticated;alter table profiles enable row level security;create policy old_profile_read on profiles for select to authenticated using(true);
 insert into auth.users values('${owner}','parent@fixture.invalid'),('${other}','other@fixture.invalid');insert into profiles(id,role)values('${owner}','OWNER'),('${other}','PARENT');
 insert into teams values('${teamA}','Fixture 18U A','18U','2027',true),('${teamB}','Fixture 18U B','18U','2027',true);
 insert into families(id,primary_email)values('${family}',' Parent@Fixture.Invalid ');`);
 const ids=Array.from({length:38},()=>randomUUID());
 for(let i=0;i<38;i++)await db.query("insert into tryout_submissions(id,tryout_id,athlete_first_name,athlete_last_name,date_of_birth,age_group,parent_guardian_name,parent_email,headshot_path)values($1,$2,$3,'Fixture','2010-01-01','18U','Parent','parent@fixture.invalid',$4)",[ids[i],'FIXTURE-'+i,'Child'+i,'fixture/'+i+'.png']);
 for(const file of ['20261014_tryout_payments.sql','20261021_team_fee_ledger.sql','20261021_stripe_checkout.sql','20261108_tryout_operations.sql'])await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'));
 const preserve=(await db.query('select id,athlete_first_name,date_of_birth,headshot_path from tryout_submissions order by id')).rows;
 for(const role of ['anon','authenticated']){await db.exec('set role '+role);for(const table of ['tryout_submissions','families','athletes','family_members','tryout_attendance','tryout_acceptance_notifications','tryout_stripe_receipts']){await assert.rejects(db.query('select * from '+table),/permission denied/);}await assert.rejects(db.query('select accept_tryout_athlete($1,$2,$3)',[ids[0],teamA,owner]),/permission denied/);await db.exec('reset role');}
 const request=randomUUID();const attendance=(checked,version,key=randomUUID())=>db.query('select set_tryout_attendance($1,$2,$3,$4,$5) value',[ids[0],checked,version,key,owner]);
 const arrived=await attendance(true,0,request);assert.equal(arrived.rows[0].value.checked_in,true);await attendance(true,0,request);assert.equal((await db.query('select count(*)::int n from tryout_attendance_events')).rows[0].n,1);await assert.rejects(attendance(false,0),/refresh/);await attendance(false,1);assert.equal((await db.query('select status from tryout_submissions where id=$1',[ids[0]])).rows[0].status,'REGISTERED');
 // Acceptance needs an existing matching offer; no partial profiles are created on failure.
 const accept=(reg,team)=>db.query('select accept_tryout_athlete($1,$2,$3) value',[reg,team,owner]);await assert.rejects(accept(ids[0],teamA),/offer/);
 await db.query("insert into roster_assignments(tryout_submission_id,team_id,roster_status)values($1,$3,'OFFERED'),($1,$4,'OFFERED'),($2,$4,'OFFERED')",[ids[0],ids[1],teamA,teamB]);
 const first=(await accept(ids[0],teamA)).rows[0].value;const repeated=(await accept(ids[0],teamA)).rows[0].value;assert.equal(first.athlete_id,repeated.athlete_id);assert.equal(first.family_id,family);assert.equal((await db.query('select count(*)::int n from families')).rows[0].n,1);assert.equal((await db.query('select count(*)::int n from athletes')).rows[0].n,1);
 await assert.rejects(accept(ids[0],teamB),/another team/);await accept(ids[1],teamB);assert.equal((await db.query('select count(*)::int n from athletes')).rows[0].n,2);assert.equal((await db.query('select count(*)::int n from families')).rows[0].n,1);assert.equal((await db.query('select count(*)::int n from tryout_acceptance_notifications')).rows[0].n,2);
 await attendance(true,2);await attendance(false,3);assert.equal((await db.query('select status from tryout_submissions where id=$1',[ids[0]])).rows[0].status,'ACCEPTED');
 assert.equal((await db.query('select count(*)::int n from team_fee_accounts where fee_cents=75000')).rows[0].n,2);
 await db.query('select link_tryout_parent($1,$2)',[ids[0],owner]);await db.query('select link_tryout_parent($1,$2)',[ids[0],owner]);
 assert.equal((await db.query('select count(*)::int n from family_members')).rows[0].n,1);
 assert.equal((await db.query('select role from profiles where id=$1',[owner])).rows[0].role,'OWNER');
 await assert.rejects(db.query('select link_tryout_parent($1,$2)',[ids[0],other]),/identity/);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[other]);await db.exec('set role authenticated');
 assert.equal((await db.query('select id from profiles')).rows.length,1);await assert.rejects(db.query("update profiles set role='OWNER'"),/permission denied/);await db.exec('reset role');
 const claim=await db.query('select claim_tryout_notification($1) value',[first.notification_id]);assert.equal(claim.rows[0].value.status,'SENDING');assert.equal((await db.query('select claim_tryout_notification($1) value',[first.notification_id])).rows[0].value,null);
 await db.query("update tryout_acceptance_notifications set locked_until=null,first_attempt_at=now()-interval '24 hours' where id=$1",[first.notification_id]);
 assert.equal((await db.query('select claim_tryout_notification($1) value',[first.notification_id])).rows[0].value,null);
 assert.equal((await db.query('select status from tryout_acceptance_notifications where id=$1',[first.notification_id])).rows[0].status,'REVIEW_REQUIRED');
 const session='cs_fixture',intent='pi_fixture';const credit=(refund)=>db.query('select record_tryout_stripe($1,$2,$3,null,$4)',[session,ids[0],intent,refund]);await credit(0);await credit(0);await credit(500);await credit(200);assert.equal((await db.query('select refunded_cents from tryout_stripe_receipts')).rows[0].refunded_cents,500);
 await db.query('select record_tryout_stripe($1,$2,$3,null,0)',['cs_duplicate',ids[0],'pi_duplicate']);assert.equal((await db.query("select status from tryout_stripe_receipts where session_id='cs_duplicate'")).rows[0].status,'DUPLICATE_REVIEW');
 await db.exec(fs.readFileSync('supabase/rollback/20261108_tryout_operations_security.sql','utf8'));
 assert.equal((await db.query('select count(*)::int n from athletes')).rows[0].n,2);
 assert.deepEqual((await db.query('select id,athlete_first_name,date_of_birth,headshot_path from tryout_submissions order by id')).rows,preserve);assert.equal((await db.query('select count(*)::int n from tryout_submissions')).rows[0].n,38);
 }finally{await db.close()}
});

test('shared $20 checkout matches exact link, ID, email and settled USD amount before crediting',async()=>{
 const session={id:'cs_fixture',payment_link:'plink_fixture',livemode:false,mode:'payment',currency:'usd',amount_total:2000,payment_status:'paid',client_reference_id:'FIXTURE-001',customer_details:{email:'parent@fixture.invalid'},payment_intent:'pi_fixture'};
 const calls=[];const db={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{id:'reg',parent_email:'parent@fixture.invalid'}})})})}),rpc:async(name,args)=>{calls.push(args);return{}}};
 const stripe={checkout:{sessions:{retrieve:async()=>session}},paymentLinks:{retrieve:async()=>({url:STRIPE_TRYOUT_URL})},paymentIntents:{retrieve:async()=>({status:'succeeded',currency:'usd',amount:2000,amount_received:2000})},refunds:{list:async function*(){yield{status:'succeeded',amount:100};yield{status:'pending',amount:100}}}};
 assert.equal(await syncTryoutPayment(stripe,db,session.id,false),true);assert.equal(calls[0].p_refund,100);
 for(const [field,value]of [['amount_total',75000],['currency','eur'],['livemode',true],['client_reference_id',null],['customer_details',{email:'other@fixture.invalid'}]]){const old=session[field];session[field]=value;await assert.rejects(syncTryoutPayment(stripe,db,session.id,false));session[field]=old;}
 session.payment_status='unpaid';const count=calls.length;await syncTryoutPayment(stripe,db,session.id,false);assert.equal(calls.length,count);
});
