"use client";

import { DeleteTenantButton } from "@/components/admin/DeleteTenantButton";
import { EditTenantForm } from "@/components/admin/EditTenantForm";
import {
  ErrorBox,
  FetchingBar,
  PageSpinner,
  SkeletonTable,
} from "@/components/admin/LoadingState";
import { RentHistoryList } from "@/components/admin/RentHistoryList";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { UtilityRefCard } from "@/components/admin/UtilityRefCard";
import { BILL_CHECK_LINKS } from "@/lib/bill-links";
import {
  useGetTenantQuery,
  useGetTenantRentsQuery,
} from "@/lib/store/api";
import { rtkErrorMessage } from "@/lib/store/errorMessage";
import { formatDate, formatPKR } from "@/lib/utils";
import Link from "next/link";
import { use } from "react";

type Props = {
  params: Promise<{ id: string }>;
};

export default function TenantDetailPage({ params }: Props) {
  const { id } = use(params);
  const tenantQ = useGetTenantQuery(id);
  const rentsQ = useGetTenantRentsQuery(id);

  const isLoading = tenantQ.isLoading;
  const isFetching =
    (tenantQ.isFetching || rentsQ.isFetching) && !isLoading;

  if (isLoading) {
    return <PageSpinner label="Loading tenant…" />;
  }

  if (tenantQ.isError || !tenantQ.data) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/tenants"
          className="text-xs font-medium text-violet hover:underline"
        >
          ← Back to tenants
        </Link>
        <ErrorBox
          message={rtkErrorMessage(tenantQ.error, "Tenant not found.")}
        />
      </div>
    );
  }

  const t = tenantQ.data;
  const history = rentsQ.data ?? [];

  return (
    <div className="space-y-6">
      <FetchingBar show={isFetching} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/tenants"
            className="text-xs font-medium text-violet hover:underline"
          >
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

      <div>
        <h2 className="mb-3 text-lg font-semibold text-ink">Utility references</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <UtilityRefCard
            title={BILL_CHECK_LINKS.electricity.label}
            reference={t.electricity_ref}
            checkLabel={BILL_CHECK_LINKS.electricity.shortLabel}
            checkUrl={BILL_CHECK_LINKS.electricity.url}
          />
          <UtilityRefCard
            title={BILL_CHECK_LINKS.gas.label}
            reference={t.gas_ref}
            checkLabel={BILL_CHECK_LINKS.gas.shortLabel}
            checkUrl={BILL_CHECK_LINKS.gas.url}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-soft bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">Edit tenant</h2>
        <EditTenantForm tenant={t} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-soft bg-white shadow-sm">
        <div className="border-b border-gray-soft px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">Rent history</h2>
        </div>
        {rentsQ.isLoading ? (
          <SkeletonTable rows={4} />
        ) : rentsQ.isError ? (
          <div className="p-4">
            <ErrorBox
              message={rtkErrorMessage(rentsQ.error, "Failed to load rent history.")}
            />
          </div>
        ) : (
          <RentHistoryList history={history} />
        )}
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
