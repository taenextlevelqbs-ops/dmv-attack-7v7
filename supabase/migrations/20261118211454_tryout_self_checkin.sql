-- Preregistered 15U/18U self check-in. Browser clients never receive write access.
alter table public.tryout_attendance add column if not exists self_checked_in_at timestamptz;
create table if not exists public.tryout_self_checkin_limits (
  attempt_key text primary key check (length(attempt_key)=64),
  window_started_at timestamptz not null,
  attempts integer not null check (attempts>0)
);
alter table public.tryout_self_checkin_limits enable row level security;
revoke all on public.tryout_self_checkin_limits from public, anon, authenticated;
grant select,insert,update,delete on public.tryout_self_checkin_limits to service_role;
create or replace function public.self_checkin_high_school_tryout(
  p_tryout_id text, p_parent_email text, p_date_of_birth date, p_attempt_key text
) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  r public.tryout_submissions;
  a public.tryout_attendance;
  v_attempts integer;
begin
  if v_now < '2026-11-22T14:30:00-05:00'::timestamptz or v_now >= '2026-11-22T16:30:00-05:00'::timestamptz then
    return jsonb_build_object('code','closed');
  end if;
  if p_attempt_key is null or p_attempt_key !~ '^[a-f0-9]{64}$' then
    return jsonb_build_object('code','invalid');
  end if;
  insert into public.tryout_self_checkin_limits(attempt_key,window_started_at,attempts)
    values(p_attempt_key,v_now,1)
    on conflict(attempt_key) do update
      set attempts=case when tryout_self_checkin_limits.window_started_at<=v_now-interval '5 minutes' then 1 else tryout_self_checkin_limits.attempts+1 end,
          window_started_at=case when tryout_self_checkin_limits.window_started_at<=v_now-interval '5 minutes' then v_now else tryout_self_checkin_limits.window_started_at end
    returning attempts into v_attempts;
  if v_attempts>20 then return jsonb_build_object('code','rate_limited'); end if;
  select * into r from public.tryout_submissions
    where upper(btrim(tryout_id))=upper(btrim(p_tryout_id))
      and lower(btrim(parent_email))=lower(btrim(p_parent_email))
      and date_of_birth::date=p_date_of_birth
      and age_group in ('15U','18U')
      and submitted_at<'2026-11-22T15:00:00-05:00'::timestamptz
    for update;
  if not found then return jsonb_build_object('code','not_found'); end if;
  insert into public.tryout_attendance(registration_id,checked_in)
    values(r.id,r.status::text='CHECKED_IN') on conflict do nothing;
  select * into a from public.tryout_attendance where registration_id=r.id for update;
  if a.checked_in then return jsonb_build_object('code','already_checked_in','tryout_id',r.tryout_id); end if;
  update public.tryout_attendance
    set checked_in=true,version=version+1,updated_at=v_now,updated_by=null,self_checked_in_at=v_now
    where registration_id=r.id;
  -- Attendance must never overwrite offers, acceptances, callback or other decisions.
  update public.tryout_submissions set status='CHECKED_IN',updated_at=v_now
    where id=r.id and status::text='REGISTERED';
  return jsonb_build_object('code','checked_in','tryout_id',r.tryout_id);
end;
$$;
revoke all on function public.self_checkin_high_school_tryout(text,text,date,text) from public,anon,authenticated;
grant execute on function public.self_checkin_high_school_tryout(text,text,date,text) to service_role;
