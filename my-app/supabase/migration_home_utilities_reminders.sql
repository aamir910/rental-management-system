-- Run in Supabase SQL Editor (Phase 1 Home: utilities + reminders)

create table if not exists public.utility_bills (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  utility_type text not null check (utility_type in ('electricity', 'gas')),
  billing_month date not null,
  amount numeric(12, 2) not null default 0,
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'success')),
  reference_snapshot text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, utility_type, billing_month)
);

create index if not exists utility_bills_billing_month_idx
  on public.utility_bills (billing_month);

create index if not exists utility_bills_tenant_id_idx
  on public.utility_bills (tenant_id);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  next_due_date date not null,
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reminders_next_due_date_idx
  on public.reminders (next_due_date);

drop trigger if exists utility_bills_set_updated_at on public.utility_bills;
create trigger utility_bills_set_updated_at
  before update on public.utility_bills
  for each row execute function public.set_updated_at();

drop trigger if exists reminders_set_updated_at on public.reminders;
create trigger reminders_set_updated_at
  before update on public.reminders
  for each row execute function public.set_updated_at();

alter table public.utility_bills enable row level security;
alter table public.reminders enable row level security;

drop policy if exists "utility_bills_all_authenticated" on public.utility_bills;
create policy "utility_bills_all_authenticated"
  on public.utility_bills for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "reminders_all_authenticated" on public.reminders;
create policy "reminders_all_authenticated"
  on public.reminders for all
  to authenticated
  using (true)
  with check (true);
