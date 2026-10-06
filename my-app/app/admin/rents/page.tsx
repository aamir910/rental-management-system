import { GenerateRentsButton } from "@/components/admin/GenerateRentsButton";
import { MonthSwitcher } from "@/components/admin/MonthSwitcher";
import { RentRowEditor } from "@/components/admin/RentRowEditor";
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Monthly Rents</h1>
          <p className="mt-1 text-sm text-gray-text">
            {formatBillingMonth(billingMonth)} — track incoming payments, remaining dues, and status.
          </p>
        </div>
        <Suspense fallback={null}>
          <MonthSwitcher month={month} />
        </Suspense>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Expected" value={formatPKR(expected)} />
        <Stat label="Collected" value={formatPKR(collected)} tone="emerald" />
        <Stat label="Remaining" value={formatPKR(remaining)} tone="amber" />
      </div>

      <GenerateRentsButton month={month} />

      {error && (
        <div className="rounded-2xl border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
          {error.message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-soft bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
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
              {rents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-text">
                    No rent rows for this month. Click{" "}
                    <strong>Generate this month’s rents</strong> after adding active tenants.
                  </td>
                </tr>
              ) : (
                rents.map((rent) => <RentRowEditor key={rent.id} rent={rent} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "emerald" | "amber";
}) {
  const color =
    tone === "emerald" ? "text-emerald" : tone === "amber" ? "text-amber" : "text-ink";
  return (
    <div className="rounded-2xl border border-gray-soft bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-text">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}
