"use client";

import type { Tenant } from "@/lib/types";
import { formatPKR } from "@/lib/utils";
import Link from "next/link";
import { DeleteTenantButton } from "./DeleteTenantButton";
import { PaginationBar, usePagination } from "./Pagination";
import { StatusBadge } from "./StatusBadge";
import { useViewMode, ViewModeToggle } from "./ViewModeToggle";

const STORAGE_KEY = "yasin-rms-tenants-view";

export function TenantsView({ tenants }: { tenants: Tenant[] }) {
  const { view, changeView } = useViewMode(STORAGE_KEY);
  const { page, totalPages, pageItems, total, from, to, goTo } =
    usePagination(tenants);

  if (tenants.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-gray-text">
        No tenants yet. Click <strong>Add Tenant</strong> to create the first one.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-gray-soft px-4 py-3">
        <p className="text-sm font-medium text-ink">
          {total} tenant{total === 1 ? "" : "s"}
        </p>
        <ViewModeToggle view={view} onChange={changeView} />
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((tenant) => (
            <article
              key={tenant.id}
              className="rounded-xl border border-gray-soft bg-surface/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{tenant.name}</p>
                  <p className="mt-0.5 truncate text-xs text-gray-text">
                    {tenant.property_unit}
                  </p>
                </div>
                <StatusBadge status={tenant.status} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-white px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-text">
                    Monthly rent
                  </p>
                  <p className="font-medium text-ink">
                    {formatPKR(tenant.monthly_rent)}
                  </p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-text">
                    Phone
                  </p>
                  <p className="truncate font-medium text-ink">
                    {tenant.phone || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/admin/tenants/${tenant.id}`}
                  className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-soft bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-gray-soft/60"
                >
                  Detail
                </Link>
                <DeleteTenantButton
                  tenantId={tenant.id}
                  tenantName={tenant.name}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
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
              {pageItems.map((tenant) => (
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaginationBar
        page={page}
        totalPages={totalPages}
        from={from}
        to={to}
        total={total}
        onPageChange={goTo}
      />
    </div>
  );
}
