import { AddTenantForm } from "@/components/admin/AddTenantForm";
import { TenantsView } from "@/components/admin/TenantsView";
import { createClient } from "@/lib/supabase/server";
import type { Tenant } from "@/lib/types";
import { TenantsPageClient } from "./TenantsPageClient";

export default async function TenantsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });

  const tenants = (data ?? []) as Tenant[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Tenants</h1>
          <p className="mt-1 text-sm text-gray-text">
            Manage tenant profiles, property units, and rent amounts.
          </p>
        </div>
        <TenantsPageClient />
      </div>

      {error && (
        <div className="rounded-2xl border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
          {error.message}. Make sure you ran <code>supabase/schema.sql</code> in your project.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-soft bg-white shadow-sm">
        <TenantsView tenants={tenants} />
      </div>

      <div id="add-tenant" className="rounded-2xl border border-gray-soft bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">Add Tenant</h2>
        <AddTenantForm />
      </div>
    </div>
  );
}
