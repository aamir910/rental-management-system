"use server";

import { signOut as authSignOut } from "@/lib/auth/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Demo env may be missing; still clear Auth.js
  }

  try {
    await authSignOut({ redirect: false });
  } catch {
    // Paid session may not exist
  }

  redirect("/login");
}
