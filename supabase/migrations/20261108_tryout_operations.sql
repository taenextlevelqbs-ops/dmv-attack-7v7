-- Additive operations upgrade. Does not delete/backfill registrations or headshots.
begin;
create table if not exists public.tryout_attendance (
 registration_id uuid primary key references public.tryout_submissions(id),
 checked_in boolean not null default false, version integer not null default 0,
 updated_by uuid references auth.users(id),updated_at timestamptz not null default now()
);
create table if not exists public.tryout_attendance_events (
 request_id uuid primary key,registration_id uuid not null references public.tryout_submissions(id),
 checked_in boolean not null,recorded_by uuid not null references auth.users(id),created_at timestamptz not null default now()
);
create table if not exists public.tryout_acceptance_notifications (
 id uuid primary key default gen_random_uuid(),assignment_id uuid not null unique references public.roster_assignments(id),
 registration_id uuid not null references public.tryout_submissions(id),status text not null default 'PENDING',
 attempts integer not null default 0,first_attempt_at timestamptz,last_attempt_at timestamptz,payload_hash text,locked_until timestamptz,provider_id text,last_error text,
 created_at timestamptz not null default now(),sent_at timestamptz
);
create table if not exists public.tryout_stripe_receipts (
 session_id text primary key,registration_id uuid not null references public.tryout_submissions(id),payment_intent_id text not null unique,
 customer_id text,amount_cents integer not null check(amount_cents=2000),currency text not null check(currency='usd'),
 credited boolean not null default false,refunded_cents integer not null default 0 check(refunded_cents between 0 and 2000),
 status text not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create unique index if not exists tryout_one_stripe_credit on public.tryout_stripe_receipts(registration_id) where credited;
create table if not exists public.tryout_webhook_audit (
 event_id text primary key,event_type text not null,status text not null,last_error text,updated_at timestamptz not null default now()
);
alter table public.tryout_attendance enable row level security;
alter table public.tryout_attendance_events enable row level security;
alter table public.tryout_acceptance_notifications enable row level security;
alter table public.tryout_stripe_receipts enable row level security;
alter table public.tryout_webhook_audit enable row level security;
revoke all on public.tryout_attendance,public.tryout_attendance_events,public.tryout_acceptance_notifications,public.tryout_stripe_receipts,public.tryout_webhook_audit from public,anon,authenticated;
grant all on public.tryout_attendance,public.tryout_attendance_events,public.tryout_acceptance_notifications,public.tryout_stripe_receipts,public.tryout_webhook_audit to service_role;

create or replace function public.set_tryout_attendance(p_registration_id uuid,p_checked_in boolean,p_version integer,p_request_id uuid,p_staff_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.tryout_submissions;a public.tryout_attendance;e public.tryout_attendance_events;
begin
 select * into r from public.tryout_submissions where id=p_registration_id for update;
 if not found then raise exception 'Registration missing';end if;
 select * into e from public.tryout_attendance_events where request_id=p_request_id;
 if found then
  if e.registration_id<>p_registration_id or e.checked_in<>p_checked_in or e.recorded_by<>p_staff_id then raise exception 'Retry details changed';end if;
  return (select to_jsonb(t) from public.tryout_attendance t where registration_id=p_registration_id);
 end if;
 insert into public.tryout_attendance(registration_id,checked_in) values(r.id,r.status::text='CHECKED_IN') on conflict do nothing;
 select * into a from public.tryout_attendance where registration_id=r.id for update;
 if a.version<>p_version then raise exception 'Attendance changed; refresh' using errcode='40001';end if;
 update public.tryout_attendance set checked_in=p_checked_in,version=version+1,updated_by=p_staff_id,updated_at=now() where registration_id=r.id returning * into a;
 insert into public.tryout_attendance_events(request_id,registration_id,checked_in,recorded_by) values(p_request_id,r.id,p_checked_in,p_staff_id);
 -- Keep the old UI compatible, without ever replacing an evaluation/offer/acceptance decision.
 if r.status::text in ('REGISTERED','CHECKED_IN') then
  if p_checked_in then update public.tryout_submissions set status='CHECKED_IN',updated_at=now() where id=r.id;
  else update public.tryout_submissions set status='REGISTERED',updated_at=now() where id=r.id;end if;
 end if;
 return to_jsonb(a);
end;$$;

create or replace function public.accept_tryout_athlete(p_registration_id uuid,p_team_id uuid,p_staff_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.tryout_submissions;t public.teams;a public.roster_assignments;family_uuid uuid;athlete_uuid uuid;matches integer;email text;notice uuid;
begin
 select * into r from public.tryout_submissions where id=p_registration_id for update;
 if not found then raise exception 'Registration missing';end if;
 select * into t from public.teams where id=p_team_id and active;
 if not found or t.age_group<>r.age_group then raise exception 'Team division mismatch';end if;
 select * into a from public.roster_assignments where tryout_submission_id=r.id and team_id=t.id for update;
 if not found or a.roster_status not in ('OFFERED','ACCEPTED','ACTIVE') then raise exception 'An active offer is required';end if;
 if exists(select 1 from public.roster_assignments x join public.teams y on y.id=x.team_id where x.tryout_submission_id=r.id and x.team_id<>t.id and y.season=t.season and x.roster_status in ('ACCEPTED','ACTIVE')) then
  raise exception 'Already accepted another team this season';end if;
 email:=lower(btrim(r.parent_email));if email='' then raise exception 'Parent email required';end if;
 -- Serialize siblings and concurrent acceptances sharing a parent, without deleting/merging historical rows.
 perform pg_advisory_xact_lock(hashtextextended(email,0));
 family_uuid:=r.linked_family_id;
 if family_uuid is null then
  select count(*),(array_agg(id))[1] into matches,family_uuid from public.families where lower(btrim(primary_email))=email;
  if matches>1 then raise exception 'Multiple matching families; staff review required';end if;
  if matches=0 then insert into public.families(family_name,primary_email,primary_phone) values(coalesce(nullif(btrim(r.parent_guardian_name),''),r.athlete_last_name)||' Family',email,r.parent_phone) returning id into family_uuid;end if;
 else perform 1 from public.families where id=family_uuid and lower(btrim(primary_email))=email;if not found then raise exception 'Linked family identity needs staff review';end if;end if;
 athlete_uuid:=r.linked_athlete_id;
 if athlete_uuid is not null then
  perform 1 from public.athletes where id=athlete_uuid and family_id=family_uuid and lower(btrim(first_name))=lower(btrim(r.athlete_first_name)) and lower(btrim(last_name))=lower(btrim(r.athlete_last_name)) and date_of_birth is not distinct from r.date_of_birth;
  if not found then raise exception 'Linked athlete family mismatch';end if;
 else
  select count(*),(array_agg(id))[1] into matches,athlete_uuid from public.athletes where family_id=family_uuid and lower(btrim(first_name))=lower(btrim(r.athlete_first_name)) and lower(btrim(last_name))=lower(btrim(r.athlete_last_name)) and date_of_birth=r.date_of_birth;
  if matches>1 then raise exception 'Multiple matching athletes; staff review required';end if;
  if matches=0 then
   insert into public.athletes(family_id,first_name,last_name,date_of_birth,graduation_year,school,age_group,primary_position,secondary_positions,height,weight,emergency_contact_name,emergency_contact_phone,medical_notes,highlight_url,headshot_path)
   values(family_uuid,r.athlete_first_name,r.athlete_last_name,r.date_of_birth,r.graduation_year,r.school,r.age_group,r.primary_position,
    case when nullif(r.secondary_position,'') is null then null else array[r.secondary_position] end,r.height,
    case when r.weight ~ '^[0-9]+(\.[0-9]+)?$' then r.weight::numeric else null end,
    r.emergency_contact_name,r.emergency_contact_phone,r.medical_information,r.highlight_url,r.headshot_path) returning id into athlete_uuid;
  end if;
 end if;
 update public.tryout_submissions set linked_family_id=family_uuid,linked_athlete_id=athlete_uuid,status='ACCEPTED',updated_at=now() where id=r.id;
 update public.roster_assignments set roster_status=case when roster_status='ACTIVE' then 'ACTIVE' else 'ACCEPTED' end,accepted_at=coalesce(accepted_at,now()),updated_at=now() where id=a.id;
 insert into public.team_fee_accounts(registration_id,team_id,season,fee_cents,created_by) values(r.id,t.id,t.season::text,75000,p_staff_id) on conflict(registration_id,team_id,season) do nothing;
 insert into public.tryout_acceptance_notifications(assignment_id,registration_id) values(a.id,r.id) on conflict(assignment_id) do nothing;
 select id into notice from public.tryout_acceptance_notifications where assignment_id=a.id;
 return jsonb_build_object('athlete_id',athlete_uuid,'family_id',family_uuid,'notification_id',notice,'team_id',t.id,'team_name',t.name,'parent_email',email);
end;$$;

create or replace function public.link_tryout_parent(p_registration_id uuid,p_user_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.tryout_submissions;email text;
begin
 select * into r from public.tryout_submissions where id=p_registration_id for update;
 select lower(btrim(u.email)) into email from auth.users u where u.id=p_user_id;
 if r.status::text<>'ACCEPTED' or r.linked_family_id is null or email is null or email<>lower(btrim(r.parent_email)) then raise exception 'Parent identity does not match acceptance';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,1));
 if exists(select 1 from public.family_members where profile_id=p_user_id and family_id<>r.linked_family_id) then raise exception 'Parent already linked to another family';end if;
 insert into public.profiles(id,first_name,role) values(p_user_id,r.parent_guardian_name,'PARENT') on conflict(id) do nothing;
 if not exists(select 1 from public.family_members where profile_id=p_user_id and family_id=r.linked_family_id) then
 insert into public.family_members(family_id,profile_id,relationship,is_primary) values(r.linked_family_id,p_user_id,'Parent/Guardian',true);end if;
end;$$;

create or replace function public.record_tryout_stripe(p_session text,p_registration uuid,p_intent text,p_customer text,p_refund integer)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare receipt public.tryout_stripe_receipts;credited_elsewhere boolean;refund integer;
begin
 perform 1 from public.tryout_submissions where id=p_registration for update;
 if not found or p_refund<0 or p_refund>2000 then raise exception 'Invalid receipt';end if;
 select * into receipt from public.tryout_stripe_receipts where session_id=p_session for update;
 if found and (receipt.registration_id<>p_registration or receipt.payment_intent_id<>p_intent) then raise exception 'Receipt identity mismatch';end if;
 refund:=greatest(coalesce(receipt.refunded_cents,0),p_refund);
 select exists(select 1 from public.tryout_stripe_receipts where registration_id=p_registration and credited and session_id<>p_session) into credited_elsewhere;
 insert into public.tryout_stripe_receipts(session_id,registration_id,payment_intent_id,customer_id,amount_cents,currency,credited,refunded_cents,status)
 values(p_session,p_registration,p_intent,p_customer,2000,'usd',not credited_elsewhere,refund,case when credited_elsewhere then 'DUPLICATE_REVIEW' when refund=2000 then 'REFUNDED' when refund>0 then 'PARTIALLY_REFUNDED' else 'PAID' end)
 on conflict(session_id) do update set refunded_cents=excluded.refunded_cents,status=excluded.status,updated_at=now();
 if not credited_elsewhere then
 insert into public.tryout_payments(registration_id,status,amount_cents,payment_note,verified_at,updated_at)
 values(p_registration,case when refund=2000 then 'UNPAID' when refund>0 then 'PENDING' else 'PAID' end,2000,'Stripe: '||p_session||case when refund>0 then '; refunded cents: '||refund else '' end,case when refund=0 then now() end,now())
 on conflict(registration_id) do update set status=excluded.status,payment_note=excluded.payment_note,verified_at=excluded.verified_at,updated_at=now()
 where tryout_payments.status<>'PAID' or tryout_payments.payment_note like 'Stripe: %';end if;
end;$$;

revoke all on function public.set_tryout_attendance(uuid,boolean,integer,uuid,uuid),public.accept_tryout_athlete(uuid,uuid,uuid),public.link_tryout_parent(uuid,uuid),public.record_tryout_stripe(text,uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.set_tryout_attendance(uuid,boolean,integer,uuid,uuid),public.accept_tryout_athlete(uuid,uuid,uuid),public.link_tryout_parent(uuid,uuid),public.record_tryout_stripe(text,uuid,text,text,integer) to service_role;

create or replace function public.claim_tryout_notification(p_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare n public.tryout_acceptance_notifications;
begin
 select * into n from public.tryout_acceptance_notifications where id=p_id for update;
 if not found or n.status in ('SENT','REVIEW_REQUIRED') or n.locked_until>now() then return null;end if;
 if n.attempts>0 and coalesce(n.first_attempt_at,n.last_attempt_at)<now()-interval '23 hours' then update public.tryout_acceptance_notifications set status='REVIEW_REQUIRED',last_error='Delivery state needs provider reconciliation before resending' where id=n.id;return null;end if;
 update public.tryout_acceptance_notifications set status='SENDING',attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()),last_attempt_at=now(),locked_until=now()+interval '5 minutes' where id=n.id returning * into n;
 return to_jsonb(n);
end;$$;
revoke all on function public.claim_tryout_notification(uuid) from public,anon,authenticated;
grant execute on function public.claim_tryout_notification(uuid) to service_role;

-- Capture exact grants/RLS state before tightening browser access, for rollback.
create table if not exists public.tryout_ops_security_baseline(table_name text primary key,rls_enabled boolean not null,grants jsonb not null);
alter table public.tryout_ops_security_baseline enable row level security;
revoke all on public.tryout_ops_security_baseline from public,anon,authenticated;
grant select on public.tryout_ops_security_baseline to service_role;
do $$declare tbl text;begin
 foreach tbl in array array['tryout_submissions','tryout_payments','families','athletes','family_members','roster_assignments','profiles'] loop
 insert into public.tryout_ops_security_baseline select tbl,c.relrowsecurity,coalesce((select jsonb_agg(jsonb_build_object('role',g.grantee,'privilege',g.privilege_type,'grantable',g.is_grantable)) from information_schema.role_table_grants g where g.table_schema='public' and g.table_name=tbl and g.grantee in ('anon','authenticated','service_role','PUBLIC')),'[]'::jsonb) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname=tbl on conflict do nothing;
 execute format('alter table public.%I enable row level security',tbl);
 execute format('revoke all on public.%I from public,anon,authenticated',tbl);
 execute format('grant select,insert,update,delete on public.%I to service_role',tbl);
 if tbl<>'profiles' and not exists(select 1 from pg_policies where schemaname='public' and tablename=tbl and policyname='tryout_ops_browser_deny') then
 execute format('create policy tryout_ops_browser_deny on public.%I as restrictive for all to anon,authenticated using(false) with check(false)',tbl);end if;
 end loop;
end;$$;
grant select on public.profiles to authenticated;
do $$begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='tryout_ops_own_profile_allow') then create policy tryout_ops_own_profile_allow on public.profiles for select to authenticated using(id=auth.uid());end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='tryout_ops_own_profile_restrict') then create policy tryout_ops_own_profile_restrict on public.profiles as restrictive for select to authenticated using(id=auth.uid());end if;
end;$$;
commit;
