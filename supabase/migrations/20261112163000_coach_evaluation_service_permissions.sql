-- Restricted server-side evaluation API requires explicit privileges.
-- Keep row-level security enabled and do not grant direct client access.
alter table public.coach_tryout_evaluations enable row level security;
revoke all on table public.coach_tryout_evaluations from anon, authenticated;
grant select, insert, update on table public.coach_tryout_evaluations to service_role;
