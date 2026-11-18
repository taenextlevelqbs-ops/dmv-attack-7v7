alter table public.foundation_contributions add column if not exists donor_details jsonb not null default '{}'::jsonb;
