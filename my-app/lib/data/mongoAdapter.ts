import { COLLECTIONS, getDb } from "@/lib/mongo/client";
import type {
  ExpenseEntry,
  ExpenseEntryType,
  Reminder,
  RentPayment,
  RentStatus,
  Tenant,
  UtilityBill,
  UtilityBillStatus,
  UtilityType,
} from "@/lib/types";
import { normalizePaymentFields } from "@/lib/payment-channels";
import { monthInputToBillingDate } from "@/lib/utils";
import { ObjectId } from "mongodb";
import type { AdapterContext, DataAdapter, FormValues } from "./types";
import {
  deriveRentStatus,
  monthRangeIso,
  parseExpenseOccurredAt,
  tenantPayloadFromValues,
} from "./types";

type TenantDoc = {
  _id: ObjectId;
  ownerId: string;
  name: string;
  phone: string | null;
  cnic: string | null;
  property_unit: string;
  monthly_rent: number;
  move_in_date: string | null;
  electricity_ref: string | null;
  gas_ref: string | null;
  status: "active" | "inactive";
  notes: string | null;
  created_at: Date;
  updated_at: Date;
};

function toIsoDate(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  if (typeof d === "string") return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function mapTenant(doc: TenantDoc): Tenant {
  return {
    id: doc._id.toString(),
    name: doc.name,
    phone: doc.phone,
    cnic: doc.cnic,
    property_unit: doc.property_unit,
    monthly_rent: Number(doc.monthly_rent),
    move_in_date: toIsoDate(doc.move_in_date),
    electricity_ref: doc.electricity_ref,
    gas_ref: doc.gas_ref,
    status: doc.status,
    notes: doc.notes,
    created_at: doc.created_at.toISOString(),
    updated_at: doc.updated_at.toISOString(),
  };
}

export function createMongoAdapter(ctx: AdapterContext): DataAdapter {
  const { ownerId } = ctx;

  return {
    async countTenants() {
      const db = await getDb();
      return db.collection(COLLECTIONS.tenants).countDocuments({ ownerId });
    },

    async listTenants() {
      const db = await getDb();
      const docs = await db
        .collection<TenantDoc>(COLLECTIONS.tenants)
        .find({ ownerId })
        .sort({ created_at: -1 })
        .toArray();
      return docs.map(mapTenant);
    },

    async listActiveTenants() {
      const db = await getDb();
      const docs = await db
        .collection<TenantDoc>(COLLECTIONS.tenants)
        .find({ ownerId, status: "active" })
        .sort({ name: 1 })
        .toArray();
      return docs.map(mapTenant);
    },

    async getTenant(id) {
      if (!ObjectId.isValid(id)) return null;
      const db = await getDb();
      const doc = await db
        .collection<TenantDoc>(COLLECTIONS.tenants)
        .findOne({ _id: new ObjectId(id), ownerId });
      return doc ? mapTenant(doc) : null;
    },

    async createTenant(values) {
      const payload = tenantPayloadFromValues(values);
      if (!payload.name || !payload.property_unit) {
        throw new Error("Name and property/unit are required.");
      }
      const db = await getDb();
      const now = new Date();
      const doc: TenantDoc = {
        _id: new ObjectId(),
        ownerId,
        ...payload,
        created_at: now,
        updated_at: now,
      };
      await db.collection(COLLECTIONS.tenants).insertOne(doc);
      return mapTenant(doc);
    },

    async updateTenant(id, values) {
      if (!ObjectId.isValid(id)) throw new Error("Tenant not found.");
      const payload = tenantPayloadFromValues(values);
      const db = await getDb();
      const result = await db.collection(COLLECTIONS.tenants).updateOne(
        { _id: new ObjectId(id), ownerId },
        { $set: { ...payload, updated_at: new Date() } }
      );
      if (!result.matchedCount) throw new Error("Tenant not found.");
    },

    async deleteTenant(id) {
      if (!ObjectId.isValid(id)) throw new Error("Tenant not found.");
      const db = await getDb();
      const oid = new ObjectId(id);
      await db.collection(COLLECTIONS.rentPayments).deleteMany({
        ownerId,
        tenant_id: id,
      });
      await db.collection(COLLECTIONS.utilityBills).deleteMany({
        ownerId,
        tenant_id: id,
      });
      const result = await db
        .collection(COLLECTIONS.tenants)
        .deleteOne({ _id: oid, ownerId });
      if (!result.deletedCount) throw new Error("Tenant not found.");
    },

    async listRentsByMonth(monthValue) {
      const billingMonth = monthInputToBillingDate(monthValue);
      const db = await getDb();
      const rents = await db
        .collection(COLLECTIONS.rentPayments)
        .find({ ownerId, billing_month: billingMonth })
        .sort({ due_date: 1 })
        .toArray();

      const tenantIds = [...new Set(rents.map((r) => String(r.tenant_id)))];
      const tenants = await db
        .collection<TenantDoc>(COLLECTIONS.tenants)
        .find({
          ownerId,
          _id: {
            $in: tenantIds
              .filter((id) => ObjectId.isValid(id))
              .map((id) => new ObjectId(id)),
          },
        })
        .toArray();
      const tenantMap = new Map(tenants.map((t) => [t._id.toString(), t]));

      return rents.map((r) => {
        const t = tenantMap.get(String(r.tenant_id));
        return {
          id: r._id.toString(),
          tenant_id: String(r.tenant_id),
          billing_month: String(r.billing_month),
          amount_due: Number(r.amount_due),
          amount_paid: Number(r.amount_paid),
          due_date: String(r.due_date),
          status: r.status as RentStatus,
          payment_channel:
            r.payment_channel === "account"
              ? "account"
              : r.payment_channel === "cash"
                ? "cash"
                : null,
          account_provider:
            (r.account_provider as RentPayment["account_provider"]) ?? null,
          notes: (r.notes as string | null) ?? null,
          created_at: (r.created_at as Date).toISOString(),
          updated_at: (r.updated_at as Date).toISOString(),
          tenants: t
            ? {
                id: t._id.toString(),
                name: t.name,
                property_unit: t.property_unit,
                phone: t.phone,
                monthly_rent: t.monthly_rent,
                status: t.status,
              }
            : undefined,
        } satisfies RentPayment;
      });
    },

    async listTenantRents(tenantId) {
      const db = await getDb();
      const rents = await db
        .collection(COLLECTIONS.rentPayments)
        .find({ ownerId, tenant_id: tenantId })
        .sort({ billing_month: -1 })
        .toArray();
      return rents.map(
        (r) =>
          ({
            id: r._id.toString(),
            tenant_id: String(r.tenant_id),
            billing_month: String(r.billing_month),
            amount_due: Number(r.amount_due),
            amount_paid: Number(r.amount_paid),
            due_date: String(r.due_date),
            status: r.status as RentStatus,
            payment_channel:
              r.payment_channel === "account"
                ? "account"
                : r.payment_channel === "cash"
                  ? "cash"
                  : null,
            account_provider:
              (r.account_provider as RentPayment["account_provider"]) ?? null,
            notes: (r.notes as string | null) ?? null,
            created_at: (r.created_at as Date).toISOString(),
            updated_at: (r.updated_at as Date).toISOString(),
          }) satisfies RentPayment
      );
    },

    async updateRentPayment(rentId, data) {
      if (!ObjectId.isValid(rentId)) throw new Error("Rent not found.");
      const db = await getDb();
      const current = await db
        .collection(COLLECTIONS.rentPayments)
        .findOne({ _id: new ObjectId(rentId), ownerId });
      if (!current) throw new Error("Rent not found.");

      const amountPaid =
        data.amount_paid !== undefined
          ? data.amount_paid
          : Number(current.amount_paid);
      const amountDue = Number(current.amount_due);
      const status = deriveRentStatus(amountDue, amountPaid, data.status);

      const patch: Record<string, unknown> = {
        amount_paid: amountPaid,
        status,
        updated_at: new Date(),
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

      await db
        .collection(COLLECTIONS.rentPayments)
        .updateOne({ _id: new ObjectId(rentId), ownerId }, { $set: patch });
    },

    async generateMonthRents(monthValue) {
      const billingMonth = monthInputToBillingDate(monthValue);
      const [y, m] = billingMonth.split("-").map(Number);
      const dueDate = `${y}-${String(m).padStart(2, "0")}-05`;
      const db = await getDb();
      const active = await db
        .collection<TenantDoc>(COLLECTIONS.tenants)
        .find({ ownerId, status: "active" })
        .toArray();

      let created = 0;
      const now = new Date();
      for (const t of active) {
        const existing = await db.collection(COLLECTIONS.rentPayments).findOne({
          ownerId,
          tenant_id: t._id.toString(),
          billing_month: billingMonth,
        });
        if (existing) continue;
        await db.collection(COLLECTIONS.rentPayments).insertOne({
          _id: new ObjectId(),
          ownerId,
          tenant_id: t._id.toString(),
          billing_month: billingMonth,
          amount_due: Number(t.monthly_rent),
          amount_paid: 0,
          due_date: dueDate,
          status: "pending",
          notes: null,
          created_at: now,
          updated_at: now,
        });
        created += 1;
      }
      return created;
    },

    async listUtilityBillsByMonth(monthValue) {
      const billingMonth = monthInputToBillingDate(monthValue);
      const db = await getDb();
      const bills = await db
        .collection(COLLECTIONS.utilityBills)
        .find({ ownerId, billing_month: billingMonth })
        .sort({ created_at: -1 })
        .toArray();

      const tenantIds = [...new Set(bills.map((b) => String(b.tenant_id)))];
      const tenants = await db
        .collection<TenantDoc>(COLLECTIONS.tenants)
        .find({
          ownerId,
          _id: {
            $in: tenantIds
              .filter((id) => ObjectId.isValid(id))
              .map((id) => new ObjectId(id)),
          },
        })
        .toArray();
      const tenantMap = new Map(tenants.map((t) => [t._id.toString(), t]));

      return bills.map((b) => {
        const t = tenantMap.get(String(b.tenant_id));
        return {
          id: b._id.toString(),
          tenant_id: String(b.tenant_id),
          utility_type: b.utility_type as UtilityType,
          billing_month: String(b.billing_month),
          amount: Number(b.amount),
          due_date: b.due_date ? String(b.due_date) : null,
          status: b.status as UtilityBillStatus,
          reference_snapshot: (b.reference_snapshot as string | null) ?? null,
          notes: (b.notes as string | null) ?? null,
          created_at: (b.created_at as Date).toISOString(),
          updated_at: (b.updated_at as Date).toISOString(),
          tenants: t
            ? {
                id: t._id.toString(),
                name: t.name,
                property_unit: t.property_unit,
                electricity_ref: t.electricity_ref,
                gas_ref: t.gas_ref,
              }
            : undefined,
        } satisfies UtilityBill;
      });
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
      const db = await getDb();
      const tenant = await this.getTenant(tenantId);
      if (!tenant) throw new Error("Tenant not found.");

      let ref = referenceSnapshot;
      if (!ref) {
        ref =
          utilityType === "electricity"
            ? tenant.electricity_ref
            : tenant.gas_ref;
      }

      const now = new Date();
      await db.collection(COLLECTIONS.utilityBills).insertOne({
        _id: new ObjectId(),
        ownerId,
        tenant_id: tenantId,
        utility_type: utilityType,
        billing_month: billingMonth,
        amount,
        due_date: dueDate,
        status,
        reference_snapshot: ref,
        notes,
        created_at: now,
        updated_at: now,
      });
    },

    async updateUtilityBillStatus(billId, status) {
      if (!ObjectId.isValid(billId)) throw new Error("Bill not found.");
      const db = await getDb();
      const result = await db.collection(COLLECTIONS.utilityBills).updateOne(
        { _id: new ObjectId(billId), ownerId },
        { $set: { status, updated_at: new Date() } }
      );
      if (!result.matchedCount) throw new Error("Bill not found.");
    },

    async deleteUtilityBill(billId) {
      if (!ObjectId.isValid(billId)) throw new Error("Bill not found.");
      const db = await getDb();
      const result = await db
        .collection(COLLECTIONS.utilityBills)
        .deleteOne({ _id: new ObjectId(billId), ownerId });
      if (!result.deletedCount) throw new Error("Bill not found.");
    },

    async listReminders() {
      const db = await getDb();
      const docs = await db
        .collection(COLLECTIONS.reminders)
        .find({ ownerId })
        .sort({ next_due_date: 1 })
        .toArray();
      return docs.map(
        (r) =>
          ({
            id: r._id.toString(),
            title: String(r.title),
            body: (r.body as string | null) ?? null,
            frequency: r.frequency as Reminder["frequency"],
            next_due_date: String(r.next_due_date),
            is_done: Boolean(r.is_done),
            created_at: (r.created_at as Date).toISOString(),
            updated_at: (r.updated_at as Date).toISOString(),
          }) satisfies Reminder
      );
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
      const db = await getDb();
      const now = new Date();
      await db.collection(COLLECTIONS.reminders).insertOne({
        _id: new ObjectId(),
        ownerId,
        title,
        body,
        frequency,
        next_due_date: nextDueDate,
        is_done: false,
        created_at: now,
        updated_at: now,
      });
    },

    async toggleReminderDone(reminderId, isDone) {
      if (!ObjectId.isValid(reminderId)) throw new Error("Reminder not found.");
      const db = await getDb();
      const result = await db.collection(COLLECTIONS.reminders).updateOne(
        { _id: new ObjectId(reminderId), ownerId },
        { $set: { is_done: isDone, updated_at: new Date() } }
      );
      if (!result.matchedCount) throw new Error("Reminder not found.");
    },

    async deleteReminder(reminderId) {
      if (!ObjectId.isValid(reminderId)) throw new Error("Reminder not found.");
      const db = await getDb();
      const result = await db
        .collection(COLLECTIONS.reminders)
        .deleteOne({ _id: new ObjectId(reminderId), ownerId });
      if (!result.deletedCount) throw new Error("Reminder not found.");
    },

    async listExpensesByMonth(monthValue) {
      const { start, end } = monthRangeIso(monthValue);
      const db = await getDb();
      const docs = await db
        .collection(COLLECTIONS.dailyExpenses)
        .find({
          ownerId,
          occurred_at: { $gte: new Date(start), $lt: new Date(end) },
        })
        .sort({ occurred_at: -1 })
        .toArray();
      return docs.map(
        (r) =>
          ({
            id: r._id.toString(),
            entry_type: r.entry_type === "in" ? "in" : "out",
            amount: Number(r.amount),
            title: String(r.title),
            notes: (r.notes as string | null) ?? null,
            payment_channel: r.payment_channel === "account" ? "account" : "cash",
            account_provider:
              (r.account_provider as ExpenseEntry["account_provider"]) ?? null,
            occurred_at:
              r.occurred_at instanceof Date
                ? r.occurred_at.toISOString()
                : String(r.occurred_at),
            created_at: (r.created_at as Date).toISOString(),
            updated_at: (r.updated_at as Date).toISOString(),
          }) satisfies ExpenseEntry
      );
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
      const db = await getDb();
      const now = new Date();
      await db.collection(COLLECTIONS.dailyExpenses).insertOne({
        _id: new ObjectId(),
        ownerId,
        entry_type: entryType,
        amount,
        title,
        notes,
        payment_channel,
        account_provider,
        occurred_at: new Date(occurredAt),
        created_at: now,
        updated_at: now,
      });
    },

    async deleteExpense(expenseId) {
      if (!ObjectId.isValid(expenseId)) throw new Error("Expense not found.");
      const db = await getDb();
      const result = await db
        .collection(COLLECTIONS.dailyExpenses)
        .deleteOne({ _id: new ObjectId(expenseId), ownerId });
      if (!result.deletedCount) throw new Error("Expense not found.");
    },
  };
}
