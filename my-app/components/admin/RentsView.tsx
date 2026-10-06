"use client";

import type { RentPayment } from "@/lib/types";
import { PaginationBar, usePagination } from "./Pagination";
import { RentRowEditor } from "./RentRowEditor";
import { useViewMode, ViewModeToggle } from "./ViewModeToggle";

const STORAGE_KEY = "yasin-rms-rents-view";

export function RentsView({ rents }: { rents: RentPayment[] }) {
  const { view, changeView } = useViewMode(STORAGE_KEY);
  const { page, totalPages, pageItems, total, from, to, goTo } =
    usePagination(rents);

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
      <div className="flex items-center justify-between gap-3 border-b border-gray-soft px-4 py-3">
        <p className="text-sm font-medium text-ink">
          {total} rent record{total === 1 ? "" : "s"}
        </p>
        <ViewModeToggle view={view} onChange={changeView} />
      </div>

      {view === "grid" ? (
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
