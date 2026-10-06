"use client";

import { FormLabel } from "@/components/admin/FormLabel";
import { InlineSpinner } from "@/components/admin/LoadingState";
import { formDataToValues, useCreateReminderMutation } from "@/lib/store/api";
import { rtkErrorMessage } from "@/lib/store/errorMessage";
import { FormEvent, useState } from "react";

export function AddReminderForm() {
  const [error, setError] = useState<string | null>(null);
  const [createReminder, { isLoading }] = useCreateReminderMutation();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError(null);

    try {
      await createReminder(formDataToValues(new FormData(form))).unwrap();
      form.reset();
    } catch (err) {
      setError(rtkErrorMessage(err, "Failed to add reminder."));
    }
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
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-mid disabled:opacity-60"
      >
        {isLoading && <InlineSpinner className="text-white" />}
        {isLoading ? "Saving…" : "Add reminder"}
      </button>
    </form>
  );
}
