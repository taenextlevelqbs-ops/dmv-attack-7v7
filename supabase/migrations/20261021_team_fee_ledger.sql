-- Additive, owner-only ledger. No existing registration/payment records are altered.
begin;
create table if not exists public.team_fee_settings (
 id text primary key check(id='default'),
 default_fee_cents integer not null check(default_fee_cents between 0 and 100000000),
 updated_by uuid not null references auth.users(id),
 updated_at timestamptz not null default now()
);
alter table public.team_fee_settings enable row level security;
revoke all on public.team_fee_settings from public,anon,authenticated,service_role;
grant select,insert,update on public.team_fee_settings to service_role;

create table if not exists public.team_fee_accounts (
 id uuid primary key default gen_random_uuid(),
 registration_id uuid not null references public.tryout_submissions(id),
 team_id uuid not null references public.teams(id),
 season text not null check (season ~ '^20[0-9]{2}$'),
 fee_cents integer not null check (fee_cents between 0 and 100000000),
 discount_cents integer not null default 0 check (discount_cents >= 0 and discount_cents <= fee_cents),
 discount_note text not null default '' check (length(discount_note) <= 500),
 due_date date,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 unique(registration_id,team_id,season),
 check (discount_cents=0 or length(trim(discount_note))>0)
);
create table if not exists public.team_fee_transactions (
 id uuid primary key default gen_random_uuid(),
 account_id uuid not null references public.team_fee_accounts(id),
 request_id uuid not null unique,
 kind text not null check (kind in ('PAYMENT','REFUND')),
 amount_cents integer not null check (amount_cents between 1 and 100000000),
 method text not null check (method in ('VENMO','CASH','CHECK','BANK','OTHER')),
 reference text not null check (length(trim(reference)) between 1 and 200),
 note text not null default '' check (length(note)<=500),
 paid_on date not null,
 recorded_by uuid not null references auth.users(id),
 recorded_at timestamptz not null default now(),
 unique(account_id,kind,method,reference)
);
create index if not exists team_fee_transactions_account_idx on public.team_fee_transactions(account_id,recorded_at);
alter table public.team_fee_accounts enable row level security;
alter table public.team_fee_transactions enable row level security;
revoke all on public.team_fee_accounts, public.team_fee_transactions from public, anon, authenticated, service_role;
-- No browser role can read financial rows, including via direct Supabase calls.
grant select,insert on public.team_fee_accounts to service_role;
grant select on public.team_fee_transactions to service_role;

create or replace function public.record_team_fee_transaction(
 p_account_id uuid, p_request_id uuid, p_kind text, p_amount_cents integer,
 p_method text, p_reference text, p_note text, p_paid_on date, p_recorded_by uuid
) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare prior public.team_fee_transactions; net_paid bigint; result_id uuid;
begin
 -- Serializes concurrent payments/refunds for one account. Retries never double-charge.
 perform 1 from public.team_fee_accounts where id=p_account_id for update;
 if not found then raise exception 'Account not found' using errcode='P0002'; end if;
 select * into prior from public.team_fee_transactions where request_id=p_request_id;
 if found then
  if prior.account_id<>p_account_id or prior.kind<>p_kind or prior.amount_cents<>p_amount_cents
     or prior.method<>p_method or prior.reference<>trim(p_reference) or prior.note<>coalesce(p_note,'')
     or prior.paid_on<>p_paid_on or prior.recorded_by<>p_recorded_by then
   raise exception 'Request reference already used with different details' using errcode='22023';
  end if;
  return prior.id;
 end if;
 if p_paid_on>(now() at time zone 'America/New_York')::date then raise exception 'Payment date cannot be in the future' using errcode='22023'; end if;
 select coalesce(sum(case when kind='PAYMENT' then amount_cents else -amount_cents end),0)
 into net_paid from public.team_fee_transactions where account_id=p_account_id;
 if p_kind='REFUND' and p_amount_cents>net_paid then
  raise exception 'Refund exceeds recorded payments' using errcode='22023';
 end if;
 insert into public.team_fee_transactions(account_id,request_id,kind,amount_cents,method,reference,note,paid_on,recorded_by)
 values(p_account_id,p_request_id,p_kind,p_amount_cents,p_method,trim(p_reference),coalesce(p_note,''),p_paid_on,p_recorded_by)
 returning id into result_id;
 return result_id;
end;$$;
revoke all on function public.record_team_fee_transaction(uuid,uuid,text,integer,text,text,text,date,uuid) from public,anon,authenticated;
grant execute on function public.record_team_fee_transaction(uuid,uuid,text,integer,text,text,text,date,uuid) to service_role;
create table if not exists public.team_fee_adjustments (
 id uuid primary key default gen_random_uuid(),
 account_id uuid not null references public.team_fee_accounts(id),
 request_id uuid not null unique,
 before_values jsonb not null,
 after_values jsonb not null,
 reason text not null check(length(trim(reason)) between 1 and 500),
 recorded_by uuid not null references auth.users(id),
 recorded_at timestamptz not null default now()
);
alter table public.team_fee_adjustments enable row level security;
revoke all on public.team_fee_adjustments from public,anon,authenticated,service_role;
grant select on public.team_fee_adjustments to service_role;
create or replace function public.adjust_team_fee_account(p_account_id uuid,p_request_id uuid,p_fee_cents integer,p_discount_cents integer,p_discount_note text,p_due_date date,p_reason text,p_recorded_by uuid)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare original public.team_fee_accounts; previous public.team_fee_adjustments; changed public.team_fee_accounts; result_id uuid;
begin
 select * into original from public.team_fee_accounts where id=p_account_id for update;
 if not found then raise exception 'Account not found' using errcode='P0002';end if;
 select * into previous from public.team_fee_adjustments where request_id=p_request_id;
 if found then
  if previous.account_id<>p_account_id or previous.recorded_by<>p_recorded_by or previous.reason<>trim(p_reason)
    or previous.after_values->>'fee_cents'<>p_fee_cents::text or previous.after_values->>'discount_cents'<>p_discount_cents::text
    or previous.after_values->>'discount_note'<>trim(p_discount_note)
    or (previous.after_values->>'due_date') is distinct from p_due_date::text then
   raise exception 'Retry details changed' using errcode='22023';
  end if;
  return previous.id;
 end if;
 update public.team_fee_accounts set fee_cents=p_fee_cents,discount_cents=p_discount_cents,discount_note=trim(p_discount_note),due_date=p_due_date
 where id=p_account_id returning * into changed;
 insert into public.team_fee_adjustments(account_id,request_id,before_values,after_values,reason,recorded_by)
 values(p_account_id,p_request_id,to_jsonb(original),to_jsonb(changed),trim(p_reason),p_recorded_by) returning id into result_id;
 return result_id;
end;$$;
revoke all on function public.adjust_team_fee_account(uuid,uuid,integer,integer,text,date,text,uuid) from public,anon,authenticated;
grant execute on function public.adjust_team_fee_account(uuid,uuid,integer,integer,text,date,text,uuid) to service_role;
commit;
