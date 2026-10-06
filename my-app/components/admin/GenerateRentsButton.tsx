"use client";

import { generateMonthRents } from "@/app/admin/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function GenerateRentsButton({ month }: { month: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setMessage(null);
    const result = await generateMonthRents(month);
    setLoading(false);

    if (result?.error) {
      setMessage(result.error);
      return;
    }

    setMessage(`Generated ${result.created ?? 0} new rent row(s).`);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-mid disabled:opacity-60"
      >
        {loading ? "Generating…" : "Generate this month’s rents"}
      </button>
      {message && <p className="text-xs text-gray-text">{message}</p>}
    </div>
  );
}
