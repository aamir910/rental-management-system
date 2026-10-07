"use client";

import { FormLabel } from "@/components/admin/FormLabel";
import { InlineSpinner } from "@/components/admin/LoadingState";
import { formDataToValues, useCreateExpenseMutation } from "@/lib/store/api";
import { rtkErrorMessage } from "@/lib/store/errorMessage";
import type { ExpenseEntryType } from "@/lib/types";
import { toDateTimeLocalValue } from "@/lib/utils";
import { FormEvent, useState } from "react";

export function AddExpenseForm() {
  const [error, setError] = useState<string | null>(null);
  const [entryType, setEntryType] = useState<ExpenseEntryType>("out");
  const [createExpense, { isLoading }] = useCreateExpenseMutation();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError(null);

    try {
      const values = formDataToValues(new FormData(form));
      values.entry_type = entryType;
      await createExpense(values).unwrap();
      form.reset();
      setEntryType("out");
      const dt = form.elements.namedItem("occurred_at") as HTMLInputElement | null;
      if (dt) dt.value = toDateTimeLocalValue();
    } catch (err) {
      setError(rtkErrorMessage(err, "Failed to add entry."));
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-xs text-gray-text">
        Fields marked with <span className="text-red">*</span> are required.
      </p>

      <div>
        <FormLabel required>Type</FormLabel>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setEntryType("in")}
            className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
              entryType === "in"
                ? "border-emerald/40 bg-emerald/15 text-emerald"
                : "border-gray-soft bg-white text-gray-text hover:border-emerald/30"
            }`}
          >
            Cash In
          </button>
          <button
            type="button"
            onClick={() => setEntryType("out")}
            className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
              entryType === "out"
                ? "border-red/40 bg-red/10 text-red"
                : "border-gray-soft bg-white text-gray-text hover:border-red/30"
            }`}
          >
            Cash Out
          </button>
        </div>
        <input type="hidden" name="entry_type" value={entryType} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FormLabel required>Amount (Rs.)</FormLabel>
          <input
            name="amount"
            type="number"
            min="1"
            step="1"
            required
            placeholder="500"
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          />
        </div>
        <div>
          <FormLabel required>Date & time</FormLabel>
          <input
            name="occurred_at"
            type="datetime-local"
            required
            defaultValue={toDateTimeLocalValue()}
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          />
        </div>
        <div className="sm:col-span-2">
          <FormLabel required>Title</FormLabel>
          <input
            name="title"
            required
            placeholder="Groceries / Rent received / Fuel"
            className="w-full rounded-xl border border-gray-soft bg-white px-3 py-2.5 text-sm outline-none ring-violet/30 focus:ring-2"
          />
        </div>
        <div className="sm:col-span-2">
          <FormLabel>Notes</FormLabel>
          <textarea
            name="notes"
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-mid disabled:opacity-60 sm:w-auto"
      >
        {isLoading && <InlineSpinner className="text-white" />}
        {isLoading
          ? "Saving…"
          : entryType === "in"
            ? "Add cash in"
            : "Add cash out"}
      </button>
    </form>
  );
}
