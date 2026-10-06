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
    <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-ink sm:text-2xl">
            Monthly Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-text">
            Overview for {formatBillingMonth(billingMonth)}
          </p>
        </div>
        <Suspense fallback={null}>
          <MonthSwitcher month={month} />
        </Suspense>
      </div>

      {/* Mobile: 2-col grid; tablet: 2-col; desktop: 3-col */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <Kpi label="Total tenants" value={String(totalTenants)} />
        <Kpi label="Active tenants" value={String(activeTenants)} tone="emerald" />
        <Kpi label="Expected rent" value={formatPKR(expected)} />
        <Kpi label="Collected" value={formatPKR(collected)} tone="emerald" />
        <Kpi label="Remaining due" value={formatPKR(remaining)} tone="amber" />
        <Kpi
          label="Pending / Overdue"
          value={`${pending} / ${overdue}`}
          tone={overdue > 0 ? "red" : "violet"}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/admin/tenants"
          className="inline-flex items-center justify-center rounded-xl bg-violet px-4 py-3 text-sm font-semibold text-white hover:bg-violet-soft"
        >
          Manage tenants
        </Link>
        <Link
          href={`/admin/rents?month=${month}`}
          className="inline-flex items-center justify-center rounded-xl border border-gray-soft bg-white px-4 py-3 text-sm font-semibold text-ink hover:bg-gray-soft/50"
        >
          Open monthly rents
        </Link>
      </div>

      <section className="rounded-2xl border border-gray-soft bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-gray-soft px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold text-ink sm:text-lg">
            Outstanding this month
          </h2>
          <Link
            href={`/admin/rents?month=${month}`}
            className="shrink-0 text-xs font-medium text-violet hover:underline"
          >
            View all
          </Link>
        </div>

        {recentPending.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-text sm:px-5">
            No outstanding rents for this month. Generate rents or mark payments
            in Monthly Rents.
          </p>
        ) : (
          <>
            {/* Mobile card grid */}
            <div className="grid grid-cols-1 gap-3 p-4 sm:hidden">
              {recentPending.map((rent) => (
                <article
                  key={rent.id}
                  className="rounded-xl border border-gray-soft bg-surface/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">
                        {rent.tenants?.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-text">
                        {rent.tenants?.property_unit}
                      </p>
                    </div>
                    <StatusBadge status={rent.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-white px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-gray-text">
                        Due
                      </p>
                      <p className="font-medium text-ink">
                        {formatPKR(rent.amount_due)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-gray-text">
                        Paid
                      </p>
                      <p className="font-medium text-emerald">
                        {formatPKR(rent.amount_paid)}
                      </p>
                    </div>
                    <div className="col-span-2 rounded-lg bg-white px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-gray-text">
                        Remaining
                      </p>
                      <p className="font-semibold text-amber">
                        {formatPKR(
                          remainingAmount(rent.amount_due, rent.amount_paid)
                        )}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/admin/tenants/${rent.tenant_id}`}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-gray-soft bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-gray-soft/60"
                  >
                    View detail
                  </Link>
                </article>
              ))}
            </div>

            {/* Desktop / tablet table */}
            <div className="hidden overflow-x-auto sm:block">
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
                  {recentPending.map((rent) => (
                    <tr key={rent.id} className="border-t border-gray-soft/80">
                      <td className="px-4 py-3">
                        <p className="font-medium">{rent.tenants?.name}</p>
                        <p className="text-xs text-gray-text">
                          {rent.tenants?.property_unit}
                        </p>
                      </td>
                      <td className="px-4 py-3">{formatPKR(rent.amount_due)}</td>
                      <td className="px-4 py-3 text-emerald">
                        {formatPKR(rent.amount_paid)}
                      </td>
                      <td className="px-4 py-3 text-amber">
                        {formatPKR(
                          remainingAmount(rent.amount_due, rent.amount_paid)
                        )}
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
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
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
    <div className="min-w-0 rounded-2xl border border-gray-soft bg-white p-3 shadow-sm sm:p-5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-text sm:text-xs">
        {label}
      </p>
      <p
        className={`mt-1.5 break-words text-lg font-semibold leading-tight sm:mt-2 sm:text-2xl ${color}`}
      >
        {value}
      </p>
    </div>
  );
}
