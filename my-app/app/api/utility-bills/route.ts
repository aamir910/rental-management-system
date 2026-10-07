import { withAdapter } from "@/lib/api/helpers";
import { jsonError } from "@/lib/data/getAdapter";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  if (!month) return jsonError(new Error("month query param is required."));

  return withAdapter(async (adapter) => adapter.listUtilityBillsByMonth(month));
}

export async function POST(request: Request) {
  try {
    const values = await request.json();
    return withAdapter(async (adapter) => {
      await adapter.createUtilityBill(values);
      return { success: true as const };
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const billId = String(body.billId || "");
    const status = body.status;
    if (!billId || !status) throw new Error("billId and status are required.");

    return withAdapter(async (adapter) => {
      await adapter.updateUtilityBillStatus(billId, status);
      return { success: true as const };
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const billId = searchParams.get("id");
  if (!billId) return jsonError(new Error("id query param is required."));

  return withAdapter(async (adapter) => {
    await adapter.deleteUtilityBill(billId);
    return { success: true as const };
  });
}
