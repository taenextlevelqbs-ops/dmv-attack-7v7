create table public.tryout_draft_placements (
 registration_id uuid not null references public.tryout_submissions(id) on delete cascade,
 division text not null,
 team text not null,
 primary key (registration_id, division),
 check ((division = '18U' and team in ('18u-a','18u-b')) or (division = '15U' and team in ('15u-a','15u-b')) or (division = '14U' and team = '14u') or (division = '12U' and team = '12u'))
);
alter table public.tryout_draft_placements enable row level security;
revoke all on public.tryout_draft_placements from public, anon, authenticated;
grant select, insert, update, delete on public.tryout_draft_placements to service_role;