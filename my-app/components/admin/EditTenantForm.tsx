"use client";

import { updateTenant } from "@/app/admin/actions";
import { FormLabel } from "@/components/admin/FormLabel";
import type { Tenant } from "@/lib/types";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function EditTenantForm({ tenant }: { tenant: Tenant }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(form);
    const result = await updateTenant(tenant.id, formData);

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-xs text-gray-text">
        Fields marked with <span className="text-red">*</span> are required.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" required defaultValue={tenant.name} />
        <Field label="Phone" name="phone" defaultValue={tenant.phone ?? ""} />
        <Field label="CNIC" name="cnic" defaultValue={tenant.cnic ?? ""} />
        <Field
          label="Property / Unit"
          name="property_unit"
          required
          defaultValue={tenant.property_unit}
        />
        <Field
          label="Monthly rent (Rs.)"
          name="monthly_rent"
          type="number"
          required
          defaultValue={String(tenant.monthly_rent)}
        />
        <Field
          label="Move-in date"
          name="move_in_date"
          type="date"
          defaultValue={tenant.move_in_date ?? ""}
        />
        <Field
          label="Electricity reference (IESCO)"
          name="electricity_ref"
          defaultValue={tenant.electricity_ref ?? ""}
        />
        <Field
          label="Gas reference (SNGPL)"
          name="gas_ref"
          defaultValue={tenant.gas_ref ?? ""}
        />
        <div>
          <FormLabel required>Status</FormLabel>
          <select
            name="status"
            defaultValue={tenant.status}
            required
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div>
        <FormLabel>Notes</FormLabel>
        <textarea
          name="notes"
          rows={3}
          defaultValue={tenant.notes ?? ""}
          className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red/30 bg-red/10 px-3 py-2 text-sm text-red">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-emerald/30 bg-emerald/10 px-3 py-2 text-sm text-emerald">
          Tenant updated.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-violet px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-soft disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <FormLabel required={required}>{label}</FormLabel>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
      />
    </div>
  );
}
