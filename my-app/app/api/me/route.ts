import { getAdapterForSession, jsonError } from "@/lib/data/getAdapter";
import { DEMO_TENANT_LIMIT } from "@/lib/data/types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await getAdapterForSession();
    if ("error" in result) return result.error;

    const tenantCount = await result.adapter.countTenants();
    return NextResponse.json({
      id: result.user.id,
      email: result.user.email,
      plan: result.user.plan,
      tenantCount,
      tenantLimit: result.user.plan === "demo" ? DEMO_TENANT_LIMIT : null,
    });
  } catch (err) {
    return jsonError(err, 500);
  }
}
