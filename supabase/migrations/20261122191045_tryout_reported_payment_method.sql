alter table public.tryout_attendance add column if not exists reported_payment_method text check (reported_payment_method in ('stripe','venmo','not_paid','unsure'));
create or replace function public.self_checkin_with_payment(p_tryout_id text,p_parent_email text,p_date_of_birth date,p_attempt_key text,p_payment_method text) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare result jsonb;
begin
  if p_payment_method is null or p_payment_method not in ('stripe','venmo','not_paid','unsure') then
    return jsonb_build_object('code','invalid');
  end if;
  result := public.self_checkin_high_school_tryout(p_tryout_id,p_parent_email,p_date_of_birth,p_attempt_key);
  if result->>'code' in ('checked_in','already_checked_in') then
    update public.tryout_attendance a set reported_payment_method=p_payment_method
    from public.tryout_submissions t
    where t.id=a.registration_id and t.tryout_id=result->>'tryout_id' and a.checked_in
      and (a.reported_payment_method is null or result->>'code'='checked_in');
  end if;
  return result;
end;
$$;
revoke all on function public.self_checkin_with_payment(text,text,date,text,text) from public,anon,authenticated;
grant execute on function public.self_checkin_with_payment(text,text,date,text,text) to service_role;