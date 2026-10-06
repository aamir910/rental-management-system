"use client";

import { InlineSpinner } from "@/components/admin/LoadingState";
import { useDeleteTenantMutation } from "@/lib/store/api";
import { rtkErrorMessage } from "@/lib/store/errorMessage";
import { useRouter } from "next/navigation";

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
  const [deleteTenant, { isLoading }] = useDeleteTenantMutation();

  async function onDelete() {
    const ok = window.confirm(
      `Delete tenant "${tenantName}"?\n\nThis will also remove their rent payment records.`
    );
    if (!ok) return;

    try {
      await deleteTenant(tenantId).unwrap();
      if (redirectToList) {
        router.push("/admin/tenants");
      }
    } catch (err) {
      window.alert(rtkErrorMessage(err, "Failed to delete tenant."));
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red/30 bg-red/10 px-3 py-1.5 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-60"
    >
      {isLoading && <InlineSpinner />}
      {isLoading ? "Deleting…" : "Delete"}
    </button>
  );
}
