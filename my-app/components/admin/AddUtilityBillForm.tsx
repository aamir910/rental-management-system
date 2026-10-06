"use client";

import { createUtilityBill } from "@/app/admin/actions";
import { FormLabel } from "@/components/admin/FormLabel";
import type { Tenant } from "@/lib/types";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";

export function AddUtilityBillForm({
  tenants,
  month,
}: {
  tenants: Tenant[];
  month: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [utilityType, setUtilityType] = useState<"electricity" | "gas">("electricity");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selected = useMemo(
    () => tenants.find((t) => t.id === tenantId),
    [tenants, tenantId]
  );

  const autoRef =
    utilityType === "electricity"
      ? selected?.electricity_ref ?? ""
      : selected?.gas_ref ?? "";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(form);
      formData.set("month", month);
      const result = await createUtilityBill(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      formRef.current?.reset();
      setUtilityType("electricity");
      if (tenants[0]) setTenantId(tenants[0].id);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (tenants.length === 0) {
    return (
      <p className="rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-amber">
        Add at least one tenant before creating utility bills.
      </p>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      <p className="text-xs text-gray-text">
        Fields marked with <span className="text-red">*</span> are required.
      </p>
      <input type="hidden" name="month" value={month} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <FormLabel required>Tenant</FormLabel>
          <select
            name="tenant_id"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.property_unit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FormLabel required>Utility type</FormLabel>
          <select
            name="utility_type"
            value={utilityType}
            onChange={(e) =>
              setUtilityType(e.target.value as "electricity" | "gas")
            }
            required
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          >
            <option value="electricity">Electricity (IESCO)</option>
            <option value="gas">Gas (SNGPL)</option>
          </select>
        </div>

        <div>
          <FormLabel required>Amount (Rs.)</FormLabel>
          <input
            name="amount"
            type="number"
            required
            min={0}
            step="1"
            defaultValue={0}
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          />
        </div>

        <div>
          <FormLabel>Due date</FormLabel>
          <input
            name="due_date"
            type="date"
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          />
        </div>

        <div>
          <FormLabel>Reference number</FormLabel>
          <input
            key={`${tenantId}-${utilityType}-${autoRef}`}
            name="reference_snapshot"
            defaultValue={autoRef}
            placeholder="Auto-filled from tenant"
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          />
        </div>

        <div>
          <FormLabel required>Status</FormLabel>
          <select
            name="status"
            defaultValue="pending"
            required
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          >
            <option value="pending">Pending</option>
            <option value="success">Success</option>
          </select>
        </div>
      </div>

      <div>
        <FormLabel>Notes</FormLabel>
        <input
          name="notes"
          className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          placeholder="Optional"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red/30 bg-red/10 px-3 py-2 text-sm text-red">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-violet px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-soft disabled:opacity-60"
      >
        {loading ? "Saving…" : "Add utility bill"}
      </button>
    </form>
  );
}
