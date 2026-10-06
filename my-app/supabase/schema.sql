-- Yasin RMS Phase 1 schema
-- Run this in Supabase SQL Editor

-- Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

-- Tenants
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  cnic text,
  property_unit text not null,
  monthly_rent numeric(12, 2) not null default 0,
  move_in_date date,
  electricity_ref text,
  gas_ref text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Monthly rent payments
create table if not exists public.rent_payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  billing_month date not null,
  amount_due numeric(12, 2) not null default 0,
  amount_paid numeric(12, 2) not null default 0,
  due_date date not null,
  status text not null default 'pending'
    check (status in ('pending', 'partial', 'paid', 'overdue')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, billing_month)
);

create index if not exists rent_payments_billing_month_idx
  on public.rent_payments (billing_month);

create index if not exists rent_payments_tenant_id_idx
  on public.rent_payments (tenant_id);

create index if not exists tenants_status_idx
  on public.tenants (status);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'admin'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tenants_set_updated_at on public.tenants;
create trigger tenants_set_updated_at
  before update on public.tenants
  for each row execute function public.set_updated_at();

drop trigger if exists rent_payments_set_updated_at on public.rent_payments;
create trigger rent_payments_set_updated_at
  before update on public.rent_payments
  for each row execute function public.set_updated_at();

-- Generate rent rows for a billing month (idempotent)
create or replace function public.generate_monthly_rents(p_billing_month date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month date := date_trunc('month', p_billing_month)::date;
  v_due date := (date_trunc('month', p_billing_month) + interval '4 days')::date;
  v_count integer;
begin
  insert into public.rent_payments (
    tenant_id,
    billing_month,
    amount_due,
    amount_paid,
    due_date,
    status
  )
  select
    t.id,
    v_month,
    t.monthly_rent,
    0,
    v_due,
    'pending'
  from public.tenants t
  where t.status = 'active'
  on conflict (tenant_id, billing_month) do nothing;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.tenants enable row level security;
alter table public.rent_payments enable row level security;

-- Authenticated users (personal admin) can manage everything
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

drop policy if exists "tenants_all_authenticated" on public.tenants;
create policy "tenants_all_authenticated"
  on public.tenants for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "rent_payments_all_authenticated" on public.rent_payments;
create policy "rent_payments_all_authenticated"
  on public.rent_payments for all
  to authenticated
  using (true)
  with check (true);

-- Allow authenticated to call generate function
grant execute on function public.generate_monthly_rents(date) to authenticated;

-- Utility bills (gas / electricity per tenant per month)
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

-- Admin reminder notes
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
