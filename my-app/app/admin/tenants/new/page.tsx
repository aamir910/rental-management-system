"use client";

import { AddTenantForm } from "@/components/admin/AddTenantForm";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddTenantPage() {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/tenants"
          className="text-xs font-medium text-violet hover:underline"
        >
          ← Back to tenants
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Add Tenant</h1>
        <p className="mt-1 text-sm text-gray-text">
          Create a new tenant profile with property and rent details.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-soft bg-white p-5 shadow-sm sm:p-6">
        <AddTenantForm onDone={() => router.push("/admin/tenants")} />
      </div>
    </div>
  );
}
