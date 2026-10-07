-- Demo isolation: each authenticated user only sees/edits their own rows
-- Run in Supabase SQL Editor (optional but recommended with owner_id filtering)

-- Tenants
drop policy if exists "tenants_all_authenticated" on public.tenants;
create policy "tenants_owner_isolation"
  on public.tenants for all
  to authenticated
  using (owner_id = auth.uid()::text)
  with check (owner_id = auth.uid()::text);

-- Rent payments
drop policy if exists "rent_payments_all_authenticated" on public.rent_payments;
create policy "rent_payments_owner_isolation"
  on public.rent_payments for all
  to authenticated
  using (owner_id = auth.uid()::text)
  with check (owner_id = auth.uid()::text);

-- Utility bills
drop policy if exists "utility_bills_all_authenticated" on public.utility_bills;
create policy "utility_bills_owner_isolation"
  on public.utility_bills for all
  to authenticated
  using (owner_id = auth.uid()::text)
  with check (owner_id = auth.uid()::text);

-- Reminders
drop policy if exists "reminders_all_authenticated" on public.reminders;
create policy "reminders_owner_isolation"
  on public.reminders for all
  to authenticated
  using (owner_id = auth.uid()::text)
  with check (owner_id = auth.uid()::text);

-- Daily expenses
drop policy if exists "daily_expenses_all_authenticated" on public.daily_expenses;
create policy "daily_expenses_owner_isolation"
  on public.daily_expenses for all
  to authenticated
  using (owner_id = auth.uid()::text)
  with check (owner_id = auth.uid()::text);
