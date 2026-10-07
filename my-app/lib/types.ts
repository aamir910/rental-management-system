export type TenantStatus = "active" | "inactive";
export type RentStatus = "pending" | "partial" | "paid" | "overdue";
export type UtilityType = "electricity" | "gas";
export type UtilityBillStatus = "pending" | "success";
export type ReminderFrequency = "daily" | "weekly" | "monthly";

export type Profile = {
  id: string;
  full_name: string | null;
  role: "admin";
  created_at: string;
};

export type Tenant = {
  id: string;
  name: string;
  phone: string | null;
  cnic: string | null;
  property_unit: string;
  monthly_rent: number;
  move_in_date: string | null;
  electricity_ref: string | null;
  gas_ref: string | null;
  status: TenantStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type RentPayment = {
  id: string;
  tenant_id: string;
  billing_month: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: RentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  tenants?: Pick<Tenant, "id" | "name" | "property_unit" | "phone" | "monthly_rent" | "status">;
};

export type TenantFormData = {
  name: string;
  phone: string;
  cnic: string;
  property_unit: string;
  monthly_rent: string;
  move_in_date: string;
  electricity_ref: string;
  gas_ref: string;
  status: TenantStatus;
  notes: string;
};

export type UtilityBill = {
  id: string;
  tenant_id: string;
  utility_type: UtilityType;
  billing_month: string;
  amount: number;
  due_date: string | null;
  status: UtilityBillStatus;
  reference_snapshot: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  tenants?: Pick<
    Tenant,
    "id" | "name" | "property_unit" | "electricity_ref" | "gas_ref"
  >;
};

export type Reminder = {
  id: string;
  title: string;
  body: string | null;
  frequency: ReminderFrequency;
  next_due_date: string;
  is_done: boolean;
  created_at: string;
  updated_at: string;
};

export type ExpenseEntryType = "in" | "out";

export type ExpenseEntry = {
  id: string;
  entry_type: ExpenseEntryType;
  amount: number;
  title: string;
  notes: string | null;
  occurred_at: string;
  created_at: string;
  updated_at: string;
};
