"use client";

import { useGetMeQuery } from "@/lib/store/api";

export function PlanBadge() {
  const { data } = useGetMeQuery();
  if (!data) return null;

  const isDemo = data.plan === "demo";
  const limitText =
    isDemo && data.tenantLimit != null
      ? `${data.tenantCount}/${data.tenantLimit} tenants`
      : `${data.tenantCount} tenants`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        isDemo
          ? "border-violet/30 bg-violet/10 text-violet"
          : "border-emerald/30 bg-emerald/10 text-emerald"
      }`}
      title={isDemo ? "Free Demo plan" : "Paid plan"}
    >
      {isDemo ? "Free Demo" : "Paid"} · {limitText}
    </span>
  );
}
