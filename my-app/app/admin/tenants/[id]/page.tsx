import { DeleteTenantButton } from "@/components/admin/DeleteTenantButton";
import { EditTenantForm } from "@/components/admin/EditTenantForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import type { RentPayment, Tenant } from "@/lib/types";
import {
  formatBillingMonth,
  formatDate,
  formatPKR,
  remainingAmount,
} from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TenantDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !tenant) notFound();

  const { data: rents } = await supabase
    .from("rent_payments")
    .select("*")
    .eq("tenant_id", id)
    .order("billing_month", { ascending: false });

  const t = tenant as Tenant;
  const history = (rents ?? []) as RentPayment[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/tenants" className="text-xs font-medium text-violet hover:underline">
            ← Back to tenants
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-ink">{t.name}</h1>
          <p className="mt-1 text-sm text-gray-text">{t.property_unit}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={t.status} />
          <DeleteTenantButton
            tenantId={t.id}
            tenantName={t.name}
            redirectToList
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Monthly rent" value={formatPKR(t.monthly_rent)} />
        <InfoCard label="Phone" value={t.phone || "—"} />
        <InfoCard label="CNIC" value={t.cnic || "—"} />
        <InfoCard label="Move-in" value={formatDate(t.move_in_date)} />
      </div>

      <div className="rounded-2xl border border-gray-soft bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">Edit tenant</h2>
        <EditTenantForm tenant={t} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-soft bg-white shadow-sm">
        <div className="border-b border-gray-soft px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">Rent history</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-gray-text">
              <tr>
                <th className="px-4 py-3 font-semibold">Month</th>
                <th className="px-4 py-3 font-semibold">Due</th>
                <th className="px-4 py-3 font-semibold">Paid</th>
                <th className="px-4 py-3 font-semibold">Remaining</th>
                <th className="px-4 py-3 font-semibold">Due date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-text">
                    No rent rows yet. Generate this month from Monthly Rents.
                  </td>
                </tr>
              ) : (
                history.map((rent) => (
                  <tr key={rent.id} className="border-t border-gray-soft/80">
                    <td className="px-4 py-3 font-medium">
                      {formatBillingMonth(rent.billing_month)}
                    </td>
                    <td className="px-4 py-3">{formatPKR(rent.amount_due)}</td>
                    <td className="px-4 py-3 text-emerald">{formatPKR(rent.amount_paid)}</td>
                    <td className="px-4 py-3 text-amber">
                      {formatPKR(remainingAmount(rent.amount_due, rent.amount_paid))}
                    </td>
                    <td className="px-4 py-3">{formatDate(rent.due_date)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={rent.status} />
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

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-soft bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-text">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
