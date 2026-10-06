"use client";

import { InlineSpinner } from "@/components/admin/LoadingState";
import { useGenerateMonthRentsMutation } from "@/lib/store/api";
import { rtkErrorMessage } from "@/lib/store/errorMessage";
import { useState } from "react";

export function GenerateRentsButton({ month }: { month: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [generate, { isLoading }] = useGenerateMonthRentsMutation();

  async function onClick() {
    setMessage(null);
    try {
      const result = await generate(month).unwrap();
      setMessage(`Generated ${result.created ?? 0} new rent row(s).`);
    } catch (err) {
      setMessage(rtkErrorMessage(err, "Failed to generate rents."));
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-mid disabled:opacity-60"
      >
        {isLoading && <InlineSpinner className="text-white" />}
        {isLoading ? "Generating…" : "Generate this month’s rents"}
      </button>
      {message && <p className="text-xs text-gray-text">{message}</p>}
    </div>
  );
}
