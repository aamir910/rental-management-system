"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function MonthSwitcher({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex w-full items-center gap-2 text-sm text-gray-text sm:w-auto">
      <span className="shrink-0 font-medium">Month</span>
      <input
        type="month"
        value={month}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 rounded-xl border border-gray-soft bg-white px-3 py-2 text-sm text-ink outline-none ring-violet/30 focus:ring-2 sm:flex-none"
      />
    </label>
  );
}
