import { withAdapter } from "@/lib/api/helpers";
import { jsonError } from "@/lib/data/getAdapter";
import { toMonthInputValue, firstOfMonth } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month =
    searchParams.get("month") || toMonthInputValue(firstOfMonth());
  return withAdapter(async (adapter) => adapter.listExpensesByMonth(month));
}

export async function POST(request: Request) {
  try {
    const values = await request.json();
    return withAdapter(async (adapter) => {
      await adapter.createExpense(values);
      return { success: true as const };
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return jsonError(new Error("id query param is required."));

  return withAdapter(async (adapter) => {
    await adapter.deleteExpense(id);
    return { success: true as const };
  });
}
