"use client";

import { deleteTenant } from "@/app/admin/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteTenantButton({
  tenantId,
  tenantName,
  redirectToList = false,
}: {
  tenantId: string;
  tenantName: string;
  redirectToList?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    const ok = window.confirm(
      `Delete tenant "${tenantName}"?\n\nThis will also remove their rent payment records.`
    );
    if (!ok) return;

    setLoading(true);
    const result = await deleteTenant(tenantId);
    setLoading(false);

    if (result?.error) {
      window.alert(result.error);
      return;
    }

    if (redirectToList) {
      router.push("/admin/tenants");
      router.refresh();
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={loading}
      className="rounded-lg border border-red/30 bg-red/10 px-3 py-1.5 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-60"
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}
