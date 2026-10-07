-- Remove duplicate tenants (same name + property_unit)
-- Keeps the oldest row; deletes extras.
-- rent_payments / utility_bills cascade-delete with the tenant.

-- 1) Preview duplicates first (safe — read only)
select name, property_unit, count(*) as copies
from public.tenants
group by name, property_unit
having count(*) > 1
order by name;

-- 2) Delete duplicates (run after checking the preview)
with ranked as (
  select
    id,
    row_number() over (
      partition by lower(trim(name)), lower(trim(property_unit))
      order by created_at asc, id asc
    ) as rn
  from public.tenants
)
delete from public.tenants t
using ranked r
where t.id = r.id
  and r.rn > 1;

-- 3) Optional: also remove duplicate unpaid rents for same tenant + month
--    (in case generate/seed ran twice on the same tenant)
-- unique (tenant_id, billing_month) normally prevents this, so usually not needed.

-- 4) Verify
select name, property_unit, monthly_rent
from public.tenants
order by property_unit, name;
