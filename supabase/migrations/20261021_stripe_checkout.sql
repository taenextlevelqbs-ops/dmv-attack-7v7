-- Run in the same DMV Attack project AFTER the team fee ledger migration.
begin;
create table if not exists public.team_fee_checkouts (
 id uuid primary key,
 account_id uuid not null references public.team_fee_accounts(id),
 amount_cents integer not null check(amount_cents between 50 and 100000000),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 session_id text unique,
 checkout_url text,
 payment_intent_id text unique,
 status text not null default 'CREATING',
 paid boolean not null default false,
 refunded_cents integer not null default 0 check(refunded_cents >= 0 and refunded_cents <= amount_cents),
 updated_at timestamptz not null default now()
);
create index if not exists team_fee_checkouts_account_idx on public.team_fee_checkouts(account_id,created_at);
alter table public.team_fee_checkouts enable row level security;
revoke all on public.team_fee_checkouts from public,anon,authenticated,service_role;
grant select on public.team_fee_checkouts to service_role;
grant update(session_id,checkout_url) on public.team_fee_checkouts to service_role;

create or replace function public.reserve_team_fee_checkout(p_id uuid,p_account_id uuid,p_amount_cents integer,p_created_by uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare account public.team_fee_accounts; existing public.team_fee_checkouts; net_paid bigint; reserved bigint;
begin
 select * into account from public.team_fee_accounts where id=p_account_id for update;
 if not found then raise exception 'Account not found';end if;
 select * into existing from public.team_fee_checkouts where id=p_id;
 if found then
  if existing.account_id<>p_account_id or existing.amount_cents<>p_amount_cents or existing.created_by<>p_created_by then
   raise exception 'Retry details changed';end if;
  return;
 end if;
 select coalesce(sum(case when kind='PAYMENT' then amount_cents else -amount_cents end),0) into net_paid
 from public.team_fee_transactions where account_id=p_account_id;
 select coalesce(sum(amount_cents),0) into reserved from public.team_fee_checkouts where account_id=p_account_id
 and not paid and status not in ('FAILED','EXPIRED') and (created_at>now()-interval '24 hours' or status='PENDING');
 if p_amount_cents>account.fee_cents-account.discount_cents-net_paid-reserved then
  raise exception 'Existing checkout links already reserve this balance. Review pending links before creating another.' using errcode='22023';
 end if;
 insert into public.team_fee_checkouts(id,account_id,amount_cents,created_by) values(p_id,p_account_id,p_amount_cents,p_created_by);
end;$$;
revoke all on function public.reserve_team_fee_checkout(uuid,uuid,integer,uuid) from public,anon,authenticated;
grant execute on function public.reserve_team_fee_checkout(uuid,uuid,integer,uuid) to service_role;

-- Only a verified webhook may call this service-only operation. Payment and
-- cumulative refunds are appended atomically; duplicate/out-of-order events
-- never create duplicate ledger entries or decrease the refund total.
create or replace function public.sync_team_fee_checkout(
 p_id uuid,p_session_id text,p_intent_id text,p_paid boolean,
 p_refunded_cents integer,p_status text
) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare link public.team_fee_checkouts; account_uuid uuid;
begin
 select account_id into account_uuid from public.team_fee_checkouts where id=p_id;
 if not found then raise exception 'Checkout not found';end if;
 perform 1 from public.team_fee_accounts where id=account_uuid for update;
 select * into link from public.team_fee_checkouts where id=p_id for update;
 if link.session_id is not null and link.session_id<>p_session_id then raise exception 'Session mismatch';end if;
 if link.payment_intent_id is not null and link.payment_intent_id is distinct from p_intent_id then raise exception 'Payment mismatch';end if;
 if p_status not in ('OPEN','PENDING','PAID','FAILED','EXPIRED','REFUNDED','PARTIALLY_REFUNDED','REVIEW_REQUIRED')
    or p_paid is null or p_refunded_cents is null or p_refunded_cents<0 or p_refunded_cents>link.amount_cents
    or (p_refunded_cents>0 and not p_paid) then raise exception 'Invalid checkout state';end if;
 if p_paid and not link.paid then
  insert into public.team_fee_transactions(account_id,request_id,kind,amount_cents,method,reference,note,paid_on,recorded_by)
  values(link.account_id,link.id,'PAYMENT',link.amount_cents,'OTHER','stripe:'||p_session_id,
   'Stripe confirmed payment. Processing fees do not reduce the family payment credit.',
   (now() at time zone 'America/New_York')::date,link.created_by);
 end if;
 if p_refunded_cents>link.refunded_cents then
  insert into public.team_fee_transactions(account_id,request_id,kind,amount_cents,method,reference,note,paid_on,recorded_by)
  values(link.account_id,gen_random_uuid(),'REFUND',p_refunded_cents-link.refunded_cents,'OTHER',
   'stripe-refund:'||p_session_id||':'||p_refunded_cents,'Stripe confirmed refund.',
   (now() at time zone 'America/New_York')::date,link.created_by);
 end if;
 update public.team_fee_checkouts set session_id=p_session_id,payment_intent_id=p_intent_id,
  paid=paid or p_paid,refunded_cents=greatest(refunded_cents,p_refunded_cents),
  status=case when p_status='REVIEW_REQUIRED' then 'REVIEW_REQUIRED'
   when greatest(refunded_cents,p_refunded_cents)=amount_cents then 'REFUNDED'
   when greatest(refunded_cents,p_refunded_cents)>0 then 'PARTIALLY_REFUNDED'
   when paid or p_paid then 'PAID' else p_status end,updated_at=now()
 where id=p_id;
end;$$;
revoke all on function public.sync_team_fee_checkout(uuid,text,text,boolean,integer,text) from public,anon,authenticated;
grant execute on function public.sync_team_fee_checkout(uuid,text,text,boolean,integer,text) to service_role;
commit;
