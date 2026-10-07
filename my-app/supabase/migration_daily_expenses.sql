-- Daily expenses: cash in / cash out with date+time
-- Run in Supabase SQL Editor

create table if not exists public.daily_expenses (
  id uuid primary key default gen_random_uuid(),
  owner_id text,
  entry_type text not null check (entry_type in ('in', 'out')),
  amount numeric(12, 2) not null check (amount >= 0),
  title text not null,
  notes text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists daily_expenses_owner_id_idx
  on public.daily_expenses (owner_id);

create index if not exists daily_expenses_occurred_at_idx
  on public.daily_expenses (occurred_at desc);

drop trigger if exists daily_expenses_set_updated_at on public.daily_expenses;
create trigger daily_expenses_set_updated_at
  before update on public.daily_expenses
  for each row execute function public.set_updated_at();

alter table public.daily_expenses enable row level security;

drop policy if exists "daily_expenses_all_authenticated" on public.daily_expenses;
create policy "daily_expenses_all_authenticated"
  on public.daily_expenses for all
  to authenticated
  using (true)
  with check (true);
