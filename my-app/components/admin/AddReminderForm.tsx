"use client";

import { createReminder } from "@/app/admin/actions";
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-gray-text">Title</label>
          <input
            name="title"
            required
            placeholder="Pay gas bill / Call plumber"
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-text">
            Frequency
          </label>
          <select
            name="frequency"
            defaultValue="monthly"
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-text">
            Next due date
          </label>
          <input
            name="next_due_date"
            type="date"
            required
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-gray-text">Note</label>
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
