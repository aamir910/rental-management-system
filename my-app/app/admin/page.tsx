import { MonthSwitcher } from "@/components/admin/MonthSwitcher";
import { OutstandingRentsList } from "@/components/admin/OutstandingRentsList";
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

  const outstanding = rentList.filter((r) => r.status !== "paid");

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
        <OutstandingRentsList rents={outstanding} />
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
