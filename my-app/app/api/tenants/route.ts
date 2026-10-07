import { withAdapter } from "@/lib/api/helpers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") === "1";

  return withAdapter(async (adapter) => {
    if (activeOnly) return adapter.listActiveTenants();
    return adapter.listTenants();
  });
}

export async function POST(request: Request) {
  const values = await request.json();
  return withAdapter(async (adapter) => {
    const tenant = await adapter.createTenant(values);
    return { success: true as const, tenant };
  });
}
