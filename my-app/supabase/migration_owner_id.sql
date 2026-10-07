-- ============================================================
-- Multi-owner demo isolation: owner_id on all business tables
-- Run in Supabase SQL Editor after Auth.js / dual-backend deploy
-- owner_id stores the MongoDB user ObjectId string
-- ============================================================

alter table public.tenants
  add column if not exists owner_id text;

alter table public.rent_payments
  add column if not exists owner_id text;

alter table public.utility_bills
  add column if not exists owner_id text;

alter table public.reminders
  add column if not exists owner_id text;

alter table public.daily_expenses
  add column if not exists owner_id text;

create index if not exists tenants_owner_id_idx on public.tenants (owner_id);
create index if not exists rent_payments_owner_id_idx on public.rent_payments (owner_id);
create index if not exists utility_bills_owner_id_idx on public.utility_bills (owner_id);
create index if not exists reminders_owner_id_idx on public.reminders (owner_id);
create index if not exists daily_expenses_owner_id_idx on public.daily_expenses (owner_id);

-- Optional: backfill existing rows to a known owner id after first signup
-- update public.tenants set owner_id = '<your-mongo-user-id>' where owner_id is null;
-- update public.rent_payments set owner_id = '<your-mongo-user-id>' where owner_id is null;
-- update public.utility_bills set owner_id = '<your-mongo-user-id>' where owner_id is null;
-- update public.reminders set owner_id = '<your-mongo-user-id>' where owner_id is null;
