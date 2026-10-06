export function formatPKR(amount: number | string | null | undefined) {
  const n = Number(amount ?? 0);
  return `Rs. ${n.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function firstOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function toMonthInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Convert YYYY-MM to first-of-month ISO date string YYYY-MM-01 */
export function monthInputToBillingDate(monthValue: string) {
  const [y, m] = monthValue.split("-").map(Number);
  return `${y}-${String(m).padStart(2, "0")}-01`;
}

export function formatBillingMonth(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString("en-PK", { month: "long", year: "numeric" });
}

export function formatDate(isoDate: string | null | undefined) {
  if (!isoDate) return "—";
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function remainingAmount(due: number, paid: number) {
  return Math.max(0, Number(due) - Number(paid));
}

export function statusBadgeClass(status: string) {
  switch (status) {
    case "paid":
    case "active":
      return "bg-emerald/15 text-emerald border-emerald/25";
    case "partial":
      return "bg-amber/15 text-amber border-amber/25";
    case "overdue":
    case "inactive":
      return "bg-red/15 text-red border-red/25";
    case "pending":
    default:
      return "bg-violet/15 text-violet border-violet/25";
  }
}
