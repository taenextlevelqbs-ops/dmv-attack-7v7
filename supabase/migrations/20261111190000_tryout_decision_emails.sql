-- Decision emails are private operational records. Run in DMV Attack Supabase before enabling notifications.
create table if not exists public.tryout_decision_emails (
 id uuid primary key default gen_random_uuid(),
 submission_id uuid not null references public.tryout_submissions(id) on delete cascade,
 decision text not null check (decision in ('ACCEPTED','DECLINED','CALLBACK','OFFERED')),
 recipient_email text not null,
 state text not null default 'pending' check (state in ('pending','sending','sent','failed')),
 provider_message_id text,
 error_message text,
 attempted_at timestamptz,
 sent_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (submission_id, decision)
);
alter table public.tryout_decision_emails enable row level security;
revoke all on public.tryout_decision_emails from anon, authenticated;
grant all on public.tryout_decision_emails to service_role;

-- Lock a pending/failed notification before sending to avoid duplicate concurrent requests.
create or replace function public.claim_tryout_decision_email(p_id uuid)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare changed integer;
begin
 update public.tryout_decision_emails
 set state='sending', attempted_at=now(), updated_at=now(), error_message=null
 where id=p_id and state in ('pending','failed')
 returning 1 into changed;
 return changed = 1;
end;
$$;
revoke all on function public.claim_tryout_decision_email(uuid) from public, anon, authenticated;
grant execute on function public.claim_tryout_decision_email(uuid) to service_role;
