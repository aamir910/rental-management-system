"use client";

import type { RentPayment, RentStatus } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { PaginationBar, usePagination } from "./Pagination";
import { RentRowEditor } from "./RentRowEditor";
import { useViewMode, ViewModeToggle } from "./ViewModeToggle";

const STORAGE_KEY = "yasin-rms-rents-view";

type StatusFilter = "all" | RentStatus;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

export function RentsView({ rents }: { rents: RentPayment[] }) {
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
      paid: 0,
      overdue: 0,
    };
    for (const r of rents) {
      map[r.status] += 1;
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
      <p className="px-4 py-10 text-center text-sm text-gray-text">
        No rent rows for this month. Click <strong>Generate this month’s rents</strong>{" "}
        after adding active tenants.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-gray-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-ink">
          {total} tenant{total === 1 ? "" : "s"}
          {statusFilter !== "all" ? (
            <span className="font-normal text-gray-text">
              {" "}
              · {FILTERS.find((f) => f.value === statusFilter)?.label}
            </span>
          ) : null}
        </p>
        <ViewModeToggle view={view} onChange={changeView} />
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-gray-soft px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        <p className="px-4 py-10 text-center text-sm text-gray-text">
          No tenants with this status for the selected month.
        </p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((rent) => (
            <RentRowEditor key={rent.id} rent={rent} view="grid" />
          ))}
        </div>
      ) : (
        <div className="-mx-0 overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-gray-text">
              <tr>
                <th className="px-4 py-3 font-semibold">Tenant</th>
                <th className="px-4 py-3 font-semibold">Amount due</th>
                <th className="px-4 py-3 font-semibold">Paid</th>
                <th className="px-4 py-3 font-semibold">Remaining</th>
                <th className="px-4 py-3 font-semibold">Due date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((rent) => (
                <RentRowEditor key={rent.id} rent={rent} view="list" />
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
