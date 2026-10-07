import {
  getAdapterForSession,
  jsonError,
  type SessionUser,
} from "@/lib/data/getAdapter";
import type { DataAdapter } from "@/lib/data/types";
import { NextResponse } from "next/server";

export async function withAdapter(
  fn: (adapter: DataAdapter, user: SessionUser) => Promise<unknown>
) {
  const result = await getAdapterForSession();
  if ("error" in result) return result.error;
  try {
    const data = await fn(result.adapter, result.user);
    return NextResponse.json(data);
  } catch (err) {
    return jsonError(err, 400);
  }
}
