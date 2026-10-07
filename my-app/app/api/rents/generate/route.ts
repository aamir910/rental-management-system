import { withAdapter } from "@/lib/api/helpers";
import { jsonError } from "@/lib/data/getAdapter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const month = String(body.month || "");
    if (!month) throw new Error("month is required.");

    return withAdapter(async (adapter) => {
      const created = await adapter.generateMonthRents(month);
      return { success: true as const, created };
    });
  } catch (err) {
    return jsonError(err);
  }
}
