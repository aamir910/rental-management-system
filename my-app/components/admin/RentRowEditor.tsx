"use client";

import { InlineSpinner } from "@/components/admin/LoadingState";
import { PaymentChannelFields } from "@/components/admin/PaymentChannelFields";
import { useUpdateRentPaymentMutation } from "@/lib/store/api";
import { rtkErrorMessage } from "@/lib/store/errorMessage";
import type {
  AccountProvider,
  PaymentChannel,
  RentPayment,
  RentStatus,
} from "@/lib/types";
import { paymentChannelLabel } from "@/lib/payment-channels";
import { formatPKR, remainingAmount } from "@/lib/utils";
import Link from "next/link";
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
  const [amountPaid, setAmountPaid] = useState(String(rent.amount_paid ?? 0));
  const [dueDate, setDueDate] = useState(rent.due_date);
  const [status, setStatus] = useState<RentStatus>(rent.status);
  const [channel, setChannel] = useState<PaymentChannel>(
    rent.payment_channel ?? "cash"
  );
  const [provider, setProvider] = useState<AccountProvider | "">(
    rent.account_provider ?? ""
  );
  const [message, setMessage] = useState<string | null>(null);
  const [updateRent, { isLoading: saving }] = useUpdateRentPaymentMutation();

  const paidNum = Number(amountPaid || 0);
  const remaining = remainingAmount(Number(rent.amount_due), paidNum);

  async function save() {
    setMessage(null);
    if (paidNum > 0 && channel === "account" && !provider) {
      setMessage("Select an account for rent in account.");
      return;
    }
    try {
      await updateRent({
        rentId: rent.id,
        amount_paid: paidNum,
        due_date: dueDate,
        status,
        payment_channel: paidNum > 0 ? channel : null,
        account_provider:
          paidNum > 0 && channel === "account" ? provider || null : null,
      }).unwrap();
      setMessage("Saved");
    } catch (err) {
      setMessage(rtkErrorMessage(err, "Save failed."));
    }
  }

  const channelFields =
    paidNum > 0 ? (
      <PaymentChannelFields
        channel={channel}
        provider={provider}
        channelLabel="Rent via"
        onChannelChange={(next) => {
          setChannel(next);
          if (next === "cash") setProvider("");
        }}
        onProviderChange={setProvider}
        compact
      />
    ) : null;

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
      {channelFields ? <div className="sm:col-span-3">{channelFields}</div> : null}
    </>
  );

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-lg bg-violet px-3 py-2 text-xs font-semibold text-white hover:bg-violet-soft disabled:opacity-60"
      >
        {saving && <InlineSpinner className="text-white" />}
        {saving ? "Saving…" : "Save"}
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

        {rent.payment_channel && Number(rent.amount_paid) > 0 ? (
          <p className="mt-2 text-xs text-gray-text">
            Via {paymentChannelLabel(rent.payment_channel, rent.account_provider)}
          </p>
        ) : null}

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
        {rent.payment_channel && Number(rent.amount_paid) > 0 ? (
          <p className="mt-0.5 text-[11px] text-violet">
            {paymentChannelLabel(rent.payment_channel, rent.account_provider)}
          </p>
        ) : null}
      </td>
      <td className="px-4 py-3 text-sm">{formatPKR(rent.amount_due)}</td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          className="w-28 rounded-lg border border-gray-soft px-2 py-1.5 text-sm outline-none ring-violet/30 focus:ring-2"
        />
        <div className="mt-2 w-44">{channelFields}</div>
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
