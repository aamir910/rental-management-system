"use client";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { InlineSpinner } from "@/components/admin/LoadingState";
import { useDeleteTenantMutation } from "@/lib/store/api";
import { rtkErrorMessage } from "@/lib/store/errorMessage";
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
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTenant, { isLoading }] = useDeleteTenantMutation();

  async function onConfirm() {
    setError(null);
    try {
      await deleteTenant(tenantId).unwrap();
      setOpen(false);
      if (redirectToList) {
        router.push("/admin/tenants");
      }
    } catch (err) {
      setError(rtkErrorMessage(err, "Failed to delete tenant."));
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red/30 bg-red/10 px-3 py-1.5 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-60"
      >
        {isLoading && <InlineSpinner />}
        {isLoading ? "Deleting…" : "Delete"}
      </button>

      <ConfirmDialog
        open={open}
        title={`Delete ${tenantName}?`}
        description="This will permanently remove the tenant and their rent payment records. This cannot be undone."
        loading={isLoading}
        error={error}
        onCancel={() => {
          if (!isLoading) setOpen(false);
        }}
        onConfirm={onConfirm}
      />
    </>
  );
}
