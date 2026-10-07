"use client";

import {
  ErrorBox,
  FetchingBar,
  SkeletonCard,
  SkeletonTable,
} from "@/components/admin/LoadingState";
import { MonthSwitcher } from "@/components/admin/MonthSwitcher";
import {
  useGetExpensesByMonthQuery,
  useGetRentsByMonthQuery,
} from "@/lib/store/api";
import { rtkErrorMessage } from "@/lib/store/errorMessage";
import {
  firstOfMonth,
  formatBillingMonth,
  formatPKR,
  monthInputToBillingDate,
  remainingAmount,
  toMonthInputValue,
} from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const month =
    searchParams.get("month") || toMonthInputValue(firstOfMonth());
  const billingMonth = monthInputToBillingDate(month);

  const rentsQ = useGetRentsByMonthQuery(month);
  const expensesQ = useGetExpensesByMonthQuery(month);

  const isLoading = rentsQ.isLoading || expensesQ.isLoading;
  const isFetching =
    (rentsQ.isFetching || expensesQ.isFetching) && !isLoading;
  const error = rentsQ.error || expensesQ.error;

  const rentList = rentsQ.data ?? [];
  const expenseList = expensesQ.data ?? [];

  const stats = useMemo(() => {
    const rentCollected = rentList.reduce(
      (s, r) => s + Number(r.amount_paid),
      0
    );
    const expected = rentList.reduce((s, r) => s + Number(r.amount_due), 0);
    const rentRemaining = remainingAmount(expected, rentCollected);

    let cashInHand = 0;
    let cashInAccount = 0;

    for (const r of rentList) {
      const paid = Number(r.amount_paid);
      if (paid <= 0) continue;
      if (r.payment_channel === "account") cashInAccount += paid;
      else cashInHand += paid; // cash or unset → treat as cash in hand
    }

    let totalExpenses = 0;
    for (const e of expenseList) {
      const amount = Number(e.amount);
      const isAccount = e.payment_channel === "account";
      if (e.entry_type === "in") {
        if (isAccount) cashInAccount += amount;
        else cashInHand += amount;
      } else {
        totalExpenses += amount;
        if (isAccount) cashInAccount -= amount;
        else cashInHand -= amount;
      }
    }

    return {
      cashInHand,
      cashInAccount,
      rentCollected,
      rentRemaining,
      totalExpenses,
    };
  }, [rentList, expenseList]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
      <FetchingBar show={isFetching} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-ink sm:text-2xl">
            Monthly Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-text">
            Overview for {formatBillingMonth(billingMonth)}
          </p>
        </div>
        <MonthSwitcher month={month} />
      </div>

      {error && (
        <ErrorBox
          message={rtkErrorMessage(error, "Failed to load dashboard.")}
        />
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <Kpi
              label="Cash in hand"
              value={formatPKR(stats.cashInHand)}
              tone="emerald"
            />
            <Kpi
              label="Cash in account"
              value={formatPKR(stats.cashInAccount)}
              tone="violet"
            />
            <Kpi
              label="Rent collected"
              value={formatPKR(stats.rentCollected)}
              tone="emerald"
            />
            <Kpi
              label="Rent remaining"
              value={formatPKR(stats.rentRemaining)}
              tone="amber"
            />
            <Kpi
              label="Total expenses"
              value={formatPKR(stats.totalExpenses)}
              tone="red"
              className="col-span-2 lg:col-span-1"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href={`/admin/rents?month=${month}`}
          className="inline-flex items-center justify-center rounded-xl bg-violet px-4 py-3 text-sm font-semibold text-white hover:bg-violet-soft"
        >
          Monthly rents
        </Link>
        <Link
          href={`/admin/expenses?month=${month}`}
          className="inline-flex items-center justify-center rounded-xl border border-gray-soft bg-white px-4 py-3 text-sm font-semibold text-ink hover:bg-gray-soft/50"
        >
          Daily expenses
        </Link>
        <Link
          href="/admin/tenants"
          className="inline-flex items-center justify-center rounded-xl border border-gray-soft bg-white px-4 py-3 text-sm font-semibold text-ink hover:bg-gray-soft/50"
        >
          Tenants
        </Link>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<SkeletonTable rows={8} />}>
      <DashboardContent />
    </Suspense>
  );
}

function Kpi({
  label,
  value,
  tone,
  className = "",
}: {
  label: string;
  value: string;
  tone?: "emerald" | "amber" | "red" | "violet";
  className?: string;
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
    <div
      className={`min-w-0 rounded-2xl border border-gray-soft bg-white p-3 shadow-sm sm:p-5 ${className}`}
    >
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
