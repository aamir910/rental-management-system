-- Seed unpaid tenants into SUPABASE ONLY (does not touch MongoDB)
-- Run in Supabase SQL Editor
--
-- owner_id is just a text column on Supabase rows so the app can find your data.
-- This script auto-copies it from any existing tenant row.
--
-- If you have NO tenants yet, set v_owner manually (from /api/auth/session → user.id)
-- or leave null (rows insert, but the app may hide them until owner_id matches your login).

do $$
declare
  v_owner text;
  v_month date := '2026-10-01';
  v_due   date := '2026-10-05';
begin
  -- Reuse owner_id already in your old Supabase data (no Mongo needed)
  select owner_id into v_owner
  from public.tenants
  where owner_id is not null and owner_id <> ''
  limit 1;

  -- Optional manual override if table is empty:
  -- v_owner := 'paste-your-user-id-here';

  with seed (name, property_unit, monthly_rent) as (
    values
      ('Allah Baksh', 'Chaklala', 10000),
      ('Ibrahim', 'Chaklala', 6000),
      ('Sadakat', 'Chaklala', 18000),
      ('Saghir', 'Chaklala', 12000),
      ('Khalid', 'Chaklala', 17000),
      ('Obiad Khan', 'Chaklala', 20000),
      ('Raysat', 'Ghori Town', 9000),
      ('Tariq', 'Ghori Town', 27000),
      ('Imran', 'Ghori Town', 17000),
      ('Hira', 'Chaklala', 9000),
      ('Qadar', 'Chaklala', 9000),
      ('Nayaz', 'Chaklala', 6000),
      ('Waheed', 'Chaklala', 7000),
      ('Dildar', 'Chaklala', 6000),
      ('Zaheer', 'Chaklala', 12000),
      ('Bila', 'Ghori Town', 10000),
      ('Ikhlaq', 'Ghori Town', 11000),
      ('Waseem', 'Ghori Town', 10500),
      ('Tanveer', 'Ghori Town', 10500)
  ),
  inserted as (
    insert into public.tenants (
      owner_id, name, property_unit, monthly_rent, status
    )
    select
      v_owner,
      s.name,
      s.property_unit,
      s.monthly_rent,
      'active'
    from seed s
    returning id, monthly_rent
  )
  insert into public.rent_payments (
    owner_id,
    tenant_id,
    billing_month,
    amount_due,
    amount_paid,
    due_date,
    status,
    notes
  )
  select
    v_owner,
    i.id,
    v_month,
    i.monthly_rent,
    0,
    v_due,
    'pending',
    'Seeded unpaid rent'
  from inserted i;

  raise notice 'Supabase only: inserted 19 tenants + unpaid rents. owner_id=%', coalesce(v_owner, '(null)');
end $$;

-- Verify in Supabase:
-- select name, property_unit, monthly_rent, owner_id from tenants order by property_unit, name;
-- select t.name, r.amount_due, r.status
-- from rent_payments r join tenants t on t.id = r.tenant_id
-- where r.billing_month = '2026-10-01';
