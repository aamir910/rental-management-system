"use client";

import { createReminder } from "@/app/admin/actions";
import { FormLabel } from "@/components/admin/FormLabel";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AddReminderForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError(null);

    const result = await createReminder(new FormData(form));
    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-xs text-gray-text">
        Fields marked with <span className="text-red">*</span> are required.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormLabel required>Title</FormLabel>
          <input
            name="title"
            required
            placeholder="Pay gas bill / Call plumber"
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          />
        </div>
        <div>
          <FormLabel required>Frequency</FormLabel>
          <select
            name="frequency"
            defaultValue="monthly"
            required
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <FormLabel required>Next due date</FormLabel>
          <input
            name="next_due_date"
            type="date"
            required
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          />
        </div>
        <div className="sm:col-span-2">
          <FormLabel>Note</FormLabel>
          <textarea
            name="body"
            rows={2}
            placeholder="Optional details"
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red/30 bg-red/10 px-3 py-2 text-sm text-red">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-mid disabled:opacity-60"
      >
        {loading ? "Saving…" : "Add reminder"}
      </button>
    </form>
  );
}
