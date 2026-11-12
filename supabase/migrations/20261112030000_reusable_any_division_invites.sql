-- Reusable, staff-issued invitations let families choose any DMV Attack division.
alter table public.direct_roster_invites alter column age_group drop not null;
alter table public.direct_roster_invites add column if not exists max_uses integer not null default 1 check (max_uses between 1 and 250);
alter table public.direct_roster_invites add column if not exists use_count integer not null default 0 check (use_count >= 0);
-- Preserve already redeemed single-use links from the earlier schema.
update public.direct_roster_invites set use_count=1 where redeemed_at is not null and use_count=0;
create table if not exists public.direct_roster_invite_uses (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.direct_roster_invites(id) on delete cascade,
  submission_id uuid not null unique references public.tryout_submissions(id),
  created_at timestamptz not null default now(),
  unique(invite_id, submission_id)
);
create index if not exists direct_roster_invite_uses_invite_idx on public.direct_roster_invite_uses(invite_id);
alter table public.direct_roster_invite_uses enable row level security;
revoke all on public.direct_roster_invite_uses from anon, authenticated;
grant all on public.direct_roster_invite_uses to service_role;

-- Atomic single-use or reusable registration redemption; service role only.
create or replace function public.redeem_direct_roster_invite(
  p_hash text, p_submission_id uuid
) returns boolean language plpgsql security definer
set search_path = public as $$
declare v_id uuid; v_max integer; v_used integer; v_group text; 
begin
  select id,max_uses,use_count,age_group into v_id,v_max,v_used,v_group
  from public.direct_roster_invites
  where token_hash=p_hash and expires_at>now() and revoked_at is null and (max_uses > 1 or redeemed_at is null)
  for update;
  if v_id is null or v_used >= v_max then return false; end if;
  if v_group is not null and v_used <> 0 then return false; end if;
  if not exists(select 1 from public.tryout_submissions s where s.id=p_submission_id
    and (v_group is null or s.age_group=v_group)) then return false; end if;
  insert into public.direct_roster_invite_uses(invite_id,submission_id)
    values(v_id,p_submission_id);
  update public.direct_roster_invites set use_count=use_count+1,
    redeemed_at=case when max_uses=1 then now() else redeemed_at end,
    submission_id=case when max_uses=1 then p_submission_id else submission_id end
    where id=v_id;
  return true;
exception when unique_violation then return false;
end $$;
revoke all on function public.redeem_direct_roster_invite(text,uuid) from public,anon,authenticated;
grant execute on function public.redeem_direct_roster_invite(text,uuid) to service_role;
