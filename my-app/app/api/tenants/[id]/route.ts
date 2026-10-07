import { withAdapter } from "@/lib/api/helpers";
import { jsonError } from "@/lib/data/getAdapter";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  return withAdapter(async (adapter) => {
    const tenant = await adapter.getTenant(id);
    if (!tenant) throw new Error("Tenant not found.");
    return tenant;
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const values = await request.json();
    return withAdapter(async (adapter) => {
      await adapter.updateTenant(id, values);
      return { success: true as const };
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return withAdapter(async (adapter) => {
    await adapter.deleteTenant(id);
    return { success: true as const };
  });
}
