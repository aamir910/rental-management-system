"use client";

import { AddReminderForm } from "@/components/admin/AddReminderForm";
import { AddUtilityBillForm } from "@/components/admin/AddUtilityBillForm";
import {
  ErrorBox,
  FetchingBar,
  SkeletonCard,
  SkeletonTable,
} from "@/components/admin/LoadingState";
import { MonthSwitcher } from "@/components/admin/MonthSwitcher";
import { RemindersList } from "@/components/admin/RemindersList";
import { UtilityBillsList } from "@/components/admin/UtilityBillsList";
import {
  useGetActiveTenantsQuery,
  useGetRemindersQuery,
  useGetUtilityBillsByMonthQuery,
} from "@/lib/store/api";
import { rtkErrorMessage } from "@/lib/store/errorMessage";
import {
  firstOfMonth,
  formatBillingMonth,
  formatPKR,
  monthInputToBillingDate,
  toMonthInputValue,
} from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function HomeContent() {
  const searchParams = useSearchParams();
  const month =
    searchParams.get("month") || toMonthInputValue(firstOfMonth());
  const billingMonth = monthInputToBillingDate(month);

  const tenantsQ = useGetActiveTenantsQuery();
  const billsQ = useGetUtilityBillsByMonthQuery(month);
  const remindersQ = useGetRemindersQuery();

  const isLoading =
    tenantsQ.isLoading || billsQ.isLoading || remindersQ.isLoading;
  const isFetching =
    (tenantsQ.isFetching || billsQ.isFetching || remindersQ.isFetching) &&
    !isLoading;

  const tenantList = tenantsQ.data ?? [];
  const billList = billsQ.data ?? [];
  const reminderList = remindersQ.data ?? [];

  const pending = billList.filter((b) => b.status === "pending");
  const success = billList.filter((b) => b.status === "success");
  const totalAmount = billList.reduce((s, b) => s + Number(b.amount), 0);

  return (
    <div className="space-y-8">
      <FetchingBar show={isFetching} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Home</h1>
          <p className="mt-1 text-sm text-gray-text">
            Utility bills and reminders for {formatBillingMonth(billingMonth)}
          </p>
        </div>
        <MonthSwitcher month={month} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin"
          className="rounded-xl border border-gray-soft bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-soft/50"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/tenants"
          className="rounded-xl border border-gray-soft bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-soft/50"
        >
          Tenants
        </Link>
        <Link
          href={`/admin/rents?month=${month}`}
          className="rounded-xl border border-gray-soft bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-soft/50"
        >
          Monthly rents
        </Link>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">Monthly utility bills</h2>

        <div className="grid gap-3 sm:grid-cols-3">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <Stat label="Pending" value={String(pending.length)} tone="amber" />
              <Stat label="Success" value={String(success.length)} tone="emerald" />
              <Stat label="Total amount" value={formatPKR(totalAmount)} />
            </>
          )}
        </div>

        {billsQ.isError && (
          <ErrorBox
            message={rtkErrorMessage(
              billsQ.error,
              "Failed to load utility bills. If tables are missing, run supabase/APPLY_BILLS_AND_HOME.sql."
            )}
          />
        )}

        <div className="rounded-2xl border border-gray-soft bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-4 text-sm font-semibold text-ink">
            Add gas / electricity bill
          </h3>
          <AddUtilityBillForm tenants={tenantList} month={month} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-soft bg-white shadow-sm">
          {billsQ.isLoading ? (
            <SkeletonTable rows={4} />
          ) : (
            <UtilityBillsList bills={billList} />
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">Reminders</h2>
        <p className="text-sm text-gray-text">
          Daily, weekly, and monthly notes for your personal admin checklist.
        </p>

        <div className="rounded-2xl border border-gray-soft bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-4 text-sm font-semibold text-ink">Add reminder</h3>
          <AddReminderForm />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-soft bg-white p-5 shadow-sm sm:p-6">
          {remindersQ.isLoading ? (
            <SkeletonTable rows={3} />
          ) : (
            <RemindersList reminders={reminderList} />
          )}
        </div>
      </section>
    </div>
  );
}

export default function AdminHomePage() {
  return (
    <Suspense fallback={<SkeletonTable rows={8} />}>
      <HomeContent />
    </Suspense>
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
