create table if not exists public.family_update_campaigns (
 id uuid primary key default gen_random_uuid(),
 age_group text not null check (age_group in ('10U','12U','14U','15U','18U')),
 team_id uuid references public.teams(id),
 subject text not null,
 message text not null,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 recipient_count integer not null default 0,
 sent_count integer not null default 0,
 failed_count integer not null default 0
);
create table if not exists public.family_update_deliveries (
 id uuid primary key default gen_random_uuid(),
 campaign_id uuid not null references public.family_update_campaigns(id) on delete cascade,
 parent_email text not null,
 state text not null default 'pending' check(state in ('pending','sent','failed')),
 provider_message_id text,
 error_message text,
 sent_at timestamptz,
 unique(campaign_id,parent_email)
);
create index if not exists family_update_campaigns_created_idx on public.family_update_campaigns(created_at desc);
create index if not exists family_update_deliveries_campaign_idx on public.family_update_deliveries(campaign_id);
alter table public.family_update_campaigns enable row level security;
alter table public.family_update_deliveries enable row level security;
revoke all on public.family_update_campaigns,public.family_update_deliveries from anon,authenticated;
grant all on public.family_update_campaigns,public.family_update_deliveries to service_role;
