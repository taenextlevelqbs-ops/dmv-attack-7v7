create table public.tryout_film_submissions (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references public.tryout_submissions(id) on delete cascade,
  athlete_name text not null,
  parent_email text not null,
  age_group text not null check (age_group in ('10U', '12U', '14U', '15U', '18U')),
  school text,
  primary_position text,
  secondary_position text,
  film_url text not null,
  submitted_at timestamptz not null default now(),
  submission_key text not null unique
);
alter table public.tryout_film_submissions enable row level security;
revoke all on public.tryout_film_submissions from public, anon, authenticated;
grant select, insert on public.tryout_film_submissions to service_role;
create index tryout_film_submissions_submitted_at_idx on public.tryout_film_submissions (submitted_at desc);
