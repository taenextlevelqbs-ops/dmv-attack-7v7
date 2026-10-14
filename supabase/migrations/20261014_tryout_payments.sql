create table if not exists public.tryout_payments (
  registration_id uuid primary key references public.tryout_submissions(id) on delete cascade,
  status text not null default 'UNPAID' check (status in ('UNPAID','PENDING','PAID')),
  amount_cents integer not null default 2000 check (amount_cents = 2000),
  payment_note text,
  verified_at timestamptz,
  verified_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);
alter table public.tryout_payments enable row level security;
-- No public policies: only authenticated server-side service role can access.
