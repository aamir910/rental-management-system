export type TenantStatus = "active" | "inactive";
export type RentStatus = "pending" | "partial" | "paid" | "overdue";

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
  status: TenantStatus;
  notes: string;
};
