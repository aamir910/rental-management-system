import { MonthSwitcher } from "@/components/admin/MonthSwitcher";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import type { RentPayment, Tenant } from "@/lib/types";
import {
  firstOfMonth,
  formatBillingMonth,
  formatPKR,
  monthInputToBillingDate,
  remainingAmount,
  toMonthInputValue,
} from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

type Props = {
  searchParams: Promise<{ month?: string }>;
};

export default async function AdminDashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const month = params.month || toMonthInputValue(firstOfMonth());
  const billingMonth = monthInputToBillingDate(month);

  const supabase = await createClient();

  const [{ data: tenants }, { data: rents }] = await Promise.all([
    supabase.from("tenants").select("*"),
    supabase
      .from("rent_payments")
      .select("*, tenants(id, name, property_unit, phone, monthly_rent, status)")
      .eq("billing_month", billingMonth),
  ]);

  const tenantList = (tenants ?? []) as Tenant[];
  const rentList = (rents ?? []) as RentPayment[];

  const totalTenants = tenantList.length;
  const activeTenants = tenantList.filter((t) => t.status === "active").length;
  const expected = rentList.reduce((s, r) => s + Number(r.amount_due), 0);
  const collected = rentList.reduce((s, r) => s + Number(r.amount_paid), 0);
  const remaining = remainingAmount(expected, collected);
  const overdue = rentList.filter((r) => r.status === "overdue").length;
  const pending = rentList.filter(
    (r) => r.status === "pending" || r.status === "partial"
  ).length;

  const recentPending = rentList
    .filter((r) => r.status !== "paid")
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Monthly Dashboard</h1>
          <p className="mt-1 text-sm text-gray-text">
            Overview for {formatBillingMonth(billingMonth)}
          </p>
        </div>
        <Suspense fallback={null}>
          <MonthSwitcher month={month} />
        </Suspense>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Kpi label="Total tenants" value={String(totalTenants)} />
        <Kpi label="Active tenants" value={String(activeTenants)} tone="emerald" />
        <Kpi label="Expected rent" value={formatPKR(expected)} />
        <Kpi label="Collected" value={formatPKR(collected)} tone="emerald" />
        <Kpi label="Remaining due" value={formatPKR(remaining)} tone="amber" />
        <Kpi
          label="Pending / Overdue rows"
          value={`${pending} / ${overdue}`}
          tone={overdue > 0 ? "red" : "violet"}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/tenants"
          className="rounded-xl bg-violet px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-soft"
        >
          Manage tenants
        </Link>
        <Link
          href={`/admin/rents?month=${month}`}
          className="rounded-xl border border-gray-soft bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-gray-soft/50"
        >
          Open monthly rents
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-soft bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-soft px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">Outstanding this month</h2>
          <Link
            href={`/admin/rents?month=${month}`}
            className="text-xs font-medium text-violet hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
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
              {recentPending.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-text">
                    No outstanding rents for this month. Generate rents or mark payments in Monthly Rents.
                  </td>
                </tr>
              ) : (
                recentPending.map((rent) => (
                  <tr key={rent.id} className="border-t border-gray-soft/80">
                    <td className="px-4 py-3">
                      <p className="font-medium">{rent.tenants?.name}</p>
                      <p className="text-xs text-gray-text">{rent.tenants?.property_unit}</p>
                    </td>
                    <td className="px-4 py-3">{formatPKR(rent.amount_due)}</td>
                    <td className="px-4 py-3 text-emerald">{formatPKR(rent.amount_paid)}</td>
                    <td className="px-4 py-3 text-amber">
                      {formatPKR(remainingAmount(rent.amount_due, rent.amount_paid))}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "emerald" | "amber" | "red" | "violet";
}) {
  const color =
    tone === "emerald"
      ? "text-emerald"
      : tone === "amber"
        ? "text-amber"
        : tone === "red"
          ? "text-red"
          : tone === "violet"
            ? "text-violet"
            : "text-ink";

  return (
    <div className="rounded-2xl border border-gray-soft bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-text">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}
