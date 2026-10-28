-- Apply AFTER the existing 20261014 and 20261021 migrations. No history is removed.
begin;
alter table public.tryout_payments enable row level security;
revoke all on public.tryout_payments from public,anon,authenticated;
grant select,insert,update on public.tryout_payments to service_role;
alter table public.tryout_payments drop constraint if exists tryout_payments_status_check;
alter table public.tryout_payments add constraint tryout_payments_status_check
 check (status in ('UNPAID','PENDING','PAID','FAILED','REFUNDED','PARTIALLY_REFUNDED'));
alter table public.tryout_payments add column if not exists source text not null default 'MANUAL';
alter table public.tryout_payments add column if not exists currency text not null default 'usd';
alter table public.tryout_payments add column if not exists refunded_cents integer not null default 0;
alter table public.tryout_payments add column if not exists stripe_session_id text;
alter table public.tryout_payments add column if not exists stripe_payment_intent_id text;
alter table public.tryout_payments add column if not exists stripe_customer_id text;

create table if not exists public.registration_payment_orders (
 id uuid primary key default gen_random_uuid(),
 registration_id uuid not null references public.tryout_submissions(id),
 purpose text not null check(purpose in ('TRYOUT','TEAM')),
 amount_cents integer not null,
 currency text not null default 'usd' check(currency='usd'),
 access_token_hash text,
 team_account_id uuid references public.team_fee_accounts(id),
 status text not null default 'UNPAID',
 paid_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(registration_id,purpose),
 check ((purpose='TRYOUT' and amount_cents=2000 and team_account_id is null) or
        (purpose='TEAM' and amount_cents=75000 and team_account_id is not null))
);
create table if not exists public.registration_payment_attempts (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.registration_payment_orders(id),
 created_by uuid references auth.users(id),
 session_id text unique,
 checkout_url text,
 payment_intent_id text unique,
 customer_id text,
 status text not null default 'CREATING',
 paid boolean not null default false,
 refunded_cents integer not null default 0 check(refunded_cents>=0),
 paid_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists registration_payment_attempt_order_idx on public.registration_payment_attempts(order_id,created_at desc);
create table if not exists public.stripe_webhook_events (
 event_id text primary key,
 event_type text not null,
 status text not null default 'RECEIVED',
 attempts integer not null default 0,
 last_error text,
 received_at timestamptz not null default now(),
 processed_at timestamptz
);
alter table public.registration_payment_orders enable row level security;
alter table public.registration_payment_attempts enable row level security;
alter table public.stripe_webhook_events enable row level security;
revoke all on public.registration_payment_orders,public.registration_payment_attempts,public.stripe_webhook_events from public,anon,authenticated;
grant all on public.registration_payment_orders,public.registration_payment_attempts,public.stripe_webhook_events to service_role;
-- Family requests go through authenticated server routes, never through public table policies.
create or replace function public.reserve_registration_checkout(p_order_id uuid,p_user_id uuid default null)
returns public.registration_payment_attempts language plpgsql security definer set search_path=public,pg_temp as $$
declare ord public.registration_payment_orders; att public.registration_payment_attempts;
begin
 select * into ord from public.registration_payment_orders where id=p_order_id for update;
 if not found then raise exception 'Payment order missing'; end if;
 if ord.paid_at is not null then raise exception 'Already paid' using errcode='22023';end if;
 if ord.purpose='TRYOUT' and exists(select 1 from public.tryout_payments where registration_id=ord.registration_id and status='PAID') then
  raise exception 'Already paid' using errcode='22023';end if;
 if ord.purpose='TEAM' and not exists(select 1 from public.roster_assignments r join public.team_fee_accounts f on f.team_id=r.team_id and f.registration_id=r.tryout_submission_id
   join public.tryout_submissions t on t.id=r.tryout_submission_id
   where f.id=ord.team_account_id and r.roster_status in ('ACCEPTED','ACTIVE') and t.status='ACCEPTED') then
  raise exception 'Athlete not accepted' using errcode='42501';end if;
 select * into att from public.registration_payment_attempts where order_id=ord.id order by created_at desc,id desc limit 1;
 if found and att.status not in ('EXPIRED','FAILED') then return att;end if;
 insert into public.registration_payment_attempts(order_id,created_by) values(ord.id,p_user_id) returning * into att;
 if ord.purpose='TEAM' then
  if p_user_id is null then raise exception 'Authentication required';end if;
  perform public.reserve_team_fee_checkout(att.id,ord.team_account_id,ord.amount_cents,p_user_id);
 end if;
 update public.registration_payment_orders set status='PENDING',updated_at=now() where id=ord.id;
 if ord.purpose='TRYOUT' then
  insert into public.tryout_payments(registration_id,status,source) values(ord.registration_id,'PENDING','STRIPE')
  on conflict(registration_id) do update set status='PENDING',source='STRIPE',updated_at=now() where tryout_payments.status<>'PAID';
 end if;
 return att;
end;$$;

create or replace function public.sync_registration_checkout(
 p_attempt_id uuid,p_session_id text,p_intent_id text,p_customer_id text,
 p_paid boolean,p_refunded_cents integer,p_status text,p_paid_at timestamptz
) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare ord public.registration_payment_orders; att public.registration_payment_attempts; next_status text;
begin
 select o.* into ord from public.registration_payment_orders o join public.registration_payment_attempts a on a.order_id=o.id where a.id=p_attempt_id for update of o;
 if not found then raise exception 'Order missing';end if;
 select * into att from public.registration_payment_attempts where id=p_attempt_id for update;
 if att.session_id is not null and att.session_id<>p_session_id then raise exception 'Session mismatch';end if;
 if att.payment_intent_id is not null and att.payment_intent_id is distinct from p_intent_id then raise exception 'Intent mismatch';end if;
 if p_paid is null or p_refunded_cents is null or p_refunded_cents<0 or p_refunded_cents>ord.amount_cents
  or (p_refunded_cents>0 and not p_paid) or p_status not in ('OPEN','PENDING','PAID','FAILED','EXPIRED','REVIEW_REQUIRED') then raise exception 'Invalid state';end if;
 next_status:=case when greatest(att.refunded_cents,p_refunded_cents)=ord.amount_cents then 'REFUNDED'
  when greatest(att.refunded_cents,p_refunded_cents)>0 then 'PARTIALLY_REFUNDED'
  when att.paid or p_paid then 'PAID' else p_status end;
 if ord.purpose='TEAM' then
  perform public.sync_team_fee_checkout(att.id,p_session_id,p_intent_id,p_paid,p_refunded_cents,p_status);
 end if;
 update public.registration_payment_attempts set session_id=p_session_id,payment_intent_id=p_intent_id,
 customer_id=coalesce(p_customer_id,customer_id),paid=paid or p_paid,refunded_cents=greatest(refunded_cents,p_refunded_cents),
 status=next_status,paid_at=coalesce(paid_at,case when p_paid then p_paid_at end),updated_at=now() where id=att.id;
 -- A delayed failure from an older attempt cannot overwrite a newer successful payment.
 if p_paid or att.paid or ord.paid_at is null then
  update public.registration_payment_orders set status=next_status,
   paid_at=coalesce(paid_at,case when p_paid then p_paid_at end),updated_at=now() where id=ord.id;
 end if;
 if ord.purpose='TRYOUT' and (p_paid or att.paid or ord.paid_at is null) then
  insert into public.tryout_payments(registration_id,status,source,currency,refunded_cents,verified_at,stripe_session_id,stripe_payment_intent_id,stripe_customer_id)
  values(ord.registration_id,case when next_status in ('OPEN','EXPIRED') then 'PENDING' else next_status end,'STRIPE','usd',greatest(att.refunded_cents,p_refunded_cents),
   case when p_paid or att.paid then coalesce(att.paid_at,p_paid_at) end,p_session_id,p_intent_id,p_customer_id)
  on conflict(registration_id) do update set status=excluded.status,source='STRIPE',refunded_cents=excluded.refunded_cents,
   verified_at=excluded.verified_at,stripe_session_id=excluded.stripe_session_id,stripe_payment_intent_id=excluded.stripe_payment_intent_id,
   stripe_customer_id=excluded.stripe_customer_id,updated_at=now()
  where tryout_payments.source='STRIPE' or tryout_payments.status<>'PAID';
 end if;
end;$$;
revoke all on function public.reserve_registration_checkout(uuid,uuid) from public,anon,authenticated;
revoke all on function public.sync_registration_checkout(uuid,text,text,text,boolean,integer,text,timestamptz) from public,anon,authenticated;
grant execute on function public.reserve_registration_checkout(uuid,uuid) to service_role;
grant execute on function public.sync_registration_checkout(uuid,text,text,text,boolean,integer,text,timestamptz) to service_role;
-- Atomic legacy/manual update: a concurrent Stripe reservation cannot be overwritten.
create or replace function public.set_manual_tryout_payment(p_registration_id uuid,p_status text,p_note text,p_user_id uuid)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare changed integer;
begin
 if p_status not in ('UNPAID','PENDING','PAID') or p_note is null or length(p_note)>500 or p_user_id is null then raise exception 'Invalid manual update';end if;
 insert into public.tryout_payments(registration_id,status,payment_note,verified_at,verified_by,updated_at,source)
 values(p_registration_id,p_status,p_note,case when p_status='PAID' then now() end,case when p_status='PAID' then p_user_id end,now(),'MANUAL')
 on conflict(registration_id) do update set status=excluded.status,payment_note=excluded.payment_note,
  verified_at=excluded.verified_at,verified_by=excluded.verified_by,updated_at=now()
 where tryout_payments.source<>'STRIPE';
 get diagnostics changed=row_count;
 return changed=1;
end;$$;
revoke all on function public.set_manual_tryout_payment(uuid,text,text,uuid) from public,anon,authenticated;
grant execute on function public.set_manual_tryout_payment(uuid,text,text,uuid) to service_role;
commit;
