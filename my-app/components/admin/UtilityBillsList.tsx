"use client";

import {
  deleteUtilityBill,
  updateUtilityBillStatus,
} from "@/app/admin/actions";
import { BILL_CHECK_LINKS } from "@/lib/bill-links";
import type { UtilityBill, UtilityBillStatus } from "@/lib/types";
import { formatDate, formatPKR } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "./StatusBadge";

export function UtilityBillsList({ bills }: { bills: UtilityBill[] }) {
  if (bills.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-gray-text">
        No utility bills for this month yet. Add one above.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
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
          {bills.map((bill) => (
            <UtilityBillRow key={bill.id} bill={bill} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UtilityBillRow({ bill }: { bill: UtilityBill }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const link =
    bill.utility_type === "electricity"
      ? BILL_CHECK_LINKS.electricity
      : BILL_CHECK_LINKS.gas;

  async function setStatus(status: UtilityBillStatus) {
    setLoading(true);
    const result = await updateUtilityBillStatus(bill.id, status);
    setLoading(false);
    if (result?.error) {
      window.alert(result.error);
      return;
    }
    router.refresh();
  }

  async function onDelete() {
    const ok = window.confirm("Delete this utility bill?");
    if (!ok) return;
    setLoading(true);
    const result = await deleteUtilityBill(bill.id);
    setLoading(false);
    if (result?.error) {
      window.alert(result.error);
      return;
    }
    router.refresh();
  }

  async function copyRef() {
    if (!bill.reference_snapshot) return;
    try {
      await navigator.clipboard.writeText(bill.reference_snapshot);
    } catch {
      window.prompt("Copy reference:", bill.reference_snapshot);
    }
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
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {bill.status === "pending" ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => setStatus("success")}
              className="rounded-lg bg-emerald/15 px-2.5 py-1 text-xs font-semibold text-emerald hover:bg-emerald/25 disabled:opacity-60"
            >
              Mark success
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => setStatus("pending")}
              className="rounded-lg bg-amber/15 px-2.5 py-1 text-xs font-semibold text-amber hover:bg-amber/25 disabled:opacity-60"
            >
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
            className="rounded-lg border border-red/30 bg-red/10 px-2.5 py-1 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
