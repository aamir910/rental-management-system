import type {
  ExpenseEntry,
  Reminder,
  ReminderFrequency,
  RentPayment,
  RentStatus,
  Tenant,
  UtilityBill,
  UtilityBillStatus,
} from "@/lib/types";

export type FormValues = Record<string, string>;

export type AdapterContext = {
  ownerId: string;
  plan: "demo" | "paid";
};

export type DataAdapter = {
  countTenants(): Promise<number>;
  listTenants(): Promise<Tenant[]>;
  listActiveTenants(): Promise<Tenant[]>;
  getTenant(id: string): Promise<Tenant | null>;
  createTenant(values: FormValues): Promise<Tenant>;
  updateTenant(id: string, values: FormValues): Promise<void>;
  deleteTenant(id: string): Promise<void>;
  listRentsByMonth(monthValue: string): Promise<RentPayment[]>;
  listTenantRents(tenantId: string): Promise<RentPayment[]>;
  updateRentPayment(
    rentId: string,
    data: {
      amount_paid?: number;
      due_date?: string;
      status?: RentStatus;
      notes?: string | null;
    }
  ): Promise<void>;
  generateMonthRents(monthValue: string): Promise<number>;
  listUtilityBillsByMonth(monthValue: string): Promise<UtilityBill[]>;
  createUtilityBill(values: FormValues): Promise<void>;
  updateUtilityBillStatus(
    billId: string,
    status: UtilityBillStatus
  ): Promise<void>;
  deleteUtilityBill(billId: string): Promise<void>;
  listReminders(): Promise<Reminder[]>;
  createReminder(values: FormValues): Promise<void>;
  toggleReminderDone(reminderId: string, isDone: boolean): Promise<void>;
  deleteReminder(reminderId: string): Promise<void>;
  listExpensesByMonth(monthValue: string): Promise<ExpenseEntry[]>;
  createExpense(values: FormValues): Promise<void>;
  deleteExpense(expenseId: string): Promise<void>;
};

export function parseExpenseOccurredAt(value: string): string {
  const raw = String(value || "").trim();
  if (!raw) throw new Error("Date and time are required.");
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date and time.");
  return d.toISOString();
}

export function monthRangeIso(monthValue: string): { start: string; end: string } {
  const [y, m] = monthValue.split("-").map(Number);
  if (!y || !m) throw new Error("Invalid month.");
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export const DEMO_TENANT_LIMIT = 20;

export function tenantPayloadFromValues(values: FormValues) {
  return {
    name: String(values.name || "").trim(),
    phone: String(values.phone || "").trim() || null,
    cnic: String(values.cnic || "").trim() || null,
    property_unit: String(values.property_unit || "").trim(),
    monthly_rent: Number(values.monthly_rent || 0),
    move_in_date: String(values.move_in_date || "").trim() || null,
    electricity_ref: String(values.electricity_ref || "").trim() || null,
    gas_ref: String(values.gas_ref || "").trim() || null,
    status: (String(values.status || "active") === "inactive"
      ? "inactive"
      : "active") as "active" | "inactive",
    notes: String(values.notes || "").trim() || null,
  };
}

export function deriveRentStatus(
  amountDue: number,
  amountPaid: number,
  preferred?: RentStatus
): RentStatus {
  if (preferred) return preferred;
  if (amountPaid <= 0) return "pending";
  if (amountPaid >= amountDue) return "paid";
  return "partial";
}

export type { ReminderFrequency };
