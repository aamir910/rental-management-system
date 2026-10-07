"use client";

import {
  ErrorBox,
  FetchingBar,
  SkeletonTable,
} from "@/components/admin/LoadingState";
import { TenantsView } from "@/components/admin/TenantsView";
import { useGetTenantsQuery } from "@/lib/store/api";
import { rtkErrorMessage } from "@/lib/store/errorMessage";
import Link from "next/link";

export default function TenantsPage() {
  const { data: tenants = [], isLoading, isFetching, isError, error } =
    useGetTenantsQuery();

  return (
    <div className="space-y-6">
      <FetchingBar show={isFetching && !isLoading} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Tenants</h1>
          <p className="mt-1 text-sm text-gray-text">
            Manage tenant profiles, property units, and rent amounts.
          </p>
        </div>
        <Link
          href="/admin/tenants/new"
          className="rounded-xl bg-violet px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-soft"
        >
          Add Tenant
        </Link>
      </div>

      {isError && (
        <ErrorBox message={rtkErrorMessage(error, "Failed to load tenants.")} />
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-soft bg-white shadow-sm">
        {isLoading ? <SkeletonTable rows={6} /> : <TenantsView tenants={tenants} />}
      </div>
    </div>
  );
}
