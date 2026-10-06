import { createClient } from "@/lib/supabase/client";
import type {
  Reminder,
  ReminderFrequency,
  RentPayment,
  RentStatus,
  Tenant,
  TenantStatus,
  UtilityBill,
  UtilityBillStatus,
  UtilityType,
} from "@/lib/types";
import { monthInputToBillingDate } from "@/lib/utils";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

type ApiError = { status: "CUSTOM_ERROR"; error: string };

function toError(message: string): { error: ApiError } {
  return { error: { status: "CUSTOM_ERROR", error: message } };
}

export type FormValues = Record<string, string>;

export function formDataToValues(formData: FormData): FormValues {
  const values: FormValues = {};
  formData.forEach((value, key) => {
    values[key] = String(value);
  });
  return values;
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
    status: (String(values.status || "active") as TenantStatus),
    notes: String(values.notes || "").trim() || null,
  };
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: ["Tenants", "Tenant", "Rents", "UtilityBills", "Reminders"],
  keepUnusedDataFor: 60,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getTenants: builder.query<Tenant[], void>({
      async queryFn() {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("tenants")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return toError(error.message);
        return { data: (data ?? []) as Tenant[] };
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
        const supabase = createClient();
        const { data, error } = await supabase
          .from("tenants")
          .select("*")
          .eq("status", "active")
          .order("name", { ascending: true });
        if (error) return toError(error.message);
        return { data: (data ?? []) as Tenant[] };
      },
      providesTags: [{ type: "Tenants", id: "ACTIVE" }],
    }),

    getTenant: builder.query<Tenant, string>({
      async queryFn(id) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("tenants")
          .select("*")
          .eq("id", id)
          .single();
        if (error) return toError(error.message);
        return { data: data as Tenant };
      },
      providesTags: (_r, _e, id) => [{ type: "Tenant", id }],
    }),

    getRentsByMonth: builder.query<RentPayment[], string>({
      async queryFn(monthValue) {
        const supabase = createClient();
        const billingMonth = monthInputToBillingDate(monthValue);
        const { data, error } = await supabase
          .from("rent_payments")
          .select(
            "*, tenants(id, name, property_unit, phone, monthly_rent, status)"
          )
          .eq("billing_month", billingMonth)
          .order("due_date", { ascending: true });
        if (error) return toError(error.message);
        return { data: (data ?? []) as RentPayment[] };
      },
      providesTags: (_r, _e, month) => [
        { type: "Rents", id: month },
        { type: "Rents", id: "LIST" },
      ],
    }),

    getTenantRents: builder.query<RentPayment[], string>({
      async queryFn(tenantId) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("rent_payments")
          .select("*")
          .eq("tenant_id", tenantId)
          .order("billing_month", { ascending: false });
        if (error) return toError(error.message);
        return { data: (data ?? []) as RentPayment[] };
      },
      providesTags: (_r, _e, tenantId) => [
        { type: "Rents", id: `tenant-${tenantId}` },
      ],
    }),

    getUtilityBillsByMonth: builder.query<UtilityBill[], string>({
      async queryFn(monthValue) {
        const supabase = createClient();
        const billingMonth = monthInputToBillingDate(monthValue);
        const { data, error } = await supabase
          .from("utility_bills")
          .select(
            "*, tenants(id, name, property_unit, electricity_ref, gas_ref)"
          )
          .eq("billing_month", billingMonth)
          .order("created_at", { ascending: false });
        if (error) return toError(error.message);
        return { data: (data ?? []) as UtilityBill[] };
      },
      providesTags: (_r, _e, month) => [
        { type: "UtilityBills", id: month },
        { type: "UtilityBills", id: "LIST" },
      ],
    }),

    getReminders: builder.query<Reminder[], void>({
      async queryFn() {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("reminders")
          .select("*")
          .order("next_due_date", { ascending: true });
        if (error) return toError(error.message);
        return { data: (data ?? []) as Reminder[] };
      },
      providesTags: [{ type: "Reminders", id: "LIST" }],
    }),

    createTenant: builder.mutation<{ success: true }, FormValues>({
      async queryFn(values) {
        const payload = tenantPayloadFromValues(values);
        if (!payload.name || !payload.property_unit) {
          return toError("Name and property/unit are required.");
        }
        const supabase = createClient();
        const { error } = await supabase.from("tenants").insert(payload);
        if (error) return toError(error.message);
        return { data: { success: true } };
      },
      invalidatesTags: ["Tenants", "Tenant"],
    }),

    updateTenant: builder.mutation<
      { success: true },
      { tenantId: string; values: FormValues }
    >({
      async queryFn({ tenantId, values }) {
        const payload = tenantPayloadFromValues(values);
        const supabase = createClient();
        const { error } = await supabase
          .from("tenants")
          .update(payload)
          .eq("id", tenantId);
        if (error) return toError(error.message);
        return { data: { success: true } };
      },
      invalidatesTags: (_r, _e, { tenantId }) => [
        "Tenants",
        { type: "Tenant", id: tenantId },
        "Rents",
      ],
    }),

    deleteTenant: builder.mutation<{ success: true }, string>({
      async queryFn(tenantId) {
        const supabase = createClient();
        const { error } = await supabase
          .from("tenants")
          .delete()
          .eq("id", tenantId);
        if (error) return toError(error.message);
        return { data: { success: true } };
      },
      invalidatesTags: ["Tenants", "Tenant", "Rents", "UtilityBills"],
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
      },
      invalidatesTags: ["Rents"],
    }),

    generateMonthRents: builder.mutation<
      { success: true; created: number },
      string
    >({
      async queryFn(monthValue) {
        const supabase = createClient();
        const billingMonth = monthInputToBillingDate(monthValue);
        const { data, error } = await supabase.rpc("generate_monthly_rents", {
          p_billing_month: billingMonth,
        });
        if (error) return toError(error.message);
        return { data: { success: true, created: (data as number) ?? 0 } };
      },
      invalidatesTags: ["Rents"],
    }),

    createUtilityBill: builder.mutation<{ success: true }, FormValues>({
      async queryFn(values) {
        const tenantId = String(values.tenant_id || "").trim();
        const utilityType = String(values.utility_type || "") as UtilityType;
        const monthValue = String(values.month || "").trim();
        const amount = Number(values.amount || 0);
        const dueDate = String(values.due_date || "").trim() || null;
        const referenceSnapshot =
          String(values.reference_snapshot || "").trim() || null;
        const notes = String(values.notes || "").trim() || null;
        const status = (String(
          values.status || "pending"
        ) as UtilityBillStatus);

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
      },
      invalidatesTags: ["UtilityBills"],
    }),

    updateUtilityBillStatus: builder.mutation<
      { success: true },
      { billId: string; status: UtilityBillStatus }
    >({
      async queryFn({ billId, status }) {
        const supabase = createClient();
        const { error } = await supabase
          .from("utility_bills")
          .update({ status })
          .eq("id", billId);
        if (error) return toError(error.message);
        return { data: { success: true } };
      },
      invalidatesTags: ["UtilityBills"],
    }),

    deleteUtilityBill: builder.mutation<{ success: true }, string>({
      async queryFn(billId) {
        const supabase = createClient();
        const { error } = await supabase
          .from("utility_bills")
          .delete()
          .eq("id", billId);
        if (error) return toError(error.message);
        return { data: { success: true } };
      },
      invalidatesTags: ["UtilityBills"],
    }),

    createReminder: builder.mutation<{ success: true }, FormValues>({
      async queryFn(values) {
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
      },
      invalidatesTags: ["Reminders"],
    }),

    toggleReminderDone: builder.mutation<
      { success: true },
      { reminderId: string; isDone: boolean }
    >({
      async queryFn({ reminderId, isDone }) {
        const supabase = createClient();
        const { error } = await supabase
          .from("reminders")
          .update({ is_done: isDone })
          .eq("id", reminderId);
        if (error) return toError(error.message);
        return { data: { success: true } };
      },
      invalidatesTags: ["Reminders"],
    }),

    deleteReminder: builder.mutation<{ success: true }, string>({
      async queryFn(reminderId) {
        const supabase = createClient();
        const { error } = await supabase
          .from("reminders")
          .delete()
          .eq("id", reminderId);
        if (error) return toError(error.message);
        return { data: { success: true } };
      },
      invalidatesTags: ["Reminders"],
    }),
  }),
});

export const {
  useGetTenantsQuery,
  useGetActiveTenantsQuery,
  useGetTenantQuery,
  useGetRentsByMonthQuery,
  useGetTenantRentsQuery,
  useGetUtilityBillsByMonthQuery,
  useGetRemindersQuery,
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
} = api;
