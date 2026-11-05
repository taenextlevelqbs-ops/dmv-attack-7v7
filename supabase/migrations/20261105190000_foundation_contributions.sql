-- Foundation sponsorship and community contribution payment ledger
create table if not exists public.foundation_contributions (
 id uuid primary key default gen_random_uuid(),
 kind text not null check (kind in ('SPONSORSHIP','CONTRIBUTION')),
 tier text check (tier in ('BRONZE','SILVER','GOLD')),
 business_name text,
 contact_name text not null,
 email text not null,
 website text,
 amount_cents integer not null check (amount_cents >= 500 and amount_cents <= 1000000),
 status text not null default 'PENDING' check (status in ('PENDING','OPEN','PAID','FAILED','EXPIRED','REFUNDED','PARTIALLY_REFUNDED','REVIEW_REQUIRED')),
 stripe_session_id text unique,
 stripe_payment_intent_id text,
 refunded_cents integer not null default 0 check (refunded_cents >= 0),
 logo_path text,
 logo_approved boolean not null default false,
 sponsor_approved boolean not null default false,
 published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint foundation_kind_fields check ((kind='SPONSORSHIP' and tier is not null and business_name is not null) or (kind='CONTRIBUTION' and tier is null)),
 constraint foundation_tier_amount check (kind='CONTRIBUTION' or (tier='BRONZE' and amount_cents=25000) or (tier='SILVER' and amount_cents=50000) or (tier='GOLD' and amount_cents=100000))
);
create index if not exists foundation_contributions_status_idx on public.foundation_contributions (status, created_at desc);
alter table public.foundation_contributions enable row level security;
revoke all on table public.foundation_contributions from anon, authenticated;
grant all on table public.foundation_contributions to service_role;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('foundation-logos','foundation-logos',false,2097152,array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

update storage.buckets set public=false where id='foundation-logos';
