create table public.tryout_draft_guests (
 id uuid primary key default gen_random_uuid(),
 team text not null check (team in ('18u-a','18u-b','15u-a','15u-b','14u','12u')),
 name text not null check (name = btrim(name) and char_length(name) between 1 and 100)
);
create unique index tryout_draft_guests_team_name on public.tryout_draft_guests(team, lower(name));
alter table public.tryout_draft_guests enable row level security;
revoke all on public.tryout_draft_guests from public, anon, authenticated;
grant select, insert, delete on public.tryout_draft_guests to service_role;