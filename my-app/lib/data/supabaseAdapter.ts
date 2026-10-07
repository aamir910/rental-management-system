import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ExpenseEntry,
  ExpenseEntryType,
  Reminder,
  RentPayment,
  Tenant,
  UtilityBill,
  UtilityBillStatus,
  UtilityType,
} from "@/lib/types";
import { normalizePaymentFields } from "@/lib/payment-channels";
import { monthInputToBillingDate } from "@/lib/utils";
import type { AdapterContext, DataAdapter, FormValues } from "./types";
import {
  DEMO_TENANT_LIMIT,
  deriveRentStatus,
  monthRangeIso,
  parseExpenseOccurredAt,
  tenantPayloadFromValues,
} from "./types";

export function createSupabaseAdapter(ctx: AdapterContext): DataAdapter {
  const { ownerId } = ctx;
  const supabase = () => createAdminClient();

  return {
    async countTenants() {
      const { count, error } = await supabase()
        .from("tenants")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", ownerId);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },

    async listTenants() {
      const { data, error } = await supabase()
        .from("tenants")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map(mapTenantRow);
    },

    async listActiveTenants() {
      const { data, error } = await supabase()
        .from("tenants")
        .select("*")
        .eq("owner_id", ownerId)
        .eq("status", "active")
        .order("name", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []).map(mapTenantRow);
    },

    async getTenant(id) {
      const { data, error } = await supabase()
        .from("tenants")
        .select("*")
        .eq("id", id)
        .eq("owner_id", ownerId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ? mapTenantRow(data) : null;
    },

    async createTenant(values) {
      const count = await this.countTenants();
      if (count >= DEMO_TENANT_LIMIT) {
        throw new Error(
          `Demo plan is limited to ${DEMO_TENANT_LIMIT} tenants. Upgrade to Paid for unlimited tenants.`
        );
      }
      const payload = tenantPayloadFromValues(values);
      if (!payload.name || !payload.property_unit) {
        throw new Error("Name and property/unit are required.");
      }
      const { data, error } = await supabase()
        .from("tenants")
        .insert({ ...payload, owner_id: ownerId })
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return mapTenantRow(data);
    },

    async updateTenant(id, values) {
      const payload = tenantPayloadFromValues(values);
      const { error } = await supabase()
        .from("tenants")
        .update(payload)
        .eq("id", id)
        .eq("owner_id", ownerId);
      if (error) throw new Error(error.message);
    },

    async deleteTenant(id) {
      const { error } = await supabase()
        .from("tenants")
        .delete()
        .eq("id", id)
        .eq("owner_id", ownerId);
      if (error) throw new Error(error.message);
    },

    async listRentsByMonth(monthValue) {
      const billingMonth = monthInputToBillingDate(monthValue);
      const { data, error } = await supabase()
        .from("rent_payments")
        .select(
          "*, tenants(id, name, property_unit, phone, monthly_rent, status)"
        )
        .eq("owner_id", ownerId)
        .eq("billing_month", billingMonth)
        .order("due_date", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as RentPayment[];
    },

    async listTenantRents(tenantId) {
      const { data, error } = await supabase()
        .from("rent_payments")
        .select("*")
        .eq("owner_id", ownerId)
        .eq("tenant_id", tenantId)
        .order("billing_month", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as RentPayment[];
    },

    async updateRentPayment(rentId, data) {
      const client = supabase();
      const { data: current, error: fetchError } = await client
        .from("rent_payments")
        .select("amount_due, amount_paid")
        .eq("id", rentId)
        .eq("owner_id", ownerId)
        .single();
      if (fetchError) throw new Error(fetchError.message);

      const amountPaid =
        data.amount_paid !== undefined
          ? data.amount_paid
          : Number(current.amount_paid);
      const amountDue = Number(current.amount_due);
      const status = deriveRentStatus(amountDue, amountPaid, data.status);

      const patch: Record<string, unknown> = {
        amount_paid: amountPaid,
        status,
      };
      if (data.due_date !== undefined) patch.due_date = data.due_date;
      if (data.notes !== undefined) patch.notes = data.notes;
      if (data.payment_channel !== undefined) {
        patch.payment_channel =
          amountPaid > 0 ? data.payment_channel : null;
      }
      if (data.account_provider !== undefined) {
        patch.account_provider =
          amountPaid > 0 && data.payment_channel === "account"
            ? data.account_provider
            : null;
      }

      const { error } = await client
        .from("rent_payments")
        .update(patch)
        .eq("id", rentId)
        .eq("owner_id", ownerId);
      if (error) throw new Error(error.message);
    },

    async generateMonthRents(monthValue) {
      const billingMonth = monthInputToBillingDate(monthValue);
      const [y, m] = billingMonth.split("-").map(Number);
      const dueDate = `${y}-${String(m).padStart(2, "0")}-05`;
      const client = supabase();

      const { data: active, error: tenantsError } = await client
        .from("tenants")
        .select("id, monthly_rent")
        .eq("owner_id", ownerId)
        .eq("status", "active");
      if (tenantsError) throw new Error(tenantsError.message);

      let created = 0;
      for (const t of active ?? []) {
        const { data: existing } = await client
          .from("rent_payments")
          .select("id")
          .eq("owner_id", ownerId)
          .eq("tenant_id", t.id)
          .eq("billing_month", billingMonth)
          .maybeSingle();
        if (existing) continue;

        const { error } = await client.from("rent_payments").insert({
          owner_id: ownerId,
          tenant_id: t.id,
          billing_month: billingMonth,
          amount_due: Number(t.monthly_rent),
          amount_paid: 0,
          due_date: dueDate,
          status: "pending",
        });
        if (!error) created += 1;
      }
      return created;
    },

    async listUtilityBillsByMonth(monthValue) {
      const billingMonth = monthInputToBillingDate(monthValue);
      const { data, error } = await supabase()
        .from("utility_bills")
        .select(
          "*, tenants(id, name, property_unit, electricity_ref, gas_ref)"
        )
        .eq("owner_id", ownerId)
        .eq("billing_month", billingMonth)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as UtilityBill[];
    },

    async createUtilityBill(values: FormValues) {
      const tenantId = String(values.tenant_id || "").trim();
      const utilityType = String(values.utility_type || "") as UtilityType;
      const monthValue = String(values.month || "").trim();
      const amount = Number(values.amount || 0);
      const dueDate = String(values.due_date || "").trim() || null;
      const referenceSnapshot =
        String(values.reference_snapshot || "").trim() || null;
      const notes = String(values.notes || "").trim() || null;
      const status = (String(values.status || "pending") === "success"
        ? "success"
        : "pending") as UtilityBillStatus;

      if (!tenantId || !utilityType || !monthValue) {
        throw new Error("Tenant, utility type, and month are required.");
      }
      if (utilityType !== "electricity" && utilityType !== "gas") {
        throw new Error("Invalid utility type.");
      }

      const billingMonth = monthInputToBillingDate(monthValue);
      const client = supabase();

      let ref = referenceSnapshot;
      if (!ref) {
        const { data: tenant } = await client
          .from("tenants")
          .select("electricity_ref, gas_ref")
          .eq("id", tenantId)
          .eq("owner_id", ownerId)
          .single();
        ref =
          utilityType === "electricity"
            ? tenant?.electricity_ref ?? null
            : tenant?.gas_ref ?? null;
      }

      const { error } = await client.from("utility_bills").insert({
        owner_id: ownerId,
        tenant_id: tenantId,
        utility_type: utilityType,
        billing_month: billingMonth,
        amount,
        due_date: dueDate,
        status,
        reference_snapshot: ref,
        notes,
      });
      if (error) throw new Error(error.message);
    },

    async updateUtilityBillStatus(billId, status) {
      const { error } = await supabase()
        .from("utility_bills")
        .update({ status })
        .eq("id", billId)
        .eq("owner_id", ownerId);
      if (error) throw new Error(error.message);
    },

    async deleteUtilityBill(billId) {
      const { error } = await supabase()
        .from("utility_bills")
        .delete()
        .eq("id", billId)
        .eq("owner_id", ownerId);
      if (error) throw new Error(error.message);
    },

    async listReminders() {
      const { data, error } = await supabase()
        .from("reminders")
        .select("*")
        .eq("owner_id", ownerId)
        .order("next_due_date", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as Reminder[];
    },

    async createReminder(values) {
      const title = String(values.title || "").trim();
      const body = String(values.body || "").trim() || null;
      const frequency = String(values.frequency || "") as Reminder["frequency"];
      const nextDueDate = String(values.next_due_date || "").trim();
      if (!title || !frequency || !nextDueDate) {
        throw new Error("Title, frequency, and next due date are required.");
      }
      if (!["daily", "weekly", "monthly"].includes(frequency)) {
        throw new Error("Invalid frequency.");
      }
      const { error } = await supabase().from("reminders").insert({
        owner_id: ownerId,
        title,
        body,
        frequency,
        next_due_date: nextDueDate,
        is_done: false,
      });
      if (error) throw new Error(error.message);
    },

    async toggleReminderDone(reminderId, isDone) {
      const { error } = await supabase()
        .from("reminders")
        .update({ is_done: isDone })
        .eq("id", reminderId)
        .eq("owner_id", ownerId);
      if (error) throw new Error(error.message);
    },

    async deleteReminder(reminderId) {
      const { error } = await supabase()
        .from("reminders")
        .delete()
        .eq("id", reminderId)
        .eq("owner_id", ownerId);
      if (error) throw new Error(error.message);
    },

    async listExpensesByMonth(monthValue) {
      const { start, end } = monthRangeIso(monthValue);
      const { data, error } = await supabase()
        .from("daily_expenses")
        .select("*")
        .eq("owner_id", ownerId)
        .gte("occurred_at", start)
        .lt("occurred_at", end)
        .order("occurred_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map(mapExpenseRow);
    },

    async createExpense(values) {
      const entryType = String(values.entry_type || "") as ExpenseEntryType;
      const title = String(values.title || "").trim();
      const amount = Number(values.amount || 0);
      const notes = String(values.notes || "").trim() || null;
      const occurredAt = parseExpenseOccurredAt(String(values.occurred_at || ""));
      const { payment_channel, account_provider } = normalizePaymentFields(values);
      if (!["in", "out"].includes(entryType)) {
        throw new Error("Choose Cash In or Cash Out.");
      }
      if (!title) throw new Error("Title is required.");
      if (!(amount > 0)) throw new Error("Amount must be greater than zero.");
      const { error } = await supabase().from("daily_expenses").insert({
        owner_id: ownerId,
        entry_type: entryType,
        amount,
        title,
        notes,
        payment_channel,
        account_provider,
        occurred_at: occurredAt,
      });
      if (error) throw new Error(error.message);
    },

    async deleteExpense(expenseId) {
      const { error } = await supabase()
        .from("daily_expenses")
        .delete()
        .eq("id", expenseId)
        .eq("owner_id", ownerId);
      if (error) throw new Error(error.message);
    },
  };
}

function mapExpenseRow(row: Record<string, unknown>): ExpenseEntry {
  return {
    id: String(row.id),
    entry_type: row.entry_type === "in" ? "in" : "out",
    amount: Number(row.amount),
    title: String(row.title),
    notes: (row.notes as string | null) ?? null,
    payment_channel: row.payment_channel === "account" ? "account" : "cash",
    account_provider: (row.account_provider as ExpenseEntry["account_provider"]) ?? null,
    occurred_at: String(row.occurred_at),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function mapTenantRow(row: Record<string, unknown>): Tenant {
  return {
    id: String(row.id),
    name: String(row.name),
    phone: (row.phone as string | null) ?? null,
    cnic: (row.cnic as string | null) ?? null,
    property_unit: String(row.property_unit),
    monthly_rent: Number(row.monthly_rent),
    move_in_date: (row.move_in_date as string | null) ?? null,
    electricity_ref: (row.electricity_ref as string | null) ?? null,
    gas_ref: (row.gas_ref as string | null) ?? null,
    status: row.status === "inactive" ? "inactive" : "active",
    notes: (row.notes as string | null) ?? null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}
