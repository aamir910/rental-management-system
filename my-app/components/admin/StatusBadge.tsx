import { statusBadgeClass } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${statusBadgeClass(status)}`}
    >
      {status}
    </span>
  );
}
