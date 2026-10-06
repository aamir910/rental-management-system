"use client";

import { updateRentPayment } from "@/app/admin/actions";
import type { RentPayment, RentStatus } from "@/lib/types";
import { formatPKR, remainingAmount } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "./StatusBadge";

type ViewMode = "list" | "grid";

export function RentRowEditor({
  rent,
  view = "list",
}: {
  rent: RentPayment;
  view?: ViewMode;
}) {
  const router = useRouter();
  const [amountPaid, setAmountPaid] = useState(String(rent.amount_paid ?? 0));
  const [dueDate, setDueDate] = useState(rent.due_date);
  const [status, setStatus] = useState<RentStatus>(rent.status);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const remaining = remainingAmount(
    Number(rent.amount_due),
    Number(amountPaid || 0)
  );

  async function save() {
    setSaving(true);
    setMessage(null);

    const result = await updateRentPayment(rent.id, {
      amount_paid: Number(amountPaid || 0),
      due_date: dueDate,
      status,
    });

    setSaving(false);

    if (result?.error) {
      setMessage(result.error);
      return;
    }

    setMessage("Saved");
    router.refresh();
  }

  const fields = (
    <>
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase tracking-wide text-gray-text">
          Paid (Rs.)
        </span>
        <input
          type="number"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          className="w-full rounded-lg border border-gray-soft px-2.5 py-2 text-sm outline-none ring-violet/30 focus:ring-2"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase tracking-wide text-gray-text">
          Due date
        </span>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-lg border border-gray-soft px-2.5 py-2 text-sm outline-none ring-violet/30 focus:ring-2"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase tracking-wide text-gray-text">
          Status
        </span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as RentStatus)}
          className="w-full rounded-lg border border-gray-soft px-2.5 py-2 text-sm outline-none ring-violet/30 focus:ring-2"
        >
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </label>
    </>
  );

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="rounded-lg bg-violet px-3 py-2 text-xs font-semibold text-white hover:bg-violet-soft disabled:opacity-60"
      >
        {saving ? "…" : "Save"}
      </button>
      <Link
        href={`/admin/tenants/${rent.tenant_id}`}
        className="rounded-lg border border-gray-soft px-3 py-2 text-xs font-semibold text-ink hover:bg-gray-soft/60"
      >
        Detail
      </Link>
      {message && (
        <span
          className={`text-[11px] ${message === "Saved" ? "text-emerald" : "text-red"}`}
        >
          {message}
        </span>
      )}
    </div>
  );

  if (view === "grid") {
    return (
      <article className="rounded-2xl border border-gray-soft bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">
              {rent.tenants?.name ?? "—"}
            </p>
            <p className="mt-0.5 truncate text-xs text-gray-text">
              {rent.tenants?.property_unit}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-surface/60 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-gray-text">Due</p>
            <p className="font-medium text-ink">{formatPKR(rent.amount_due)}</p>
          </div>
          <div className="rounded-lg bg-surface/60 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-gray-text">
              Remaining
            </p>
            <p className="font-semibold text-amber">{formatPKR(remaining)}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">{fields}</div>
        <div className="mt-4">{actions}</div>
      </article>
    );
  }

  return (
    <tr className="border-b border-gray-soft/80 last:border-0">
      <td className="px-4 py-3">
        <p className="font-medium text-ink">{rent.tenants?.name ?? "—"}</p>
        <p className="text-xs text-gray-text">{rent.tenants?.property_unit}</p>
      </td>
      <td className="px-4 py-3 text-sm">{formatPKR(rent.amount_due)}</td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          className="w-28 rounded-lg border border-gray-soft px-2 py-1.5 text-sm outline-none ring-violet/30 focus:ring-2"
        />
      </td>
      <td className="px-4 py-3 text-sm font-medium text-amber">
        {formatPKR(remaining)}
      </td>
      <td className="px-4 py-3">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-lg border border-gray-soft px-2 py-1.5 text-sm outline-none ring-violet/30 focus:ring-2"
        />
      </td>
      <td className="px-4 py-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as RentStatus)}
          className="rounded-lg border border-gray-soft px-2 py-1.5 text-sm outline-none ring-violet/30 focus:ring-2"
        >
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        <div className="mt-1">
          <StatusBadge status={status} />
        </div>
      </td>
      <td className="px-4 py-3">{actions}</td>
    </tr>
  );
}
