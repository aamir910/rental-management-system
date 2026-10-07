"use client";

import { AddExpenseForm } from "@/components/admin/AddExpenseForm";
import { ExpensesList } from "@/components/admin/ExpensesList";
import {
  ErrorBox,
  FetchingBar,
  SkeletonCard,
} from "@/components/admin/LoadingState";
import { MonthSwitcher } from "@/components/admin/MonthSwitcher";
import { useGetExpensesByMonthQuery } from "@/lib/store/api";
import { rtkErrorMessage } from "@/lib/store/errorMessage";
import {
  firstOfMonth,
  formatBillingMonth,
  formatPKR,
  monthInputToBillingDate,
  toLocalDateKey,
  toMonthInputValue,
} from "@/lib/utils";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

function ExpensesContent() {
  const searchParams = useSearchParams();
  const month =
    searchParams.get("month") || toMonthInputValue(firstOfMonth());
  const billingMonth = monthInputToBillingDate(month);

  const expensesQ = useGetExpensesByMonthQuery(month);
  const isLoading = expensesQ.isLoading;
  const isFetching = expensesQ.isFetching && !isLoading;
  const list = expensesQ.data ?? [];

  const todayKey = toLocalDateKey(new Date().toISOString());

  const todayTotals = useMemo(() => {
    let cashIn = 0;
    let cashOut = 0;
    for (const e of list) {
      if (toLocalDateKey(e.occurred_at) !== todayKey) continue;
      if (e.entry_type === "in") cashIn += Number(e.amount);
      else cashOut += Number(e.amount);
    }
    return { cashIn, cashOut, net: cashIn - cashOut };
  }, [list, todayKey]);

  const monthTotals = useMemo(() => {
    let cashIn = 0;
    let cashOut = 0;
    let handIn = 0;
    let handOut = 0;
    let accountIn = 0;
    let accountOut = 0;
    for (const e of list) {
      const amount = Number(e.amount);
      const isAccount = e.payment_channel === "account";
      if (e.entry_type === "in") {
        cashIn += amount;
        if (isAccount) accountIn += amount;
        else handIn += amount;
      } else {
        cashOut += amount;
        if (isAccount) accountOut += amount;
        else handOut += amount;
      }
    }
    return {
      cashIn,
      cashOut,
      net: cashIn - cashOut,
      handIn,
      handOut,
      handNet: handIn - handOut,
      accountIn,
      accountOut,
      accountNet: accountIn - accountOut,
    };
  }, [list]);

  return (
    <div className="space-y-6">
      <FetchingBar show={isFetching} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Daily Expenses</h1>
          <p className="mt-1 text-sm text-gray-text">
            Track cash in and cash out for{" "}
            {formatBillingMonth(billingMonth)}
          </p>
        </div>
        <MonthSwitcher month={month} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Today · Cash In"
          value={formatPKR(todayTotals.cashIn)}
          tone="in"
        />
        <SummaryCard
          label="Today · Cash Out"
          value={formatPKR(todayTotals.cashOut)}
          tone="out"
        />
        <SummaryCard
          label="Today · Net"
          value={formatPKR(todayTotals.net)}
          tone={todayTotals.net >= 0 ? "in" : "out"}
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-ink">
          This month · Cash in hand & account
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            label="Cash in hand · In"
            value={formatPKR(monthTotals.handIn)}
            tone="in"
          />
          <SummaryCard
            label="Cash in hand · Out"
            value={formatPKR(monthTotals.handOut)}
            tone="out"
          />
          <SummaryCard
            label="Cash in account · In"
            value={formatPKR(monthTotals.accountIn)}
            tone="in"
          />
          <SummaryCard
            label="Cash in account · Out"
            value={formatPKR(monthTotals.accountOut)}
            tone="out"
          />
        </div>
        <div className="mt-3 grid gap-2 rounded-2xl border border-gray-soft bg-white px-4 py-3 text-xs text-gray-text sm:grid-cols-3 sm:text-sm">
          <p>
            Hand net:{" "}
            <span
              className={`font-semibold ${
                monthTotals.handNet >= 0 ? "text-emerald" : "text-red"
              }`}
            >
              {formatPKR(monthTotals.handNet)}
            </span>
          </p>
          <p>
            Account net:{" "}
            <span
              className={`font-semibold ${
                monthTotals.accountNet >= 0 ? "text-emerald" : "text-red"
              }`}
            >
              {formatPKR(monthTotals.accountNet)}
            </span>
          </p>
          <p>
            Month total:{" "}
            <span
              className={`font-semibold ${
                monthTotals.net >= 0 ? "text-emerald" : "text-red"
              }`}
            >
              {formatPKR(monthTotals.net)}
            </span>
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-soft bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-ink">Add entry</h2>
        <p className="mt-1 text-sm text-gray-text">
          Record money coming in or going out with date and time.
        </p>
        <div className="mt-4">
          <AddExpenseForm />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-soft bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-ink">Entries</h2>
        <p className="mt-1 text-sm text-gray-text">
          Grouped by day · newest first
        </p>
        <div className="mt-4">
          {expensesQ.isError ? (
            <ErrorBox
              message={rtkErrorMessage(
                expensesQ.error,
                "Failed to load expenses. If the table is missing, run supabase/migration_daily_expenses.sql."
              )}
            />
          ) : isLoading ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <ExpensesList expenses={list} />
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "in" | "out";
}) {
  return (
    <div className="rounded-2xl border border-gray-soft bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-text">{label}</p>
      <p
        className={`mt-1.5 text-xl font-bold ${
          tone === "in" ? "text-emerald" : "text-red"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-2 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      }
    >
      <ExpensesContent />
    </Suspense>
  );
}
