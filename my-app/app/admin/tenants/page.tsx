import { AddTenantForm } from "@/components/admin/AddTenantForm";
import { DeleteTenantButton } from "@/components/admin/DeleteTenantButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import type { Tenant } from "@/lib/types";
import { formatPKR } from "@/lib/utils";
import Link from "next/link";
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
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-gray-text">
              <tr>
                <th className="px-4 py-3 font-semibold">Tenant</th>
                <th className="px-4 py-3 font-semibold">Property</th>
                <th className="px-4 py-3 font-semibold">Monthly rent</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-text">
                    No tenants yet. Click <strong>Add Tenant</strong> to create the first one.
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-t border-gray-soft/80">
                    <td className="px-4 py-3 font-medium text-ink">{tenant.name}</td>
                    <td className="px-4 py-3 text-gray-text">{tenant.property_unit}</td>
                    <td className="px-4 py-3">{formatPKR(tenant.monthly_rent)}</td>
                    <td className="px-4 py-3 text-gray-text">{tenant.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tenant.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/tenants/${tenant.id}`}
                          className="rounded-lg border border-gray-soft px-3 py-1.5 text-xs font-semibold text-ink hover:bg-gray-soft/60"
                        >
                          Detail
                        </Link>
                        <DeleteTenantButton
                          tenantId={tenant.id}
                          tenantName={tenant.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div id="add-tenant" className="rounded-2xl border border-gray-soft bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">Add Tenant</h2>
        <AddTenantForm />
      </div>
    </div>
  );
}
