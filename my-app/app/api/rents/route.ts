import { withAdapter } from "@/lib/api/helpers";
import { jsonError } from "@/lib/data/getAdapter";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const tenantId = searchParams.get("tenantId");

  return withAdapter(async (adapter) => {
    if (tenantId) return adapter.listTenantRents(tenantId);
    if (!month) throw new Error("month query param is required.");
    return adapter.listRentsByMonth(month);
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const rentId = String(body.rentId || "");
    if (!rentId) throw new Error("rentId is required.");

    return withAdapter(async (adapter) => {
      await adapter.updateRentPayment(rentId, {
        amount_paid: body.amount_paid,
        due_date: body.due_date,
        status: body.status,
        notes: body.notes,
        payment_channel: body.payment_channel,
        account_provider: body.account_provider,
      });
      return { success: true as const };
    });
  } catch (err) {
    return jsonError(err);
  }
}
