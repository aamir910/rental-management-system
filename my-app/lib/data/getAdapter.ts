import { auth } from "@/lib/auth/auth";
import { createMongoAdapter } from "@/lib/data/mongoAdapter";
import { createSupabaseAdapter } from "@/lib/data/supabaseAdapter";
import type { DataAdapter } from "@/lib/data/types";
import { NextResponse } from "next/server";

export type SessionUser = {
  id: string;
  email: string;
  plan: "demo" | "paid";
};

export async function getAdapterForSession(): Promise<
  | { adapter: DataAdapter; user: SessionUser }
  | { error: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const plan: "demo" | "paid" =
    session.user.plan === "paid" ? "paid" : "demo";
  const user: SessionUser = {
    id: session.user.id,
    email: session.user.email,
    plan,
  };
  const ctx = { ownerId: user.id, plan } as const;

  const adapter =
    plan === "paid" ? createMongoAdapter(ctx) : createSupabaseAdapter(ctx);

  return { adapter, user };
}

export function jsonError(err: unknown, status = 400) {
  const message = err instanceof Error ? err.message : "Request failed.";
  return NextResponse.json({ error: message }, { status });
}
