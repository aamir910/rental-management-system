"use client";

import type { RentPayment } from "@/lib/types";
import {
  formatBillingMonth,
  formatDate,
  formatPKR,
  remainingAmount,
} from "@/lib/utils";
import { PaginationBar, usePagination } from "./Pagination";
import { StatusBadge } from "./StatusBadge";
import { useViewMode, ViewModeToggle } from "./ViewModeToggle";

const STORAGE_KEY = "yasin-rms-rent-history-view";

export function RentHistoryList({ history }: { history: RentPayment[] }) {
  const { view, changeView } = useViewMode(STORAGE_KEY);
  const { page, totalPages, pageItems, total, from, to, goTo } =
    usePagination(history);

  if (history.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-gray-text">
        No rent rows yet. Generate this month from Monthly Rents.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-gray-soft px-4 py-3 sm:px-5">
        <p className="text-sm font-medium text-ink">
          {total} record{total === 1 ? "" : "s"}
        </p>
        <ViewModeToggle view={view} onChange={changeView} />
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
          {pageItems.map((rent) => (
            <article
              key={rent.id}
              className="rounded-xl border border-gray-soft bg-surface/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-ink">
                  {formatBillingMonth(rent.billing_month)}
                </p>
                <StatusBadge status={rent.status} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-white px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-text">
                    Due
                  </p>
                  <p className="font-medium">{formatPKR(rent.amount_due)}</p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-text">
                    Paid
                  </p>
                  <p className="font-medium text-emerald">
                    {formatPKR(rent.amount_paid)}
                  </p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-text">
                    Remaining
                  </p>
                  <p className="font-medium text-amber">
                    {formatPKR(remainingAmount(rent.amount_due, rent.amount_paid))}
                  </p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-text">
                    Due date
                  </p>
                  <p className="font-medium">{formatDate(rent.due_date)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-gray-text">
              <tr>
                <th className="px-4 py-3 font-semibold">Month</th>
                <th className="px-4 py-3 font-semibold">Due</th>
                <th className="px-4 py-3 font-semibold">Paid</th>
                <th className="px-4 py-3 font-semibold">Remaining</th>
                <th className="px-4 py-3 font-semibold">Due date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((rent) => (
                <tr key={rent.id} className="border-t border-gray-soft/80">
                  <td className="px-4 py-3 font-medium">
                    {formatBillingMonth(rent.billing_month)}
                  </td>
                  <td className="px-4 py-3">{formatPKR(rent.amount_due)}</td>
                  <td className="px-4 py-3 text-emerald">
                    {formatPKR(rent.amount_paid)}
                  </td>
                  <td className="px-4 py-3 text-amber">
                    {formatPKR(remainingAmount(rent.amount_due, rent.amount_paid))}
                  </td>
                  <td className="px-4 py-3">{formatDate(rent.due_date)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={rent.status} />
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
