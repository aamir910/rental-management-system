"use client";

import { BILL_CHECK_LINKS } from "@/lib/bill-links";
import {
  useDeleteUtilityBillMutation,
  useUpdateUtilityBillStatusMutation,
} from "@/lib/store/api";
import { rtkErrorMessage } from "@/lib/store/errorMessage";
import type { UtilityBill, UtilityBillStatus } from "@/lib/types";
import { formatDate, formatPKR } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { InlineSpinner } from "./LoadingState";
import { PaginationBar, usePagination } from "./Pagination";
import { StatusBadge } from "./StatusBadge";
import { useViewMode, ViewModeToggle } from "./ViewModeToggle";

const STORAGE_KEY = "yasin-rms-utility-bills-view";

export function UtilityBillsList({ bills }: { bills: UtilityBill[] }) {
  const { view, changeView } = useViewMode(STORAGE_KEY);
  const { page, totalPages, pageItems, total, from, to, goTo } =
    usePagination(bills);

  if (bills.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-gray-text">
        No utility bills for this month yet. Add one above.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-gray-soft px-4 py-3">
        <p className="text-sm font-medium text-ink">
          {total} bill{total === 1 ? "" : "s"}
        </p>
        <ViewModeToggle view={view} onChange={changeView} />
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
          {pageItems.map((bill) => (
            <UtilityBillItem key={bill.id} bill={bill} view="grid" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-gray-text">
              <tr>
                <th className="px-4 py-3 font-semibold">Tenant</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold">Due</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((bill) => (
                <UtilityBillItem key={bill.id} bill={bill} view="list" />
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

function UtilityBillItem({
  bill,
  view,
}: {
  bill: UtilityBill;
  view: "grid" | "list";
}) {
  const [updateStatus, { isLoading: statusLoading }] =
    useUpdateUtilityBillStatusMutation();
  const [deleteBill, { isLoading: deleteLoading }] =
    useDeleteUtilityBillMutation();
  const loading = statusLoading || deleteLoading;
  const link =
    bill.utility_type === "electricity"
      ? BILL_CHECK_LINKS.electricity
      : BILL_CHECK_LINKS.gas;

  async function setStatus(status: UtilityBillStatus) {
    try {
      await updateStatus({ billId: bill.id, status }).unwrap();
    } catch (err) {
      window.alert(rtkErrorMessage(err, "Failed to update status."));
    }
  }

  async function onDelete() {
    const ok = window.confirm("Delete this utility bill?");
    if (!ok) return;
    try {
      await deleteBill(bill.id).unwrap();
    } catch (err) {
      window.alert(rtkErrorMessage(err, "Failed to delete bill."));
    }
  }

  async function copyRef() {
    if (!bill.reference_snapshot) return;
    try {
      await navigator.clipboard.writeText(bill.reference_snapshot);
    } catch {
      window.prompt("Copy reference:", bill.reference_snapshot);
    }
  }

  const actions = (
    <div className="flex flex-wrap gap-2">
      {bill.status === "pending" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => setStatus("success")}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald/15 px-2.5 py-1 text-xs font-semibold text-emerald hover:bg-emerald/25 disabled:opacity-60"
        >
          {statusLoading && <InlineSpinner />}
          Mark success
        </button>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={() => setStatus("pending")}
          className="inline-flex items-center gap-1 rounded-lg bg-amber/15 px-2.5 py-1 text-xs font-semibold text-amber hover:bg-amber/25 disabled:opacity-60"
        >
          {statusLoading && <InlineSpinner />}
          Mark pending
        </button>
      )}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-lg border border-gray-soft px-2.5 py-1 text-xs font-semibold text-ink hover:bg-gray-soft/60"
      >
        <ExternalLink size={12} />
        Check bill
      </a>
      <button
        type="button"
        disabled={loading}
        onClick={onDelete}
        className="inline-flex items-center gap-1 rounded-lg border border-red/30 bg-red/10 px-2.5 py-1 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-60"
      >
        {deleteLoading && <InlineSpinner />}
        Delete
      </button>
    </div>
  );

  if (view === "grid") {
    return (
      <article className="rounded-xl border border-gray-soft bg-surface/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">
              {bill.tenants?.name ?? "—"}
            </p>
            <p className="mt-0.5 truncate text-xs text-gray-text">
              {bill.tenants?.property_unit}
            </p>
          </div>
          <StatusBadge status={bill.status} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-white px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-gray-text">
              Type
            </p>
            <p className="font-medium capitalize">{bill.utility_type}</p>
          </div>
          <div className="rounded-lg bg-white px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-gray-text">
              Amount
            </p>
            <p className="font-medium">{formatPKR(bill.amount)}</p>
          </div>
          <div className="col-span-2 rounded-lg bg-white px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-gray-text">
              Reference
            </p>
            <p className="font-mono text-xs">{bill.reference_snapshot || "—"}</p>
            {bill.reference_snapshot && (
              <button
                type="button"
                onClick={copyRef}
                className="mt-1 text-[11px] font-semibold text-violet hover:underline"
              >
                Copy
              </button>
            )}
          </div>
          <div className="col-span-2 rounded-lg bg-white px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-gray-text">
              Due
            </p>
            <p className="font-medium">{formatDate(bill.due_date)}</p>
          </div>
        </div>

        <div className="mt-3">{actions}</div>
      </article>
    );
  }

  return (
    <tr className="border-t border-gray-soft/80">
      <td className="px-4 py-3">
        <p className="font-medium text-ink">{bill.tenants?.name ?? "—"}</p>
        <p className="text-xs text-gray-text">{bill.tenants?.property_unit}</p>
      </td>
      <td className="px-4 py-3 capitalize">{bill.utility_type}</td>
      <td className="px-4 py-3 font-medium">{formatPKR(bill.amount)}</td>
      <td className="px-4 py-3">
        <p className="font-mono text-xs">{bill.reference_snapshot || "—"}</p>
        {bill.reference_snapshot && (
          <button
            type="button"
            onClick={copyRef}
            className="mt-1 text-[11px] font-semibold text-violet hover:underline"
          >
            Copy
          </button>
        )}
      </td>
      <td className="px-4 py-3">{formatDate(bill.due_date)}</td>
      <td className="px-4 py-3">
        <StatusBadge status={bill.status} />
      </td>
      <td className="px-4 py-3">{actions}</td>
    </tr>
  );
}
