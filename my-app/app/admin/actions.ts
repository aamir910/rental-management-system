"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  ReminderFrequency,
  RentStatus,
  TenantStatus,
  UtilityBillStatus,
  UtilityType,
} from "@/lib/types";
import { monthInputToBillingDate } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function revalidateHome() {
  revalidatePath("/admin/home");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createTenant(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim() || null,
    cnic: String(formData.get("cnic") || "").trim() || null,
    property_unit: String(formData.get("property_unit") || "").trim(),
    monthly_rent: Number(formData.get("monthly_rent") || 0),
    move_in_date: String(formData.get("move_in_date") || "").trim() || null,
    electricity_ref: String(formData.get("electricity_ref") || "").trim() || null,
    gas_ref: String(formData.get("gas_ref") || "").trim() || null,
    status: (String(formData.get("status") || "active") as TenantStatus),
    notes: String(formData.get("notes") || "").trim() || null,
  };

  if (!payload.name || !payload.property_unit) {
    return { error: "Name and property/unit are required." };
  }

  const { error } = await supabase.from("tenants").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/tenants");
  revalidatePath("/admin/rents");
  return { success: true };
}

export async function updateTenant(tenantId: string, formData: FormData) {
  const supabase = await createClient();

  const payload = {
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim() || null,
    cnic: String(formData.get("cnic") || "").trim() || null,
    property_unit: String(formData.get("property_unit") || "").trim(),
    monthly_rent: Number(formData.get("monthly_rent") || 0),
    move_in_date: String(formData.get("move_in_date") || "").trim() || null,
    electricity_ref: String(formData.get("electricity_ref") || "").trim() || null,
    gas_ref: String(formData.get("gas_ref") || "").trim() || null,
    status: (String(formData.get("status") || "active") as TenantStatus),
    notes: String(formData.get("notes") || "").trim() || null,
  };

  const { error } = await supabase
    .from("tenants")
    .update(payload)
    .eq("id", tenantId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/tenants");
  revalidatePath(`/admin/tenants/${tenantId}`);
  revalidatePath("/admin/rents");
  return { success: true };
}

export async function deleteTenant(tenantId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("tenants").delete().eq("id", tenantId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/tenants");
  revalidatePath("/admin/rents");
  return { success: true };
}

export async function updateRentPayment(
  rentId: string,
  data: {
    amount_paid?: number;
    due_date?: string;
    status?: RentStatus;
    notes?: string | null;
  }
) {
  const supabase = await createClient();

  const { data: current, error: fetchError } = await supabase
    .from("rent_payments")
    .select("amount_due, amount_paid")
    .eq("id", rentId)
    .single();

  if (fetchError) return { error: fetchError.message };

  const amountPaid =
    data.amount_paid !== undefined ? data.amount_paid : Number(current.amount_paid);
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

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/rents");
  revalidatePath("/admin/tenants");
  return { success: true };
}

export async function generateMonthRents(monthValue: string) {
  const supabase = await createClient();
  const billingMonth = monthInputToBillingDate(monthValue);

  const { data, error } = await supabase.rpc("generate_monthly_rents", {
    p_billing_month: billingMonth,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/rents");
  return { success: true, created: data as number };
}

export async function createUtilityBill(formData: FormData) {
  const supabase = await createClient();

  const tenantId = String(formData.get("tenant_id") || "").trim();
  const utilityType = String(formData.get("utility_type") || "") as UtilityType;
  const monthValue = String(formData.get("month") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const dueDate = String(formData.get("due_date") || "").trim() || null;
  const referenceSnapshot =
    String(formData.get("reference_snapshot") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const status = (String(formData.get("status") || "pending") as UtilityBillStatus);

  if (!tenantId || !utilityType || !monthValue) {
    return { error: "Tenant, utility type, and month are required." };
  }

  if (utilityType !== "electricity" && utilityType !== "gas") {
    return { error: "Invalid utility type." };
  }

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

  if (error) return { error: error.message };

  revalidateHome();
  return { success: true };
}

export async function updateUtilityBillStatus(
  billId: string,
  status: UtilityBillStatus
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("utility_bills")
    .update({ status })
    .eq("id", billId);

  if (error) return { error: error.message };

  revalidateHome();
  return { success: true };
}

export async function deleteUtilityBill(billId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("utility_bills").delete().eq("id", billId);

  if (error) return { error: error.message };

  revalidateHome();
  return { success: true };
}

export async function createReminder(formData: FormData) {
  const supabase = await createClient();

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim() || null;
  const frequency = String(formData.get("frequency") || "") as ReminderFrequency;
  const nextDueDate = String(formData.get("next_due_date") || "").trim();

  if (!title || !frequency || !nextDueDate) {
    return { error: "Title, frequency, and next due date are required." };
  }

  if (!["daily", "weekly", "monthly"].includes(frequency)) {
    return { error: "Invalid frequency." };
  }

  const { error } = await supabase.from("reminders").insert({
    title,
    body,
    frequency,
    next_due_date: nextDueDate,
    is_done: false,
  });

  if (error) return { error: error.message };

  revalidateHome();
  return { success: true };
}

export async function toggleReminderDone(reminderId: string, isDone: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reminders")
    .update({ is_done: isDone })
    .eq("id", reminderId);

  if (error) return { error: error.message };

  revalidateHome();
  return { success: true };
}

export async function deleteReminder(reminderId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("reminders").delete().eq("id", reminderId);

  if (error) return { error: error.message };

  revalidateHome();
  return { success: true };
}
