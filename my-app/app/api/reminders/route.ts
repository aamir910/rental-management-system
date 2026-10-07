import { withAdapter } from "@/lib/api/helpers";
import { jsonError } from "@/lib/data/getAdapter";

export async function GET() {
  return withAdapter(async (adapter) => adapter.listReminders());
}

export async function POST(request: Request) {
  try {
    const values = await request.json();
    return withAdapter(async (adapter) => {
      await adapter.createReminder(values);
      return { success: true as const };
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const reminderId = String(body.reminderId || "");
    if (!reminderId) throw new Error("reminderId is required.");

    return withAdapter(async (adapter) => {
      await adapter.toggleReminderDone(reminderId, Boolean(body.isDone));
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
    await adapter.deleteReminder(id);
    return { success: true as const };
  });
}
