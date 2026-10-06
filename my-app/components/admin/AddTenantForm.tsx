"use client";

import { createTenant } from "@/app/admin/actions";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

export function AddTenantForm({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(form);
      const result = await createTenant(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      formRef.current?.reset();
      onDone?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add tenant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" required />
        <Field label="Phone" name="phone" />
        <Field label="CNIC" name="cnic" placeholder="xxxxx-xxxxxxx-x" />
        <Field
          label="Property / Unit"
          name="property_unit"
          required
          placeholder="House 12 - Portion A"
        />
        <Field
          label="Monthly rent (Rs.)"
          name="monthly_rent"
          type="number"
          required
          defaultValue="0"
        />
        <Field label="Move-in date" name="move_in_date" type="date" />
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-text">Status</label>
          <select
            name="status"
            defaultValue="active"
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-text">Notes</label>
        <textarea
          name="notes"
          rows={3}
          className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
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
        {loading ? "Saving…" : "Add Tenant"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-text">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
      />
    </div>
  );
}
