"use client";

import { GenerateRentsButton } from "@/components/admin/GenerateRentsButton";
import {
  ErrorBox,
  FetchingBar,
  SkeletonCard,
  SkeletonTable,
} from "@/components/admin/LoadingState";
import { MonthSwitcher } from "@/components/admin/MonthSwitcher";
import { RentsView } from "@/components/admin/RentsView";
import { useGetRentsByMonthQuery } from "@/lib/store/api";
import { rtkErrorMessage } from "@/lib/store/errorMessage";
import {
  firstOfMonth,
  formatBillingMonth,
  formatPKR,
  monthInputToBillingDate,
  remainingAmount,
  toMonthInputValue,
} from "@/lib/utils";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function RentsPageContent() {
  const searchParams = useSearchParams();
  const month =
    searchParams.get("month") || toMonthInputValue(firstOfMonth());
  const billingMonth = monthInputToBillingDate(month);

  const { data: rents = [], isLoading, isFetching, isError, error } =
    useGetRentsByMonthQuery(month);

  const expected = rents.reduce((s, r) => s + Number(r.amount_due), 0);
  const collected = rents.reduce((s, r) => s + Number(r.amount_paid), 0);
  const remaining = remainingAmount(expected, collected);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
      <FetchingBar show={isFetching && !isLoading} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-ink sm:text-2xl">
            Monthly Rents
          </h1>
          <p className="mt-1 text-sm text-gray-text">
            {formatBillingMonth(billingMonth)} — track incoming payments,
            remaining dues, and status.
          </p>
        </div>
        <MonthSwitcher month={month} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Stat label="Expected" value={formatPKR(expected)} />
            <Stat label="Collected" value={formatPKR(collected)} tone="emerald" />
            <Stat
              label="Remaining"
              value={formatPKR(remaining)}
              tone="amber"
              className="col-span-2 sm:col-span-1"
            />
          </>
        )}
      </div>

      <GenerateRentsButton month={month} />

      {isError && (
        <ErrorBox message={rtkErrorMessage(error, "Failed to load rents.")} />
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-soft bg-white shadow-sm">
        {isLoading ? <SkeletonTable rows={6} /> : <RentsView rents={rents} />}
      </div>
    </div>
  );
}

export default function RentsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl">
          <SkeletonTable rows={8} />
        </div>
      }
    >
      <RentsPageContent />
    </Suspense>
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
