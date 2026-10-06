"use server";

import { createClient } from "@/lib/supabase/server";
import type { RentStatus, TenantStatus } from "@/lib/types";
import { monthInputToBillingDate } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
