import { AdminShell } from "@/components/admin/AdminShell";
import { auth } from "@/lib/auth/auth";
import { createClient } from "@/lib/supabase/server";
import { StoreProvider } from "@/lib/store/StoreProvider";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let email = session?.user?.email ?? null;

  if (!session?.user) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect("/login");
    }
    email = user.email ?? null;
  }

  return (
    <StoreProvider>
      <AdminShell email={email}>{children}</AdminShell>
    </StoreProvider>
  );
}
