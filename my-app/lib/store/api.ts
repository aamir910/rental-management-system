import { isDemoPlan } from "@/lib/auth/plan";
import { DEMO_TENANT_LIMIT } from "@/lib/data/types";
import { createClient } from "@/lib/supabase/client";
import type {
  ExpenseEntry,
  ExpenseEntryType,
  Reminder,
  ReminderFrequency,
  RentPayment,
  RentStatus,
  Tenant,
  UtilityBill,
  UtilityBillStatus,
  UtilityType,
} from "@/lib/types";
import { monthInputToBillingDate } from "@/lib/utils";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  monthRangeIso,
  parseExpenseOccurredAt,
} from "@/lib/data/types";

export type FormValues = Record<string, string>;

export function formDataToValues(formData: FormData): FormValues {
  const values: FormValues = {};
  formData.forEach((value, key) => {
    values[key] = String(value);
  });
  return values;
}

export type MeResponse = {
  id: string;
  email: string;
  plan: "demo" | "paid";
  tenantCount: number;
  tenantLimit: number | null;
};

type ApiError = { status: "CUSTOM_ERROR"; error: string };

function toError(message: string): { error: ApiError } {
  return { error: { status: "CUSTOM_ERROR", error: message } };
}

function tenantPayloadFromValues(values: FormValues) {
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

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data?.error === "string" ? data.error : `Request failed (${res.status})`
    );
  }
  return data as T;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: [
    "Tenants",
    "Tenant",
    "Rents",
    "UtilityBills",
    "Reminders",
    "Expenses",
    "Me",
  ],
  keepUnusedDataFor: 60,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      async queryFn() {
        try {
          if (isDemoPlan()) {
            const supabase = createClient();
            const {
              data: { user },
              error: userError,
            } = await supabase.auth.getUser();
            if (userError || !user) return toError("Not signed in to Demo.");
            const { count, error } = await supabase
              .from("tenants")
              .select("id", { count: "exact", head: true });
            if (error) return toError(error.message);
            return {
              data: {
                id: user.id,
                email: user.email || "",
                plan: "demo",
                tenantCount: count ?? 0,
                tenantLimit: DEMO_TENANT_LIMIT,
              },
            };
          }
          const data = await apiFetch<MeResponse>("/me");
          return { data };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to load profile.");
        }
      },
      providesTags: ["Me"],
    }),

    getTenants: builder.query<Tenant[], void>({
      async queryFn() {
        try {
          if (isDemoPlan()) {
            const supabase = createClient();
            const { data, error } = await supabase
              .from("tenants")
              .select("*")
              .order("created_at", { ascending: false });
            if (error) return toError(error.message);
            return { data: (data ?? []) as Tenant[] };
          }
          const data = await apiFetch<Tenant[]>("/tenants");
          return { data };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to load tenants.");
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Tenants" as const, id })),
              { type: "Tenants", id: "LIST" },
            ]
          : [{ type: "Tenants", id: "LIST" }],
    }),

    getActiveTenants: builder.query<Tenant[], void>({
      async queryFn() {
        try {
          if (isDemoPlan()) {
            const supabase = createClient();
            const { data, error } = await supabase
              .from("tenants")
              .select("*")
              .eq("status", "active")
              .order("name", { ascending: true });
            if (error) return toError(error.message);
            return { data: (data ?? []) as Tenant[] };
          }
          const data = await apiFetch<Tenant[]>("/tenants?active=1");
          return { data };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to load tenants.");
        }
      },
      providesTags: [{ type: "Tenants", id: "ACTIVE" }],
    }),

    getTenant: builder.query<Tenant, string>({
      async queryFn(id) {
        try {
          if (isDemoPlan()) {
            const supabase = createClient();
            const { data, error } = await supabase
              .from("tenants")
              .select("*")
              .eq("id", id)
              .single();
            if (error) return toError(error.message);
            return { data: data as Tenant };
          }
          const data = await apiFetch<Tenant>(`/tenants/${id}`);
          return { data };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Tenant not found.");
        }
      },
      providesTags: (_r, _e, id) => [{ type: "Tenant", id }],
    }),

    getRentsByMonth: builder.query<RentPayment[], string>({
      async queryFn(month) {
        try {
          if (isDemoPlan()) {
            const supabase = createClient();
            const billingMonth = monthInputToBillingDate(month);
            const { data, error } = await supabase
              .from("rent_payments")
              .select(
                "*, tenants(id, name, property_unit, phone, monthly_rent, status)"
              )
              .eq("billing_month", billingMonth)
              .order("due_date", { ascending: true });
            if (error) return toError(error.message);
            return { data: (data ?? []) as RentPayment[] };
          }
          const data = await apiFetch<RentPayment[]>(
            `/rents?month=${encodeURIComponent(month)}`
          );
          return { data };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to load rents.");
        }
      },
      providesTags: (_r, _e, month) => [
        { type: "Rents", id: month },
        { type: "Rents", id: "LIST" },
      ],
    }),

    getTenantRents: builder.query<RentPayment[], string>({
      async queryFn(tenantId) {
        try {
          if (isDemoPlan()) {
            const supabase = createClient();
            const { data, error } = await supabase
              .from("rent_payments")
              .select("*")
              .eq("tenant_id", tenantId)
              .order("billing_month", { ascending: false });
            if (error) return toError(error.message);
            return { data: (data ?? []) as RentPayment[] };
          }
          const data = await apiFetch<RentPayment[]>(
            `/rents?tenantId=${encodeURIComponent(tenantId)}`
          );
          return { data };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to load rents.");
        }
      },
      providesTags: (_r, _e, tenantId) => [
        { type: "Rents", id: `tenant-${tenantId}` },
      ],
    }),

    getUtilityBillsByMonth: builder.query<UtilityBill[], string>({
      async queryFn(month) {
        try {
          if (isDemoPlan()) {
            const supabase = createClient();
            const billingMonth = monthInputToBillingDate(month);
            const { data, error } = await supabase
              .from("utility_bills")
              .select(
                "*, tenants(id, name, property_unit, electricity_ref, gas_ref)"
              )
              .eq("billing_month", billingMonth)
              .order("created_at", { ascending: false });
            if (error) return toError(error.message);
            return { data: (data ?? []) as UtilityBill[] };
          }
          const data = await apiFetch<UtilityBill[]>(
            `/utility-bills?month=${encodeURIComponent(month)}`
          );
          return { data };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to load bills.");
        }
      },
      providesTags: (_r, _e, month) => [
        { type: "UtilityBills", id: month },
        { type: "UtilityBills", id: "LIST" },
      ],
    }),

    getReminders: builder.query<Reminder[], void>({
      async queryFn() {
        try {
          if (isDemoPlan()) {
            const supabase = createClient();
            const { data, error } = await supabase
              .from("reminders")
              .select("*")
              .order("next_due_date", { ascending: true });
            if (error) return toError(error.message);
            return { data: (data ?? []) as Reminder[] };
          }
          const data = await apiFetch<Reminder[]>("/reminders");
          return { data };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to load reminders.");
        }
      },
      providesTags: [{ type: "Reminders", id: "LIST" }],
    }),

    createTenant: builder.mutation<{ success: true }, FormValues>({
      async queryFn(values) {
        try {
          const payload = tenantPayloadFromValues(values);
          if (!payload.name || !payload.property_unit) {
            return toError("Name and property/unit are required.");
          }
          if (isDemoPlan()) {
            const supabase = createClient();
            const { count } = await supabase
              .from("tenants")
              .select("id", { count: "exact", head: true });
            if ((count ?? 0) >= DEMO_TENANT_LIMIT) {
              return toError(
                `Demo plan is limited to ${DEMO_TENANT_LIMIT} tenants. Upgrade to Paid.`
              );
            }
            const { error } = await supabase.from("tenants").insert(payload);
            if (error) return toError(error.message);
            return { data: { success: true } };
          }
          await apiFetch("/tenants", { method: "POST", body: JSON.stringify(values) });
          return { data: { success: true } };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to create tenant.");
        }
      },
      invalidatesTags: ["Tenants", "Tenant", "Me"],
    }),

    updateTenant: builder.mutation<
      { success: true },
      { tenantId: string; values: FormValues }
    >({
      async queryFn({ tenantId, values }) {
        try {
          const payload = tenantPayloadFromValues(values);
          if (isDemoPlan()) {
            const supabase = createClient();
            const { error } = await supabase
              .from("tenants")
              .update(payload)
              .eq("id", tenantId);
            if (error) return toError(error.message);
            return { data: { success: true } };
          }
          await apiFetch(`/tenants/${tenantId}`, {
            method: "PATCH",
            body: JSON.stringify(values),
          });
          return { data: { success: true } };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to update tenant.");
        }
      },
      invalidatesTags: (_r, _e, { tenantId }) => [
        "Tenants",
        { type: "Tenant", id: tenantId },
        "Rents",
      ],
    }),

    deleteTenant: builder.mutation<{ success: true }, string>({
      async queryFn(tenantId) {
        try {
          if (isDemoPlan()) {
            const supabase = createClient();
            const { error } = await supabase
              .from("tenants")
              .delete()
              .eq("id", tenantId);
            if (error) return toError(error.message);
            return { data: { success: true } };
          }
          await apiFetch(`/tenants/${tenantId}`, { method: "DELETE" });
          return { data: { success: true } };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to delete tenant.");
        }
      },
      invalidatesTags: ["Tenants", "Tenant", "Rents", "UtilityBills", "Me"],
    }),

    updateRentPayment: builder.mutation<
      { success: true },
      {
        rentId: string;
        amount_paid?: number;
        due_date?: string;
        status?: RentStatus;
        notes?: string | null;
      }
    >({
      async queryFn({ rentId, ...data }) {
        try {
          if (isDemoPlan()) {
            const supabase = createClient();
            const { data: current, error: fetchError } = await supabase
              .from("rent_payments")
              .select("amount_due, amount_paid")
              .eq("id", rentId)
              .single();
            if (fetchError) return toError(fetchError.message);

            const amountPaid =
              data.amount_paid !== undefined
                ? data.amount_paid
                : Number(current.amount_paid);
            const amountDue = Number(current.amount_due);
            let status = data.status;
            if (!status) {
              if (amountPaid <= 0) status = "pending";
              else if (amountPaid >= amountDue) status = "paid";
              else status = "partial";
            }
            const patch: Record<string, unknown> = {
              amount_paid: amountPaid,
              status,
            };
            if (data.due_date !== undefined) patch.due_date = data.due_date;
            if (data.notes !== undefined) patch.notes = data.notes;

            const { error } = await supabase
              .from("rent_payments")
              .update(patch)
              .eq("id", rentId);
            if (error) return toError(error.message);
            return { data: { success: true } };
          }
          await apiFetch("/rents", {
            method: "PATCH",
            body: JSON.stringify({ rentId, ...data }),
          });
          return { data: { success: true } };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to update rent.");
        }
      },
      invalidatesTags: ["Rents"],
    }),

    generateMonthRents: builder.mutation<
      { success: true; created: number },
      string
    >({
      async queryFn(month) {
        try {
          if (isDemoPlan()) {
            const supabase = createClient();
            const billingMonth = monthInputToBillingDate(month);
            const { data, error } = await supabase.rpc("generate_monthly_rents", {
              p_billing_month: billingMonth,
            });
            if (error) return toError(error.message);
            return { data: { success: true, created: (data as number) ?? 0 } };
          }
          const data = await apiFetch<{ success: true; created: number }>(
            "/rents/generate",
            { method: "POST", body: JSON.stringify({ month }) }
          );
          return { data };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to generate rents.");
        }
      },
      invalidatesTags: ["Rents"],
    }),

    createUtilityBill: builder.mutation<{ success: true }, FormValues>({
      async queryFn(values) {
        try {
          if (isDemoPlan()) {
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
              return toError("Tenant, utility type, and month are required.");
            }
            if (utilityType !== "electricity" && utilityType !== "gas") {
              return toError("Invalid utility type.");
            }

            const supabase = createClient();
            const billingMonth = monthInputToBillingDate(monthValue);
            let ref = referenceSnapshot;
            if (!ref) {
              const { data: tenant } = await supabase
                .from("tenants")
                .select("electricity_ref, gas_ref")
                .eq("id", tenantId)
                .single();
              ref =
                utilityType === "electricity"
                  ? tenant?.electricity_ref ?? null
                  : tenant?.gas_ref ?? null;
            }
            const { error } = await supabase.from("utility_bills").insert({
              tenant_id: tenantId,
              utility_type: utilityType,
              billing_month: billingMonth,
              amount,
              due_date: dueDate,
              status,
              reference_snapshot: ref,
              notes,
            });
            if (error) return toError(error.message);
            return { data: { success: true } };
          }
          await apiFetch("/utility-bills", {
            method: "POST",
            body: JSON.stringify(values),
          });
          return { data: { success: true } };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to create bill.");
        }
      },
      invalidatesTags: ["UtilityBills"],
    }),

    updateUtilityBillStatus: builder.mutation<
      { success: true },
      { billId: string; status: UtilityBillStatus }
    >({
      async queryFn({ billId, status }) {
        try {
          if (isDemoPlan()) {
            const supabase = createClient();
            const { error } = await supabase
              .from("utility_bills")
              .update({ status })
              .eq("id", billId);
            if (error) return toError(error.message);
            return { data: { success: true } };
          }
          await apiFetch("/utility-bills", {
            method: "PATCH",
            body: JSON.stringify({ billId, status }),
          });
          return { data: { success: true } };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to update bill.");
        }
      },
      invalidatesTags: ["UtilityBills"],
    }),

    deleteUtilityBill: builder.mutation<{ success: true }, string>({
      async queryFn(billId) {
        try {
          if (isDemoPlan()) {
            const supabase = createClient();
            const { error } = await supabase
              .from("utility_bills")
              .delete()
              .eq("id", billId);
            if (error) return toError(error.message);
            return { data: { success: true } };
          }
          await apiFetch(`/utility-bills?id=${encodeURIComponent(billId)}`, {
            method: "DELETE",
          });
          return { data: { success: true } };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to delete bill.");
        }
      },
      invalidatesTags: ["UtilityBills"],
    }),

    createReminder: builder.mutation<{ success: true }, FormValues>({
      async queryFn(values) {
        try {
          if (isDemoPlan()) {
            const title = String(values.title || "").trim();
            const body = String(values.body || "").trim() || null;
            const frequency = String(values.frequency || "") as ReminderFrequency;
            const nextDueDate = String(values.next_due_date || "").trim();
            if (!title || !frequency || !nextDueDate) {
              return toError("Title, frequency, and next due date are required.");
            }
            if (!["daily", "weekly", "monthly"].includes(frequency)) {
              return toError("Invalid frequency.");
            }
            const supabase = createClient();
            const { error } = await supabase.from("reminders").insert({
              title,
              body,
              frequency,
              next_due_date: nextDueDate,
              is_done: false,
            });
            if (error) return toError(error.message);
            return { data: { success: true } };
          }
          await apiFetch("/reminders", {
            method: "POST",
            body: JSON.stringify(values),
          });
          return { data: { success: true } };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to create reminder.");
        }
      },
      invalidatesTags: ["Reminders"],
    }),

    toggleReminderDone: builder.mutation<
      { success: true },
      { reminderId: string; isDone: boolean }
    >({
      async queryFn({ reminderId, isDone }) {
        try {
          if (isDemoPlan()) {
            const supabase = createClient();
            const { error } = await supabase
              .from("reminders")
              .update({ is_done: isDone })
              .eq("id", reminderId);
            if (error) return toError(error.message);
            return { data: { success: true } };
          }
          await apiFetch("/reminders", {
            method: "PATCH",
            body: JSON.stringify({ reminderId, isDone }),
          });
          return { data: { success: true } };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to update reminder.");
        }
      },
      invalidatesTags: ["Reminders"],
    }),

    deleteReminder: builder.mutation<{ success: true }, string>({
      async queryFn(reminderId) {
        try {
          if (isDemoPlan()) {
            const supabase = createClient();
            const { error } = await supabase
              .from("reminders")
              .delete()
              .eq("id", reminderId);
            if (error) return toError(error.message);
            return { data: { success: true } };
          }
          await apiFetch(`/reminders?id=${encodeURIComponent(reminderId)}`, {
            method: "DELETE",
          });
          return { data: { success: true } };
        } catch (err) {
          return toError(err instanceof Error ? err.message : "Failed to delete reminder.");
        }
      },
      invalidatesTags: ["Reminders"],
    }),

    getExpensesByMonth: builder.query<ExpenseEntry[], string>({
      async queryFn(month) {
        try {
          if (isDemoPlan()) {
            const { start, end } = monthRangeIso(month);
            const supabase = createClient();
            const { data, error } = await supabase
              .from("daily_expenses")
              .select("*")
              .gte("occurred_at", start)
              .lt("occurred_at", end)
              .order("occurred_at", { ascending: false });
            if (error) return toError(error.message);
            return {
              data: (data ?? []).map((row) => ({
                id: String(row.id),
                entry_type: row.entry_type === "in" ? "in" : "out",
                amount: Number(row.amount),
                title: String(row.title),
                notes: (row.notes as string | null) ?? null,
                occurred_at: String(row.occurred_at),
                created_at: String(row.created_at),
                updated_at: String(row.updated_at),
              })) as ExpenseEntry[],
            };
          }
          const data = await apiFetch<ExpenseEntry[]>(
            `/expenses?month=${encodeURIComponent(month)}`
          );
          return { data };
        } catch (err) {
          return toError(
            err instanceof Error ? err.message : "Failed to load expenses."
          );
        }
      },
      providesTags: (_r, _e, month) => [
        { type: "Expenses", id: month },
        { type: "Expenses", id: "LIST" },
      ],
    }),

    createExpense: builder.mutation<{ success: true }, FormValues>({
      async queryFn(values) {
        try {
          const entryType = String(values.entry_type || "") as ExpenseEntryType;
          const title = String(values.title || "").trim();
          const amount = Number(values.amount || 0);
          const notes = String(values.notes || "").trim() || null;
          if (!["in", "out"].includes(entryType)) {
            return toError("Choose Cash In or Cash Out.");
          }
          if (!title) return toError("Title is required.");
          if (!(amount > 0)) return toError("Amount must be greater than zero.");
          let occurredAt: string;
          try {
            occurredAt = parseExpenseOccurredAt(String(values.occurred_at || ""));
          } catch (err) {
            return toError(
              err instanceof Error ? err.message : "Invalid date and time."
            );
          }
          if (isDemoPlan()) {
            const supabase = createClient();
            const { error } = await supabase.from("daily_expenses").insert({
              entry_type: entryType,
              amount,
              title,
              notes,
              occurred_at: occurredAt,
            });
            if (error) return toError(error.message);
            return { data: { success: true } };
          }
          await apiFetch("/expenses", {
            method: "POST",
            body: JSON.stringify({
              entry_type: entryType,
              amount: String(amount),
              title,
              notes: notes ?? "",
              occurred_at: occurredAt,
            }),
          });
          return { data: { success: true } };
        } catch (err) {
          return toError(
            err instanceof Error ? err.message : "Failed to add expense."
          );
        }
      },
      invalidatesTags: ["Expenses"],
    }),

    deleteExpense: builder.mutation<{ success: true }, string>({
      async queryFn(expenseId) {
        try {
          if (isDemoPlan()) {
            const supabase = createClient();
            const { error } = await supabase
              .from("daily_expenses")
              .delete()
              .eq("id", expenseId);
            if (error) return toError(error.message);
            return { data: { success: true } };
          }
          await apiFetch(`/expenses?id=${encodeURIComponent(expenseId)}`, {
            method: "DELETE",
          });
          return { data: { success: true } };
        } catch (err) {
          return toError(
            err instanceof Error ? err.message : "Failed to delete expense."
          );
        }
      },
      invalidatesTags: ["Expenses"],
    }),
  }),
});

export const {
  useGetMeQuery,
  useGetTenantsQuery,
  useGetActiveTenantsQuery,
  useGetTenantQuery,
  useGetRentsByMonthQuery,
  useGetTenantRentsQuery,
  useGetUtilityBillsByMonthQuery,
  useGetRemindersQuery,
  useGetExpensesByMonthQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  useUpdateRentPaymentMutation,
  useGenerateMonthRentsMutation,
  useCreateUtilityBillMutation,
  useUpdateUtilityBillStatusMutation,
  useDeleteUtilityBillMutation,
  useCreateReminderMutation,
  useToggleReminderDoneMutation,
  useDeleteReminderMutation,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} = api;
