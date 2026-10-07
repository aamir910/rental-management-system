"use client";

import type { RentPayment, RentStatus } from "@/lib/types";
import { formatPKR, remainingAmount } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PaginationBar, usePagination } from "./Pagination";
import { StatusBadge } from "./StatusBadge";
import { useViewMode, ViewModeToggle } from "./ViewModeToggle";

const STORAGE_KEY = "yasin-rms-outstanding-view";

type StatusFilter = "all" | Exclude<RentStatus, "paid">;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All due" },
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "overdue", label: "Overdue" },
];

export function OutstandingRentsList({ rents }: { rents: RentPayment[] }) {
  const { view, changeView } = useViewMode(STORAGE_KEY);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return rents;
    return rents.filter((r) => r.status === statusFilter);
  }, [rents, statusFilter]);

  const counts = useMemo(() => {
    const map: Record<StatusFilter, number> = {
      all: rents.length,
      pending: 0,
      partial: 0,
      overdue: 0,
    };
    for (const r of rents) {
      if (r.status === "pending" || r.status === "partial" || r.status === "overdue") {
        map[r.status] += 1;
      }
    }
    return map;
  }, [rents]);

  const { page, totalPages, pageItems, total, from, to, pageSize, setPageSize, goTo } =
    usePagination(filtered);

  useEffect(() => {
    goTo(1);
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  if (rents.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-gray-text sm:px-5">
        No outstanding rents for this month. Generate rents or mark payments in
        Monthly Rents.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-gray-soft px-4 py-3 sm:px-5">
        <p className="text-sm font-medium text-ink">
          {total} outstanding
        </p>
        <ViewModeToggle view={view} onChange={changeView} />
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-gray-soft px-4 py-3 sm:px-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => {
          const active = statusFilter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-violet bg-violet/10 text-violet"
                  : "border-gray-soft bg-white text-gray-text hover:border-violet/30 hover:text-ink"
              }`}
            >
              {f.label}
              <span className={`ms-1.5 tabular-nums ${active ? "opacity-90" : "opacity-60"}`}>
                {counts[f.value]}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-gray-text sm:px-5">
          No tenants with this status in outstanding rents.
        </p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
          {pageItems.map((rent) => (
            <article
              key={rent.id}
              className="rounded-xl border border-gray-soft bg-surface/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    {rent.tenants?.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-text">
                    {rent.tenants?.property_unit}
                  </p>
                </div>
                <StatusBadge status={rent.status} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-white px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-text">
                    Due
                  </p>
                  <p className="font-medium text-ink">
                    {formatPKR(rent.amount_due)}
                  </p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-text">
                    Paid
                  </p>
                  <p className="font-medium text-emerald">
                    {formatPKR(rent.amount_paid)}
                  </p>
                </div>
                <div className="col-span-2 rounded-lg bg-white px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-text">
                    Remaining
                  </p>
                  <p className="font-semibold text-amber">
                    {formatPKR(
                      remainingAmount(rent.amount_due, rent.amount_paid)
                    )}
                  </p>
                </div>
              </div>

              <Link
                href={`/admin/tenants/${rent.tenant_id}`}
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-gray-soft bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-gray-soft/60"
              >
                View detail
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-gray-text">
              <tr>
                <th className="px-4 py-3 font-semibold">Tenant</th>
                <th className="px-4 py-3 font-semibold">Due</th>
                <th className="px-4 py-3 font-semibold">Paid</th>
                <th className="px-4 py-3 font-semibold">Remaining</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((rent) => (
                <tr key={rent.id} className="border-t border-gray-soft/80">
                  <td className="px-4 py-3">
                    <p className="font-medium">{rent.tenants?.name}</p>
                    <p className="text-xs text-gray-text">
                      {rent.tenants?.property_unit}
                    </p>
                  </td>
                  <td className="px-4 py-3">{formatPKR(rent.amount_due)}</td>
                  <td className="px-4 py-3 text-emerald">
                    {formatPKR(rent.amount_paid)}
                  </td>
                  <td className="px-4 py-3 text-amber">
                    {formatPKR(
                      remainingAmount(rent.amount_due, rent.amount_paid)
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={rent.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/tenants/${rent.tenant_id}`}
                      className="rounded-lg border border-gray-soft px-3 py-1.5 text-xs font-semibold hover:bg-gray-soft/60"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          from={from}
          to={to}
          total={total}
          pageSize={pageSize}
          onPageChange={goTo}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
