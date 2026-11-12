-- Private single-use direct invite links; never store plaintext invitation tokens.
create table if not exists public.direct_roster_invites (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  age_group text not null check(age_group in ('10U','12U','14U','15U','18U')),
  intended_athlete text,
  team_id uuid references public.teams(id),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  submission_id uuid unique references public.tryout_submissions(id),
  revoked_at timestamptz
);
create index if not exists direct_roster_invites_submission_idx on public.direct_roster_invites(submission_id);
alter table public.direct_roster_invites enable row level security;
revoke all on public.direct_roster_invites from anon, authenticated;
grant all on public.direct_roster_invites to service_role;

-- The redemption claim is atomic and requires a previously created submission.
create or replace function public.redeem_direct_roster_invite(
  p_hash text, p_submission_id uuid
) returns boolean language plpgsql security definer
set search_path = public as $$
declare v_count integer;
begin
  update public.direct_roster_invites
     set redeemed_at=now(), submission_id=p_submission_id
   where token_hash=p_hash and expires_at>now()
     and redeemed_at is null and revoked_at is null
     and submission_id is null;
  get diagnostics v_count = row_count;
  return v_count=1;
end
$$;
revoke all on function public.redeem_direct_roster_invite(text,uuid) from public, anon, authenticated;
grant execute on function public.redeem_direct_roster_invite(text,uuid) to service_role;
