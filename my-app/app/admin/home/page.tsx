import { AddReminderForm } from "@/components/admin/AddReminderForm";
import { AddUtilityBillForm } from "@/components/admin/AddUtilityBillForm";
import { MonthSwitcher } from "@/components/admin/MonthSwitcher";
import { RemindersList } from "@/components/admin/RemindersList";
import { UtilityBillsList } from "@/components/admin/UtilityBillsList";
import { createClient } from "@/lib/supabase/server";
import type { Reminder, Tenant, UtilityBill } from "@/lib/types";
import {
  firstOfMonth,
  formatBillingMonth,
  formatPKR,
  monthInputToBillingDate,
  toMonthInputValue,
} from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

type Props = {
  searchParams: Promise<{ month?: string }>;
};

export default async function AdminHomePage({ searchParams }: Props) {
  const params = await searchParams;
  const month = params.month || toMonthInputValue(firstOfMonth());
  const billingMonth = monthInputToBillingDate(month);

  const supabase = await createClient();

  const [{ data: tenants }, { data: bills, error: billsError }, { data: reminders }] =
    await Promise.all([
      supabase
        .from("tenants")
        .select("*")
        .eq("status", "active")
        .order("name", { ascending: true }),
      supabase
        .from("utility_bills")
        .select(
          "*, tenants(id, name, property_unit, electricity_ref, gas_ref)"
        )
        .eq("billing_month", billingMonth)
        .order("created_at", { ascending: false }),
      supabase
        .from("reminders")
        .select("*")
        .order("next_due_date", { ascending: true }),
    ]);

  const tenantList = (tenants ?? []) as Tenant[];
  const billList = (bills ?? []) as UtilityBill[];
  const reminderList = (reminders ?? []) as Reminder[];

  const pending = billList.filter((b) => b.status === "pending");
  const success = billList.filter((b) => b.status === "success");
  const totalAmount = billList.reduce((s, b) => s + Number(b.amount), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Home</h1>
          <p className="mt-1 text-sm text-gray-text">
            Utility bills and reminders for {formatBillingMonth(billingMonth)}
          </p>
        </div>
        <Suspense fallback={null}>
          <MonthSwitcher month={month} />
        </Suspense>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="rounded-xl border border-gray-soft bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-soft/50"
        >
          Rent dashboard
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
          <Stat label="Pending" value={String(pending.length)} tone="amber" />
          <Stat label="Success" value={String(success.length)} tone="emerald" />
          <Stat label="Total amount" value={formatPKR(totalAmount)} />
        </div>

        {billsError && (
          <div className="rounded-2xl border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
            {billsError.message}. If tables are missing, run{" "}
            <code>supabase/migration_home_utilities_reminders.sql</code> in Supabase.
          </div>
        )}

        <div className="rounded-2xl border border-gray-soft bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-4 text-sm font-semibold text-ink">Add gas / electricity bill</h3>
          <AddUtilityBillForm tenants={tenantList} month={month} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-soft bg-white shadow-sm">
          <UtilityBillsList bills={billList} />
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
          <RemindersList reminders={reminderList} />
        </div>
      </section>
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
