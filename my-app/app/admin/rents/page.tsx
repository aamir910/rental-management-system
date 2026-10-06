import { GenerateRentsButton } from "@/components/admin/GenerateRentsButton";
import { MonthSwitcher } from "@/components/admin/MonthSwitcher";
import { RentsView } from "@/components/admin/RentsView";
import { createClient } from "@/lib/supabase/server";
import type { RentPayment } from "@/lib/types";
import {
  formatBillingMonth,
  formatPKR,
  monthInputToBillingDate,
  remainingAmount,
  toMonthInputValue,
  firstOfMonth,
} from "@/lib/utils";
import { Suspense } from "react";

type Props = {
  searchParams: Promise<{ month?: string }>;
};

export default async function RentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const month = params.month || toMonthInputValue(firstOfMonth());
  const billingMonth = monthInputToBillingDate(month);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rent_payments")
    .select(
      "*, tenants(id, name, property_unit, phone, monthly_rent, status)"
    )
    .eq("billing_month", billingMonth)
    .order("due_date", { ascending: true });

  const rents = (data ?? []) as RentPayment[];

  const expected = rents.reduce((s, r) => s + Number(r.amount_due), 0);
  const collected = rents.reduce((s, r) => s + Number(r.amount_paid), 0);
  const remaining = remainingAmount(expected, collected);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-ink sm:text-2xl">Monthly Rents</h1>
          <p className="mt-1 text-sm text-gray-text">
            {formatBillingMonth(billingMonth)} — track incoming payments, remaining
            dues, and status.
          </p>
        </div>
        <Suspense fallback={null}>
          <MonthSwitcher month={month} />
        </Suspense>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat label="Expected" value={formatPKR(expected)} />
        <Stat label="Collected" value={formatPKR(collected)} tone="emerald" />
        <Stat
          label="Remaining"
          value={formatPKR(remaining)}
          tone="amber"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <GenerateRentsButton month={month} />

      {error && (
        <div className="rounded-2xl border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
          {error.message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-soft bg-white shadow-sm">
        <RentsView rents={rents} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  className = "",
}: {
  label: string;
  value: string;
  tone?: "emerald" | "amber";
  className?: string;
}) {
  const color =
    tone === "emerald" ? "text-emerald" : tone === "amber" ? "text-amber" : "text-ink";
  return (
    <div
      className={`min-w-0 rounded-2xl border border-gray-soft bg-white p-3 shadow-sm sm:p-4 ${className}`}
    >
      <p className="text-[10px] text-gray-text sm:text-xs">{label}</p>
      <p className={`mt-1 break-words text-lg font-semibold sm:text-xl ${color}`}>
        {value}
      </p>
    </div>
  );
}
